'use client';

import { useCallback } from 'react';
import gifshot from 'gifshot';

type UseExportParams = {
  canvasRef: React.RefObject<{
    stage: any;
    layer: any;
    background: any;
  }>;
  deselectNodes: () => void;
  timelineState?: {
    getDuration: () => number;
    seek: (timeMs: number) => void;
    bindStage?: (stage: any) => void;
  };
};

export function useExport({
  canvasRef,
  deselectNodes,
  timelineState,
}: UseExportParams) {
  const handleSave = useCallback(
    (
      format: 'png' | 'jpg' | 'svg' | 'pdf' | 'gif' = 'png',
      quality: number = 1
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { stage, layer, background } = canvas;

      // Deselect nodes
      deselectNodes();

      // Hide transformers
      const transformers = layer.find('Transformer');
      transformers.forEach((tr: any) => tr.visible(false));
      layer.batchDraw();

      setTimeout(() => {
        /* =========================
           GIF EXPORT (REAL STAGE)
        ========================= */
        if (format === 'gif') {
          if (!timelineState) return;
          
          const frames: string[] = [];
          const fps = 10;
          const durationMs = timelineState.getDuration();
          const frameInterval = 1000 / fps;
          const totalFrames = Math.ceil(durationMs / frameInterval);
          
          // 🔑 Create a temporary container for export
          const tempContainer = document.createElement('div');
          tempContainer.style.position = 'absolute';
          tempContainer.style.left = '-9999px';
          document.body.appendChild(tempContainer);
          
          // 🔑 Create a temporary stage with exact canvas size
          const tempStage = new Konva.Stage({
            container: tempContainer,
            width: 1080,
            height: 1080,
          });
          
          let frameIndex = 0;
          timelineState.seek(0);
          stage.draw();
        
          const capture = () => {
            if (frameIndex >= totalFrames) {
              // Cleanup
              tempStage.destroy();
              document.body.removeChild(tempContainer);
              
              gifshot.createGIF(
                {
                  images: frames,
                  gifWidth: 1080,
                  gifHeight: 1080,
                  frameDuration: 1 / fps,
                },
                (result: any) => {
                  if (!result.error) {
                    const link = document.createElement('a');
                    link.href = result.image;
                    link.download = 'konva-design.gif';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }
              );
              return;
            }
        
            // 🔑 Clone the layer to temp stage
            const layer = background.getLayer();
            const clonedLayer = layer.clone();
            tempStage.add(clonedLayer);
            tempStage.draw();
            
            // Export from temp stage (which is exactly 1080x1080)
            const frameData = tempStage.toDataURL({
              mimeType: 'image/png',
              pixelRatio: 1,
            });
            
            frames.push(frameData);
            
            // Remove cloned layer for next frame
            clonedLayer.destroy();
            
            frameIndex++;
            timelineState.seek(frameIndex * frameInterval);
            stage.draw();
            setTimeout(capture, frameInterval);
          };
        
          capture();
          return;
        }
        
        /* =========================
           IMAGE / VECTOR EXPORTS
           (CLONED STAGE)
        ========================= */
        const canvasWidth = background.width();
        const canvasHeight = background.height();

        const tempStage = new window.Konva.Stage({
          container: document.createElement('div'),
          width: canvasWidth,
          height: canvasHeight,
        });

        const tempLayer = new window.Konva.Layer();
        tempStage.add(tempLayer);

        // Clone background
        const bgClone = background.clone();
        bgClone.position({ x: 0, y: 0 });
        tempLayer.add(bgClone);

        // Clone drawable objects
        layer.getChildren().forEach((child: any) => {
          if (child === background) return;
          if (child.getClassName?.() === 'Transformer') return;
          if (child.hasName?.('Transformer')) return;
          if (child.name?.() === 'background') return;
          if (child.name?.() === 'selection-rect') return;

          tempLayer.add(child.clone());
        });

        tempLayer.batchDraw();

        let dataURL: string;
        let filename: string;

        if (format === 'svg') {
          dataURL = tempStage.toDataURL({ mimeType: 'image/svg+xml' });
          filename = 'konva-design.svg';
        } else if (format === 'pdf') {
          dataURL = tempStage.toDataURL({
            mimeType: 'image/png',
            quality: 1,
            pixelRatio: 3,
          });
          filename = 'konva-design-print.png';
        } else if (format === 'jpg') {
          dataURL = tempStage.toDataURL({
            mimeType: 'image/jpeg',
            quality,
          });
          filename = 'konva-design.jpg';
        } else {
          dataURL = tempStage.toDataURL({
            mimeType: 'image/png',
            quality,
            pixelRatio: quality === 1 ? 2 : 1,
          });
          filename = 'konva-design.png';
        }

        tempStage.destroy();

        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        transformers.forEach((tr: any) => tr.visible(true));
        layer.batchDraw();
      }, 100);
    },
    [canvasRef, deselectNodes, timelineState]
  );

  return { handleSave };
}
