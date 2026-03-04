'use client';

import { useState, useCallback } from 'react';
import type { Node } from 'konva/lib/Node';

export function useClipboard({
    canvasRef,
    selectedNodes,
    setSelectedNodes,
    getUnlocked,
    deselectNodes,
    updateLayers,
    attachDoubleClick,
    runAsSingleHistoryStep,
    forceRecord,
  }) {
    const [clipboard, setClipboard] = useState<any[]>([]);

     // ---- COPY (AS-IS) ----
  const handleCopy = useCallback(() => {
    const unlockedNodes = getUnlocked(selectedNodes);
    if (unlockedNodes.length === 0) return;

    const copied = unlockedNodes.map((node: any) => node.clone());
    setClipboard(copied);
  }, [selectedNodes, getUnlocked]);

  // ---- PASTE (AS-IS) ----
  const handlePaste = useCallback(() => {
    if (clipboard.length === 0 || !canvasRef.current?.layer) return;
    runAsSingleHistoryStep(() => {
        const layer = canvasRef.current!.layer;
        const newSelection: Node[] = [];
  
        clipboard.forEach((nodeToPaste: any, index: number) => {
          const clone = nodeToPaste.clone();

          const uniqueId = `node-${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}-${index}`;
  
          clone.setAttrs({
            id: uniqueId,
            x: clone.x() + 20,
            y: clone.y() + 20,
          });
          attachDoubleClick(clone);
          layer.add(clone);
          newSelection.push(clone);
        });
  
        layer.batchDraw();
        setSelectedNodes(newSelection);
        updateLayers();
      });
    }, [
        clipboard,
        canvasRef,
        attachDoubleClick,
        setSelectedNodes,
        updateLayers,
        runAsSingleHistoryStep,
      ]);
      
  // ---- DELETE (AS-IS) ----
  const handleDelete = useCallback(() => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;

    forceRecord?.();
    nodes.forEach((node) => node.destroy());
    deselectNodes();
    updateLayers();
    forceRecord?.();
  }, [
    selectedNodes,
    getUnlocked,
    deselectNodes,
    updateLayers,
    forceRecord,
  ]);
  return {
    clipboard,
    handleCopy,
    handlePaste,
    handleDelete,
  };
}
