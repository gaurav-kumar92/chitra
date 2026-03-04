
'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';

declare global {
  interface Window {
    Konva: any;
  }
}

type CanvasProps = {
  canvasSize: string;
  isCircular: boolean;
  backgroundImage: any;
};

const Canvas = forwardRef<any, CanvasProps>(({ canvasSize, isCircular, backgroundImage }, ref) => {
  const { 
    setCanvasReady, 
    fitToScreen, 
    canvasScale,
    canvasPosition, 
    backgroundImageProps,
  } = useCanvas();

  const stageRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const backgroundRef = useRef<any>(null);
  
  useImperativeHandle(ref, () => ({
    get stage() { return stageRef.current; },
    set stage(v) { stageRef.current = v; },
    get layer() { return layerRef.current; },
    set layer(v) { layerRef.current = v; },
    get background() { return backgroundRef.current; },
    set background(v) { backgroundRef.current = v; },
  }));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Konva || stageRef.current) {
      return;
    }

    const [width, height] = canvasSize.split('x').map(Number);

    const stage = new window.Konva.Stage({
      container: 'canvas-container',
      width: width || 1080,
      height: height || 1080,
      draggable: false,
    });
    stageRef.current = stage;

    const layer = new window.Konva.Layer();
    stage.add(layer);
    layerRef.current = layer;

    const background = new window.Konva.Rect({
      x: 0, y: 0,
      width: width || 1080, height: height || 1080,
      fill: '#ffffff',
      name: 'background',
      listening: false,
    });
    layer.add(background);
    backgroundRef.current = background;

    setCanvasReady(true);
  }, [canvasSize, setCanvasReady]);
  
  useEffect(() => {
    if (stageRef.current && layerRef.current) {
        const [width, height] = canvasSize.split('x').map(Number);
        const stage = stageRef.current;
        
        stage.width(width);
        stage.height(height);
        if(backgroundRef.current) {
          backgroundRef.current.width(width);
          backgroundRef.current.height(height);
        }

        layerRef.current.clipFunc((ctx: any) => {
          if (isCircular) {
              const radius = Math.min(width, height) / 2;
              ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2, false);
          } else {
              ctx.rect(0, 0, width, height);
          }
        });
        
        stage.batchDraw();
        // Trigger fitToScreen after layout settling
        requestAnimationFrame(() => fitToScreen());
    }
  }, [isCircular, canvasSize, fitToScreen]);

  useEffect(() => {
      if (backgroundRef.current && backgroundImage) {
          const img = new Image();
          img.src = backgroundImage;
          img.onload = () => {
              if (!backgroundRef.current) return;
              backgroundRef.current.fillPatternImage(img);
              backgroundRef.current.fillPatternRepeat('no-repeat');
              
              const bgWidth = backgroundRef.current.width();
              const bgHeight = backgroundRef.current.height();
              const imgScale = Math.max(bgWidth / img.width, bgHeight / img.height);
              
              backgroundRef.current.fillPatternScale({ 
                  x: imgScale * backgroundImageProps.scale, 
                  y: imgScale * backgroundImageProps.scale,
              });
              backgroundRef.current.fillPatternOffset({
                  x: backgroundImageProps.x,
                  y: backgroundImageProps.y,
              });

              backgroundRef.current.fill(null);
              if (layerRef.current) layerRef.current.draw();
          };
      }
  }, [backgroundImage, backgroundImageProps]);

  useEffect(() => {
    if (stageRef.current) {
      // Use Konva internals for positioning to avoid CSS sub-pixel blurriness
      stageRef.current.x(Math.round(canvasPosition.x));
      stageRef.current.y(Math.round(canvasPosition.y));
      stageRef.current.scale({ x: canvasScale, y: canvasScale });
      stageRef.current.batchDraw();
    }
  }, [canvasPosition, canvasScale]);

  return (
    <div className="relative-canvas flex-grow w-full h-full min-h-0 overflow-hidden" id="canvas-wrapper">
      <div id="canvas-container" style={{ position: 'absolute', top: 0, left: 0 }}></div>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
