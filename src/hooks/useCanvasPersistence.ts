
'use client';

import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'last-canvas-state-v1';

export function useCanvasPersistence({
  canvasRef,
  isCanvasReady,
  setCanvasSize,
  updateLayers,
  attachDoubleClick,
}) {
  const save = useCallback(() => {
    if (!canvasRef.current?.stage) return;
    try {
      const stage = canvasRef.current.stage;
      // Filter out internal Konva nodes like Transformers before saving
      const data = stage.toObject();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save design:', err);
    }
  }, [canvasRef]);

  const load = useCallback(() => {
    if (!isCanvasReady || !canvasRef.current?.stage) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const stage = canvasRef.current.stage;
      const data = JSON.parse(saved);
      
      // Clean up existing nodes
      stage.destroyChildren();
      
      // Re-create stage from object
      const tempStage = window.Konva.Node.create(data);
      const layers = tempStage.getChildren();
      
      layers.forEach((layer: any) => {
        // Sanitize: destroy any transformers that might have been saved
        layer.find('Transformer').forEach((tr: any) => tr.destroy());
        
        // Find background and sync app state
        const bg = layer.findOne('.background');
        if (bg) {
          const sizeStr = `${bg.width()}x${bg.height()}`;
          setCanvasSize(sizeStr);
          canvasRef.current.background = bg;
        }
        
        // Re-attach listeners to children
        layer.getChildren().forEach((node: any) => {
          if (node.draggable()) {
            attachDoubleClick(node);
          }
        });
        
        stage.add(layer);
        canvasRef.current.layer = layer;
      });

      stage.draw();
      updateLayers();
    } catch (err) {
      console.error('Failed to load design:', err);
    }
  }, [isCanvasReady, canvasRef, setCanvasSize, updateLayers, attachDoubleClick]);

  useEffect(() => {
    if (isCanvasReady) {
      load();
    }
  }, [isCanvasReady, load]);

  return { save, load };
}
