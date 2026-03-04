'use client';

import { useCallback } from 'react';

export function useAnimationControls({
  canvasRef,
  selectedNodes,
  forceRecord,
}) {
  const handleAnimationChange = useCallback(
    (animation: any) => {
      if (!canvasRef.current?.layer) return;
      if (selectedNodes.length === 0) return;

      selectedNodes.forEach((node) => {
        node.setAttr('data-animation', animation);
      });

      canvasRef.current.layer.batchDraw();
      forceRecord?.();
    },
    [canvasRef, selectedNodes, forceRecord]
  );

  return {
    handleAnimationChange,
  };
}
