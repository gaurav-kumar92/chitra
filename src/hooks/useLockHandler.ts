
'use client';

import { useCallback, useEffect, useMemo } from 'react';

// Use global Konva types if available, otherwise fallback to any
type KNode = any;
type Transformer = any;

const LOCK_ATTR = 'isLocked';

// Anchors to allow when selection has NO locked nodes
const DEFAULT_ANCHORS = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

type Options = {
  // You can pass either a transformer instance or a ref
  transformer?: Transformer | React.RefObject<Transformer>;
  forceRecord?: () => void;     // Optional: history checkpoint (omit if you don’t want lock in history)
  blockPointer?: boolean;       // Keep false to allow selecting locked nodes
  unlockedAnchors?: string[];   // Custom anchors when there are no locked nodes in selection
  onLocked?: (lockedNodes: KNode[]) => void; // e.g., to clear selection (optional)
};

function getTransformerInstance(
  tr?: Transformer | React.RefObject<Transformer>
): Transformer | undefined {
  if (!tr) return undefined;
  return (tr as React.RefObject<Transformer>).current
    ? (tr as React.RefObject<Transformer>).current!
    : (tr as Transformer);
}

export function useLockHandler(
  selectedNodes: KNode[],
  setSelectedNodes: React.Dispatch<React.SetStateAction<KNode[]>>,
  options?: Options
) {
  const {
    transformer,
    forceRecord,
    blockPointer = false,          // keep false so locked nodes are still selectable
    unlockedAnchors = DEFAULT_ANCHORS,
    onLocked,
  } = options || {};

  const tr = getTransformerInstance(transformer);

  const isAnySelectedLocked = useMemo(
    () => selectedNodes.some(n => !!n?.getAttr?.(LOCK_ATTR)),
    [selectedNodes]
  );

  const isSelectionLocked = useMemo(
    () => selectedNodes.length > 0 && selectedNodes.every(n => !!n?.getAttr?.(LOCK_ATTR)),
    [selectedNodes]
  );

  const redrawLayers = useCallback((nodes: KNode[]) => {
    const layers = new Set<any>();
    nodes.forEach(n => {
      const l = n.getLayer();
      if (l) layers.add(l);
    });
    layers.forEach(l => l.batchDraw());
  }, []);

  const configureTransformerUI = useCallback(() => {
    if (!tr) return;

    const nodes = selectedNodes.filter(Boolean);
    // Always reflect current selection in the transformer (including locked nodes)
    tr.nodes(nodes);

    if (nodes.length === 0) {
      tr.getLayer()?.batchDraw();
      return;
    }

    // If ANY node is locked -> show only the border (no anchors/rotation)
    const hasLocked = nodes.some(n => !!n.getAttr(LOCK_ATTR));
    if (hasLocked) {
      tr.enabledAnchors([]);          // hide anchors
      tr.rotateEnabled(false);        // no rotation handle
      tr.borderEnabled(true);         // keep the selection border visible
      tr.anchorEnabled(false);        // safety: turn off anchor interactivity
    } else {
      tr.enabledAnchors(unlockedAnchors);
      tr.rotateEnabled(true);
      tr.borderEnabled(true);
      tr.anchorEnabled(true);
    }

    // Force refresh
    (tr as any).forceUpdate?.();
    tr.getLayer()?.batchDraw();
  }, [tr, selectedNodes, unlockedAnchors]);

  const lock = useCallback(() => {
    if (selectedNodes.length === 0) return;

    selectedNodes.forEach(node => {
      node.setAttr(LOCK_ATTR, true);
      node.draggable(false);
      if (blockPointer) node.listening(false); // if true, you won't be able to select it
    });
   // ✅ Force React to re-render and recompute isSelectionLocked
  setSelectedNodes(prev => [...prev]);


    configureTransformerUI();
    redrawLayers(selectedNodes);

    onLocked?.(selectedNodes); // optional hook for caller (e.g., clear selection)
    forceRecord?.();           // omit if you don’t want lock in history
  }, [selectedNodes, blockPointer, configureTransformerUI, redrawLayers, onLocked, forceRecord, setSelectedNodes]);

  const unlock = useCallback(() => {
    if (selectedNodes.length === 0) return;

    selectedNodes.forEach(node => {
      node.setAttr(LOCK_ATTR, false);
      node.draggable(true);
      node.listening(true);
    });
     // ✅ Force React to re-render
  setSelectedNodes(prev => [...prev]);

    configureTransformerUI();
    redrawLayers(selectedNodes);

    forceRecord?.();           // omit if you don’t want unlock in history
  }, [selectedNodes, configureTransformerUI, redrawLayers, forceRecord, setSelectedNodes]);

  const toggleLock = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const allLocked = selectedNodes.every(n => !!n.getAttr(LOCK_ATTR));
    allLocked ? unlock() : lock();
  }, [selectedNodes, lock, unlock]);

  // Keep transformer UI in sync when selection changes
  useEffect(() => {
    configureTransformerUI();
  }, [configureTransformerUI]);

  const isNodeLocked = useCallback(
    (node: KNode | null | undefined) => !!node?.getAttr?.(LOCK_ATTR),
    []
  );

  return {
    // state
    isAnySelectedLocked,
    isSelectionLocked,
    // actions
    lock,
    unlock,
    toggleLock,
    // utils
    isNodeLocked,
  };
}
