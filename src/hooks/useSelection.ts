
'use client';

import { useEffect, useRef, Dispatch, SetStateAction, useCallback } from 'react';

type UseSelectionProps = {
  isCanvasReady: boolean;
  canvasRef: React.RefObject<{ stage: any; layer: any }>;
  isMultiSelectMode: boolean;
  selectedNodes: any[];
  setSelectedNodes: Dispatch<SetStateAction<any[]>>;
};

export const useSelection = ({
  isCanvasReady,
  canvasRef,
  isMultiSelectMode,
  selectedNodes,
  setSelectedNodes,
}: UseSelectionProps) => {
  const selectionRectRef = useRef<any>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);
  const transformerRef = useRef<any>(null);

  const isTransformer = useCallback((node: any) => {
    if (!node) return false;
    const className = typeof node.getClassName === 'function' ? node.getClassName() : '';
    // Konva minified names like 'ni' sometimes appear for Transformers in CDN versions
    return (
      className === 'Transformer' || 
      node.name() === 'Transformer' || 
      node.hasName('Transformer') ||
      (node.constructor && (node.constructor.name === 'Transformer' || node.constructor.name === 'ni'))
    );
  }, []);

  const isLayerOrStage = useCallback((node: any) => {
    if (!node || typeof node.getType !== 'function') return false;
    const type = node.getType();
    return type === 'Layer' || type === 'Stage';
  }, []);

  const isBackgroundTarget = useCallback((t: any, stage: any) => {
    return t === stage || t?.name?.() === 'background' || isLayerOrStage(t);
  }, [isLayerOrStage]);

  // Setup/Cleanup Effect
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.stage || !canvasRef.current?.layer || !window.Konva) return;

    const stage = canvasRef.current.stage;
    const layer = canvasRef.current.layer;

    // Aggressive cleanup: remove any existing utility nodes to prevent circular hierarchy leaks
    layer.find('.selection-rect').forEach((n: any) => n.destroy());
    layer.find('Transformer').forEach((n: any) => n.destroy());

    const rect = new window.Konva.Rect({
      name: 'selection-rect',
      visible: false,
      fill: 'rgba(168, 85, 247, 0.15)',
      stroke: '#a855f7',
      dash: [4, 3],
      listening: false,
    });
    layer.add(rect);
    selectionRectRef.current = rect;

    const tr = new window.Konva.Transformer({
      name: 'Transformer',
      rotateEnabled: true,
      keepRatio: false,
      ignoreStroke: true,
      anchorSize: 8,
      borderStroke: '#7c3aed',
      borderStrokeWidth: 1.5,
      anchorFill: '#ffffff',
      anchorStroke: '#a855f7',
      anchorCornerRadius: 2,
      enabledAnchors: [
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right',
      ],
    });
    layer.add(tr);
    transformerRef.current = tr;

    const getSelectableRoot = (node: any): any | null => {
      if (!node || isLayerOrStage(node) || isTransformer(node)) return null;
      let curr = node;
      while (curr.parent && curr.parent.getType() !== 'Layer') {
        curr = curr.parent;
      }
      if (curr.name() === 'background' || isTransformer(curr) || isLayerOrStage(curr)) return null;
      return curr;
    };

    const begin = (e: any) => {
      if (!isMultiSelectMode || !isBackgroundTarget(e.target, stage)) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      selectionStartRef.current = pos;
      selectionRectRef.current.setAttrs({ visible: true, x: pos.x, y: pos.y, width: 0, height: 0 });
      layer.batchDraw();
    };

    const update = () => {
      if (!selectionStartRef.current) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const x = Math.min(selectionStartRef.current.x, pos.x);
      const y = Math.min(selectionStartRef.current.y, pos.y);
      const w = Math.abs(pos.x - selectionStartRef.current.x);
      const h = Math.abs(pos.y - selectionStartRef.current.y);
      selectionRectRef.current.setAttrs({ x, y, width: w, height: h });
      layer.batchDraw();
    };

    const finish = () => {
      if (!selectionStartRef.current) return;
      const box = selectionRectRef.current.getClientRect();
      selectionStartRef.current = null;
      selectionRectRef.current.visible(false);
      
      const items = layer.getChildren((node: any) => {
        if (isTransformer(node) || node === selectionRectRef.current || node.name() === 'background') return false;
        const r = node.getClientRect();
        return (
          r.x >= box.x && 
          r.y >= box.y && 
          r.x + r.width <= box.x + box.width && 
          r.y + r.height <= box.y + box.height
        );
      });
      
      setSelectedNodes(items);
      layer.batchDraw();
    };

    const handleClick = (e: any) => {
      const t = e.target;
      if (isBackgroundTarget(t, stage)) {
        setSelectedNodes([]);
        return;
      }
      const root = getSelectableRoot(t);
      if (!root) return;

      setSelectedNodes(prev => {
        if (isMultiSelectMode) {
          const isSelected = prev.some(n => n === root);
          return isSelected ? prev.filter(n => n !== root) : [...prev, root];
        } else {
          return [root];
        }
      });
    };

    stage.on('mousedown touchstart', begin);
    stage.on('mousemove touchmove', update);
    stage.on('mouseup touchend', finish);
    stage.on('click tap', handleClick);

    return () => {
      stage.off('mousedown touchstart', begin);
      stage.off('mousemove touchmove', update);
      stage.off('mouseup touchend', finish);
      stage.off('click tap', handleClick);
      
      if (selectionRectRef.current) {
        selectionRectRef.current.destroy();
        selectionRectRef.current = null;
      }
      if (transformerRef.current) {
        transformerRef.current.destroy();
        transformerRef.current = null;
      }
    };
  }, [isCanvasReady, canvasRef, isMultiSelectMode, setSelectedNodes, isTransformer, isLayerOrStage, isBackgroundTarget]);

  // Sync transformer nodes when selection changes
  useEffect(() => {
    if (!transformerRef.current || !canvasRef.current?.layer) return;
    const tr = transformerRef.current;
    const layer = canvasRef.current.layer;

    const validTargets = selectedNodes.filter(node => 
      node && 
      !node.getAttr('isLocked') && 
      node.getStage() &&
      !isTransformer(node) && 
      !isLayerOrStage(node) &&
      node.getParent() === layer
    );

    if (validTargets.length === 0) {
      tr.nodes([]);
      tr.visible(false);
    } else {
      try {
        tr.nodes(validTargets);
        tr.visible(true);
        tr.moveToTop();
      } catch (err) {
        console.error('Transformer attachment failed:', err);
        tr.nodes([]);
      }
    }
    layer.batchDraw();
  }, [selectedNodes, isTransformer, isLayerOrStage, canvasRef]);
};
