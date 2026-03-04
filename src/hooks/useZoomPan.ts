
'use client';

import { useState, useCallback, useEffect, useRef } from "react";

export function useZoomPan({ canvasRef, isCanvasReady }) {
    const [canvasScale, setCanvasScale] = useState(1);
    const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const fitToScreen = useCallback(() => {
        if (!canvasRef.current?.stage) return;
        const stage = canvasRef.current.stage;
        const container = document.getElementById('canvas-wrapper');
        if (!container || container.clientWidth === 0 || container.clientHeight === 0) return;
      
        const padding = 40;
        const containerWidth = container.clientWidth - padding;
        const containerHeight = container.clientHeight - padding;
      
        const scale = Math.min(containerWidth / stage.width(), containerHeight / stage.height());
        
        // Use a rounded scale for stability
        const finalScale = Math.max(0.01, parseFloat(scale.toFixed(4)));
        setCanvasScale(finalScale);
      
        // Perfect centering logic
        const newX = (container.clientWidth - stage.width() * finalScale) / 2;
        const newY = (container.clientHeight - stage.height() * finalScale) / 2;
      
        setCanvasPosition({ 
            x: Math.round(newX), 
            y: Math.round(newY) 
        });
    }, [canvasRef]);

    const zoom = useCallback(
        (direction: 'in' | 'out', pointerPos?: { x: number; y: number }) => {
          if (!canvasRef.current?.stage) return;
          const container = document.getElementById('canvas-wrapper');
          if (!container) return;
      
          const scaleBy = 1.1;
          const oldScale = canvasScale;
      
          let newScale;
          if (direction === 'in') {
            newScale = oldScale * scaleBy;
          } else {
            newScale = oldScale / scaleBy;
          }
          
          newScale = Math.max(0.01, Math.min(newScale, 20));
      
          const pointer = pointerPos || {
            x: container.clientWidth / 2,
            y: container.clientHeight / 2,
          };
      
          const mousePointTo = {
            x: (pointer.x - canvasPosition.x) / oldScale,
            y: (pointer.y - canvasPosition.y) / oldScale,
          };
      
          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          };
      
          setCanvasScale(newScale);
          setCanvasPosition(newPos);
        },
        [canvasScale, canvasPosition, canvasRef]
    );

    const zoomIn = useCallback(() => zoom('in'), [zoom]);
    const zoomOut = useCallback(() => zoom('out'), [zoom]);

    const handleZoomChange = useCallback(
        (value: string) => {
          if (value === "auto") {
            fitToScreen();
          } else {
            const newScale = parseFloat(value);
            setCanvasScale(newScale);
          }
        },
        [fitToScreen]
    );

    // Dynamic resize monitoring
    useEffect(() => {
        const container = document.getElementById("canvas-wrapper");
        if (!container || !isCanvasReady) return;

        resizeObserverRef.current = new ResizeObserver(() => {
            // Use requestAnimationFrame to ensure the layout has settled
            requestAnimationFrame(() => fitToScreen());
        });

        resizeObserverRef.current.observe(container);

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, [isCanvasReady, fitToScreen]);

    return {
        canvasScale,
        canvasPosition,
        setCanvasPosition,
        zoomIn,
        zoomOut,
        zoom,
        fitToScreen,
        handleZoomChange,
    };
}
