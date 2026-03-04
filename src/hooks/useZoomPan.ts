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
        if (!container || container.clientWidth === 0 || container.clientHeight === 0) return 0.01;
      
        const padding = 40;
        const containerWidth = container.clientWidth - padding;
        const containerHeight = container.clientHeight - padding;
      
        const scale = Math.min(containerWidth / stage.width(), containerHeight / stage.height());
        
        // Use a rounded scale for stability
        return Math.max(0.01, parseFloat(scale.toFixed(4)));
    }, [canvasRef]);

    const fitToScreen = useCallback(() => {
        if (!canvasRef.current?.stage) return;
        const stage = canvasRef.current.stage;
        const container = document.getElementById('canvas-wrapper');
        if (!container) return;
      
        const finalScale = calculateFitScale();
        setCanvasScale(finalScale);
        setMinScale(finalScale);
      
        // Perfect centering logic
        const newX = (container.clientWidth - stage.width() * finalScale) / 2;
        const newY = (container.clientHeight - stage.height() * finalScale) / 2;
      
        setCanvasPosition({ 
            x: Math.round(newX), 
            y: Math.round(newY) 
        });
    }, [canvasRef, calculateFitScale]);

    const zoom = useCallback(
        (direction: 'in' | 'out', pointerPos?: { x: number; y: number }) => {
          if (!canvasRef.current?.stage) return;
          const container = document.getElementById('canvas-wrapper');
          if (!container) return;
      
          const scaleBy = 1.1;
          const oldScale = canvasScale;
          const currentFitScale = calculateFitScale();
      
          let newScale;
          if (direction === 'in') {
            newScale = oldScale * scaleBy;
          } else {
            // Boundary: prevent zooming out past the "fit to screen" size
            if (oldScale <= currentFitScale + 0.0001) return;
            newScale = Math.max(currentFitScale, oldScale / scaleBy);
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
          setMinScale(currentFitScale);
        },
        [canvasScale, canvasPosition, canvasRef, calculateFitScale]
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
          }
        },
        [fitToScreen, calculateFitScale]
    );

    // Dynamic resize monitoring
    useEffect(() => {
        const container = document.getElementById("canvas-wrapper");
        if (!container || !isCanvasReady) return;

        resizeObserverRef.current = new ResizeObserver(() => {
            // Recalculate minScale whenever container dimensions change
            const newMin = calculateFitScale();
            setMinScale(newMin);
            // Re-fit to screen if we resize
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
