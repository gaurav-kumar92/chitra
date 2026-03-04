
// src/hooks/useCanvasChangeTracker.ts
'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useHistory } from './useHistory';

type AddedDeletedNode = { id: string; json: any };
type UpdatedNode = { id: string; attrs: any };
type BatchCommand = {
  type: 'BATCH';
  added: AddedDeletedNode[];
  deleted: AddedDeletedNode[];
  updatedBefore: UpdatedNode[];
  updatedAfter: UpdatedNode[];
};

type Command =
  | { type: 'ADD'; after: AddedDeletedNode[] }
  | { type: 'DELETE'; before: AddedDeletedNode[] }
  | { type: 'UPDATE'; before: UpdatedNode[]; after: UpdatedNode[] }
  | BatchCommand;

// ----------------------- utils
const deepcopy = <T,>(v: T): T => {
    // structuredClone is fast but fails on complex objects with functions (like Konva nodes).
    // A deep JSON stringify/parse is a safe fallback for plain objects.
    try {
        return structuredClone(v);
    } catch (e) {
        return JSON.parse(JSON.stringify(v));
    }
};

const getPlainAttrs = (node: any) => {
    // Use toObject() which provides a serializable representation of the node,
    // avoiding issues with non-cloneable properties like HTMLImageElement.
    return node?.toObject?.() ?? {};
};


const invert = (cmd: Command): Command => {
  switch (cmd.type) {
    case 'ADD':
      return { type: 'DELETE', before: deepcopy(cmd.after ?? []) };
    case 'DELETE':
      return { type: 'ADD', after: deepcopy(cmd.before ?? []) };
    case 'UPDATE':
      return {
        type: 'UPDATE',
        before: deepcopy(cmd.after ?? []),
        after: deepcopy(cmd.before ?? []),
      };
    case 'BATCH':
      return {
        type: 'BATCH',
        added: deepcopy(cmd.deleted ?? []),
        deleted: deepcopy(cmd.added ?? []),
        updatedBefore: deepcopy(cmd.updatedAfter ?? []),
        updatedAfter: deepcopy(cmd.updatedBefore ?? []),
      };
  }
};

