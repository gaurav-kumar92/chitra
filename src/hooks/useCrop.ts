'use client';

import { useState, useCallback } from 'react';

export function useCrop({
  canvasRef,
  selectedNodes,
  forceRecord,
}) {
  const [isCropModalOpen, setCropModalOpen] = useState(false);
  const [nodeToCrop, setNodeToCrop] = useState<any>(null);

  // ---- OPEN CROP (AS-IS) ----
  const handleCropImage = useCallback(() => {
    if (selectedNodes.length !== 1 || !selectedNodes[0].hasName('image')) {
      return;
    }

    const imageNode = selectedNodes[0];
    setNodeToCrop(imageNode);
    setCropModalOpen(true);
  }, [selectedNodes]);

  // ---- APPLY CROP (AS-IS) ----
  const handleApplyCrop = useCallback(
    (croppedDataUrl: string) => {
      if (!nodeToCrop) return;

      const imageObj = new window.Image();

      imageObj.onload = () => {
        nodeToCrop.image(imageObj);
        nodeToCrop.setAttr('data-original-src', croppedDataUrl);

        nodeToCrop.width(imageObj.width);
        nodeToCrop.height(imageObj.height);
        nodeToCrop.offsetX(imageObj.width / 2);
        nodeToCrop.offsetY(imageObj.height / 2);

        canvasRef.current?.layer?.batchDraw();
        forceRecord?.();
      };

      imageObj.src = croppedDataUrl;

      setCropModalOpen(false);
      setNodeToCrop(null);
    },
    [nodeToCrop, canvasRef, forceRecord]
  );

  return {
    isCropModalOpen,
    setCropModalOpen,
    nodeToCrop,
    setNodeToCrop,
    handleCropImage,
    handleApplyCrop,
  };
}
