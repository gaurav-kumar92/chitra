'use client';

import { useState, useCallback, useEffect, useRef } from "react";

export function useZoomPan({ canvasRef, isCanvasReady }) {
    const [canvasScale, setCanvasScale] = useState(1);
    const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
    const [minScale, setMinScale] = useState(0.01);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    const calculateFitScale = useCallback(() => {
      if (!canvasRef.current?.stage) return 0.01;
    
      const stage = canvasRef.current.stage;
      const container = document.getElementById('canvas-wrapper');
      if (!container) return 0.01;
    
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
    
      const marginFactor = 0.92;
    
      const scale =
        Math.min(
          containerWidth / stage.width(),
          containerHeight / stage.height()
        ) * marginFactor;
    
      return Math.max(0.01, parseFloat(scale.toFixed(4)));
    
    }, [canvasRef]);

    const fitToScreen = useCallback(() => {
      if (!canvasRef.current?.stage) return;
    
      const stage = canvasRef.current.stage;
      const container = document.getElementById('canvas-wrapper');
      if (!container) return;
    
      const finalScale = calculateFitScale();
    
      const stageWidth = stage.width() * finalScale;
      const stageHeight = stage.height() * finalScale;
    
      const posX = (container.clientWidth - stageWidth) / 2;
      const posY = (container.clientHeight - stageHeight) / 2;
    
      setCanvasScale(finalScale);
      setMinScale(finalScale);
    
      setCanvasPosition({
        x: posX,
        y: posY
      });

      requestAnimationFrame(() => {
        container.scrollTop = 0;
        container.scrollLeft = 0;
      });
    
    }, [canvasRef, calculateFitScale]);
    const zoom = useCallback(
      (direction: 'in' | 'out') => {
        if (!canvasRef.current?.stage) return;
    
        const scaleBy = 1.1;
        const oldScale = canvasScale;
        const currentFitScale = calculateFitScale();
    
        let newScale;
    
        if (direction === 'in') {
          newScale = oldScale * scaleBy;
        } else {
          if (oldScale <= currentFitScale + 0.0001) return;
          newScale = Math.max(currentFitScale, oldScale / scaleBy);
        }
    
        newScale = Math.max(0.01, Math.min(newScale, 20));
    
        // IMPORTANT: only change scale
        setCanvasScale(newScale);
        setMinScale(currentFitScale);
    
      },
      [canvasScale, canvasRef, calculateFitScale]
    );

    const zoomIn = useCallback(() => zoom('in'), [zoom]);
    const zoomOut = useCallback(() => zoom('out'), [zoom]);

    const handleZoomChange = useCallback(
        (value: string) => {
          if (value === "auto") {
            fitToScreen();
          } else {
            const newScale = parseFloat(value);
            const currentFitScale = calculateFitScale();
            setCanvasScale(Math.max(currentFitScale, newScale));
            setMinScale(currentFitScale);
            setCanvasPosition({ x: 0, y: 0 });
          }
        },
        [fitToScreen, calculateFitScale]
    );

    useEffect(() => {
        const container = document.getElementById("canvas-wrapper");
        if (!container || !isCanvasReady) return;

        resizeObserverRef.current = new ResizeObserver(() => {
            const newMin = calculateFitScale();
            setMinScale(newMin);
            // Re-fit to screen if workspace dimensions change
            requestAnimationFrame(() => fitToScreen());
        });

        resizeObserverRef.current.observe(container);

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, [isCanvasReady, fitToScreen, calculateFitScale]);

    return {
        canvasScale,
        canvasPosition,
        setCanvasPosition,
        zoomIn,
        zoomOut,
        zoom,
        fitToScreen,
        handleZoomChange,
        minScale,
    };
}
