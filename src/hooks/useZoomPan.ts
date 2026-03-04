
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
      
        // Account for the padding set in globals.css (120px)
        const containerWidth = container.clientWidth - 240; 
        const containerHeight = container.clientHeight - 240;
      
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
        setCanvasScale(finalScale);
        setMinScale(finalScale);
      
        // Calculate centered position relative to the wrapper's content area
        const stageWidth = stage.width() * finalScale;
        const stageHeight = stage.height() * finalScale;
        
        // Account for 120px padding
        const posX = Math.round((container.clientWidth - stageWidth) / 2);
        const posY = Math.round((container.clientHeight - stageHeight) / 2);
        
        setCanvasPosition({
          x: posX,
          y: posY
        });
        
    }, [canvasRef, calculateFitScale]);

    const zoom = useCallback(
      (direction: 'in' | 'out') => {
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
          if (oldScale <= currentFitScale + 0.0001) return;
          newScale = Math.max(currentFitScale, oldScale / scaleBy);
        }
    
        newScale = Math.max(0.01, Math.min(newScale, 20));
    
        const scaleRatio = newScale / oldScale;
    
        setCanvasScale(newScale);
    
        // Maintain center point during zoom
        setCanvasPosition({
          x: Math.round(canvasPosition.x * scaleRatio),
          y: Math.round(canvasPosition.y * scaleRatio)
        });
    
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
