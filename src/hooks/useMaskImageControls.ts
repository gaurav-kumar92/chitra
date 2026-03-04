'use client';

import { useCallback } from 'react';
export function useMaskImageControls({
    canvasRef,
    selectedNodes,
    isNodeLocked,
    forceRecord,
  }) {
    // ---- ZOOM (AS-IS) ----
  const handleMaskImageZoom = useCallback(
    (direction: 'in' | 'out') => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask'))
        return;
      const selectedNode = selectedNodes[0];
      if (isNodeLocked(selectedNode)) return;
      const image = selectedNode.findOne('.mask-image');
      if (!image) return;
      const scaleBy = 1.1;
      const oldScale = image.scaleX();
      const newScale =
        direction === 'in' ? oldScale * scaleBy : oldScale / scaleBy; image.scale({ x: newScale, y: newScale });
        canvasRef.current?.layer.batchDraw();
        forceRecord?.();
      },
      [selectedNodes, canvasRef, isNodeLocked, forceRecord]
    ); 
    // ---- RESET (AS-IS) ----
    const handleMaskImageReset = useCallback(() => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask')) return;
  
      const selectedNode = selectedNodes[0];
      if (isNodeLocked(selectedNode)) return;
  
      const image = selectedNode.findOne('.mask-image');
      if (!image) return;
      const maskWidth = selectedNode.width();
    const maskHeight = selectedNode.height();
    const imgWidth = image.getAttr('data-original-width');
    const imgHeight = image.getAttr('data-original-height');

    if (!imgWidth || !imgHeight) return;

    const scale = Math.max(maskWidth / imgWidth, maskHeight / imgHeight);

    image.position({ x: 0, y: 0 });
    image.scale({ x: scale, y: scale });
    canvasRef.current?.layer.batchDraw();
    forceRecord?.();
  }, [selectedNodes, canvasRef, isNodeLocked, forceRecord]);

  // ---- PAN (AS-IS) ----
  const handleMaskImagePan = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('mask'))
        return;

      const selectedNode = selectedNodes[0];
      if (isNodeLocked(selectedNode)) return;

      const image = selectedNode.findOne('.mask-image');
      if (!image) return;

      const panAmount = 10;
      const currentPos = image.position();
      let newPos = { ...currentPos };
      switch (direction) {
        case 'up':
          newPos.y -= panAmount;
          break;
        case 'down':
          newPos.y += panAmount;
          break;
        case 'left':
          newPos.x += panAmount;
          break;
        case 'right':
          newPos.x -= panAmount;
          break;
      }
      const boundFunc = image.getAttr('dragBoundFunc');
      if (boundFunc) newPos = boundFunc.call(image, newPos);

      image.position(newPos);
      canvasRef.current?.layer.batchDraw();
      forceRecord?.();
    },
    [selectedNodes, canvasRef, isNodeLocked, forceRecord]
  );

  return {
    handleMaskImageZoom,
    handleMaskImageReset,
    handleMaskImagePan,
  };
}