// ----------------------- hook
export const useCanvasChangeTracker = (
  canvasRef: React.RefObject<{ stage: any; layer: any }>,
  isCanvasReady: boolean
) => {
  // Your useHistory returns the original command; we will invert for Undo in this hook.
  const { record, undo: historyUndo, redo: historyRedo, canUndo, canRedo } =
    useHistory<Command>(30);

  const isRestoringRef = useRef(false);
  const snapshotRef = useRef<Map<string, any>>(new Map());
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store "before" attrs for transforms by id
  const transformStartRef = useRef<Map<string, UpdatedNode>>(new Map());

  const isRealSnapshotNode = useCallback((node: any) => {
    const className =
      typeof node?.getClassName === 'function' ? node.getClassName() : '';
    const isTransformer =
      className === 'Transformer' || node?.hasName?.('Transformer');
    const isBackground = node?.name?.() === 'background';
    const hasId = typeof node?.id === 'function' && !!node.id();
    return hasId && !isTransformer && !isBackground;
  }, []);

  const takeSnapshot = useCallback(() => {
    if (!canvasRef.current?.layer) return new Map<string, any>();
    const layer = canvasRef.current.layer;
    const snapshot = new Map<string, any>();
    layer
      .getChildren((node: any) => isRealSnapshotNode(node))
      .forEach((node: any) => {
        snapshot.set(node.id(), {
          id: node.id(),
          className: node.getClassName?.(),
          json: node.toObject(), // full Konva JSON (safe to recreate)
        });
      });
    return snapshot;
  }, [canvasRef, isRealSnapshotNode]);

  // ---------- structural diff (keep this for true ADD/DELETE changes)
  const detectChanges = useCallback((oldSnap: Map<string, any>, newSnap: Map<string, any>) => {
    const added: AddedDeletedNode[] = [];
    const deleted: AddedDeletedNode[] = [];
    const updated: Array<{ before: UpdatedNode; after: UpdatedNode }> = [];

    newSnap.forEach((newNode: any, id: string) => {
      const oldNode = oldSnap.get(id);
      if (!oldNode) {
        added.push({ id: newNode.id, json: newNode.json });
      } else {
        const oldAttrs = JSON.stringify(oldNode.json.attrs ?? {});
        const newAttrs = JSON.stringify(newNode.json.attrs ?? {});
        if (oldAttrs !== newAttrs) {
          updated.push({
            before: { id: oldNode.id, attrs: oldNode.json },
            after: { id: newNode.id, attrs: newNode.json },
          });
        }
      }
    });

    oldSnap.forEach((oldNode: any, id: string) => {
      if (!newSnap.has(id)) {
        deleted.push({ id: oldNode.id, json: oldNode.json });
      }
    });

    return { added, deleted, updated };
  }, []);

  const recordChanges = useCallback(() => {
    if (isRestoringRef.current) return;
    const current = takeSnapshot();
    const diff = detectChanges(snapshotRef.current, current);

    // We only record ADD/DELETE here. UPDATEs from transforms will be recorded explicitly.
    if (diff.added.length > 0) record({ type: 'ADD', after: diff.added });
    if (diff.deleted.length > 0) record({ type: 'DELETE', before: diff.deleted });

    snapshotRef.current = current;
  }, [takeSnapshot, detectChanges, record]);

  // ---------- schedule structural detection (not for transforms)
  const scheduleChangeDetection = useCallback(() => {
    if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
    changeTimeoutRef.current = setTimeout(recordChanges, 300);
  }, [recordChanges]);

  // ---------- explicit transform capture
  const handleTransformStart = useCallback((e: any) => {
    if (!e?.target) return;
    const node = e.target;
    if (!isRealSnapshotNode(node)) return;

    const id = node.id();
    const beforeAttrs = getPlainAttrs(node);
    transformStartRef.current.set(id, { id, attrs: beforeAttrs });
  }, [isRealSnapshotNode]);

  const handleTransformEnd = useCallback((e: any) => {
    if (!e?.target) return;
    const node = e.target;
    if (!isRealSnapshotNode(node)) return;

    const id = node.id();
    const before = transformStartRef.current.get(id);
    if (!before) return; // no paired start; do nothing

    const afterAttrs = getPlainAttrs(node);

    // Record single UPDATE for this interaction
    record({
      type: 'UPDATE',
      before: [deepcopy(before)],
      after: [{ id, attrs: afterAttrs }],
    });

    // clear and refresh baseline snapshot
    transformStartRef.current.delete(id);
    snapshotRef.current = takeSnapshot();
  }, [record, isRealSnapshotNode, takeSnapshot]);

  // ---------- apply forward (used for redo and for undo after invert)
  const applyForward = useCallback((layer: any, command: Command) => {
    const KONVA = (window as any)?.Konva;

    switch (command.type) {
      case 'ADD': {
        command.after?.forEach(({ id, json }) => {
          // replace if exists (avoid duplicates)
          const existing = layer.findOne(`#${id}`);
          if (existing) existing.destroy();
          const node = KONVA?.Node?.create ? KONVA.Node.create(json) : null;
          if (node) layer.add(node);
        });
        break;
      }
      case 'DELETE': {
        command.before?.forEach(({ id }) => {
          layer.findOne(`#${id}`)?.destroy();
        });
        break;
      }
      case 'UPDATE': {
        command.after?.forEach(({ id, attrs }) => {
          const node = layer.findOne(`#${id}`);
          if (node) node.setAttrs(attrs);
        });
        break;
      }
      case 'BATCH': {
        command.added?.forEach(({ id, json }) => {
          const existing = layer.findOne(`#${id}`);
          if (existing) existing.destroy();
          const node = KONVA?.Node?.create ? KONVA.Node.create(json) : null;
          if (node) layer.add(node);
        });
        command.deleted?.forEach(({ id }) => {
          layer.findOne(`#${id}`)?.destroy();
        });
        command.updatedAfter?.forEach(({ id, attrs }) => {
          const node = layer.findOne(`#${id}`);
          if (node) node.setAttrs(attrs);
        });
        break;
      }
    }
    layer.batchDraw();
  }, []);

  // ---------- UNDO/REDO (invert for Undo, forward for Redo)
  const undo = useCallback(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    const original = historyUndo(); // original command
    if (!original) return;

    isRestoringRef.current = true;
    try {
      const inverted = invert(original);
      applyForward(layer, inverted);
    } finally {
      setTimeout(() => {
        snapshotRef.current = takeSnapshot();
        isRestoringRef.current = false;
        canvasRef.current?.stage?.fire('history:applied');
      }, 60);
    }
  }, [canvasRef, historyUndo, takeSnapshot, applyForward]);

  const redo = useCallback(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    const cmd = historyRedo(); // original forward command
    if (!cmd) return;

    isRestoringRef.current = true;
    try {
      applyForward(layer, cmd);
    } finally {
      setTimeout(() => {
        snapshotRef.current = takeSnapshot();
        isRestoringRef.current = false;
        canvasRef.current?.stage?.fire('history:applied');
      }, 60);
    }
  }, [canvasRef, historyRedo, takeSnapshot, applyForward]);

  // ---------- wiring
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.stage || !canvasRef.current?.layer) return;

    const stage = canvasRef.current.stage;
    const layer = canvasRef.current.layer;

    // baseline
    snapshotRef.current = takeSnapshot();

    // Listen to transform/drag start/end for explicit UPDATEs
    stage.on('transformstart', handleTransformStart);
    stage.on('dragstart', handleTransformStart);

    // IMPORTANT: we handle transform/drag *end* explicitly,
    // so we DO NOT trigger snapshot-diff from these events anymore.
    stage.on('transformend', handleTransformEnd);
    stage.on('dragend', handleTransformEnd);

    // Still watch for structural add/remove via polling
    const checkForChanges = setInterval(() => {
      const count = layer.getChildren((n: any) => isRealSnapshotNode(n)).length;
      if (count !== snapshotRef.current.size) {
        // now run only ADD/DELETE detection
        recordChanges();
      }
    }, 500);

    return () => {
      stage.off('transformstart', handleTransformStart);
      stage.off('dragstart', handleTransformStart);
      stage.off('transformend', handleTransformEnd);
      stage.off('dragend', handleTransformEnd);
      clearInterval(checkForChanges);
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
    };
  }, [
    isCanvasReady,
    canvasRef,
    takeSnapshot,
    handleTransformStart,
    handleTransformEnd,
    isRealSnapshotNode,
    recordChanges,
  ]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    // still expose these in case you need to force structural records
    forceRecord: recordChanges,
    runAsSingleHistoryStep: (mutate: () => void) => {
      // keep your existing batch helper if you use it elsewhere
      if (!canvasRef.current?.layer) return;
      const before = takeSnapshot();
      isRestoringRef.current = true;
      try {
        mutate();
      } finally {
        const after = takeSnapshot();
        isRestoringRef.current = false;

        const diff = detectChanges(before, after);
        const batch: BatchCommand = {
          type: 'BATCH',
          added: diff.added,
          deleted: diff.deleted,
          updatedBefore: diff.updated.map((u) => u.before),
          updatedAfter: diff.updated.map((u) => u.after),
        };

        if (batch.added.length || batch.deleted.length || batch.updatedBefore.length) {
          record(batch);
        }
        snapshotRef.current = after;
      }
    },
  };
};
