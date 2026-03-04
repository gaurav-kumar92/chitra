
'use client';

import { useCallback } from 'react';
import { Node } from 'konva/lib/Node';

export function useGrouping({
    canvasRef,
    selectedNodes,
    setSelectedNodes,
    setMultiSelectMode,
    updateLayers,
    attachDoubleClick,
    runAsSingleHistoryStep,
  }) {
    
  const isTransformer = useCallback((node: any) => {
    if (!node) return false;
    const className = typeof node.getClassName === 'function' ? node.getClassName() : '';
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

  const handleGroup = useCallback(() => {
    const validNodes = selectedNodes.filter(n => !isTransformer(n) && !isLayerOrStage(n) && !n.getAttr('isLocked'));
    if (validNodes.length < 2 || !canvasRef.current?.layer) return;

    runAsSingleHistoryStep(() => {
      const layer = canvasRef.current!.layer;
      let minX = Infinity, minY = Infinity;
      validNodes.forEach((node) => {
        const box = node.getClientRect({ relativeTo: layer });
        minX = Math.min(minX, box.x);
        minY = Math.min(minY, box.y);
      });

      const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const group = new window.Konva.Group({
        id: uniqueId,
        name: 'group',
        draggable: true,
        x: minX,
        y: minY,
      });
      layer.add(group);
      attachDoubleClick(group);

      validNodes.forEach((node) => {
        const box = node.getClientRect({ relativeTo: layer });
        const currentX = node.x();
        const currentY = node.y();
        const offsetX = box.x - currentX;
        const offsetY = box.y - currentY;
        node.moveTo(group);
        node.position({ x: box.x - minX - offsetX, y: box.y - minY - offsetY });
        node.draggable(false);
      });

      const groupBox = group.getClientRect({ skipTransform: true });
      group.offsetX(groupBox.width / 2);
      group.offsetY(groupBox.height / 2);
      group.x(minX + groupBox.width / 2);
      group.y(minY + groupBox.height / 2);

      layer.batchDraw();
      setSelectedNodes([group]);
      setMultiSelectMode(false);
      updateLayers();
    });
  }, [selectedNodes, canvasRef, runAsSingleHistoryStep, setSelectedNodes, setMultiSelectMode, updateLayers, attachDoubleClick, isTransformer, isLayerOrStage]);

  const handleUngroup = useCallback(() => {
    const group = selectedNodes[0];
    if (selectedNodes.length !== 1 || !(group.hasName('group') || group.hasName('clipart')) || group.getAttr('isLocked')) return;

    runAsSingleHistoryStep(() => {
      const layer = canvasRef.current?.layer ?? group.getLayer();
      const children = group.getChildren().slice();
      const nodesToSelect: Node[] = [];

      children.forEach((child: Node) => {
        if (isTransformer(child)) return;
        const absPos = child.getAbsolutePosition();
        child.moveTo(layer);
        child.setAbsolutePosition(absPos);
        child.draggable(true);
        child.listening(true);
        nodesToSelect.push(child);
      });

      group.destroy();
      updateLayers();
      layer.batchDraw();
      setMultiSelectMode(true);
      setSelectedNodes(nodesToSelect);
    });
  }, [selectedNodes, canvasRef, setMultiSelectMode, setSelectedNodes, updateLayers, runAsSingleHistoryStep, isTransformer]);

  return { handleGroup, handleUngroup };
}
