
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
      
        // Account for the 120px padding on each side (240px total)
        const workspacePadding = 240;
        const containerWidth = container.clientWidth - workspacePadding;
        const containerHeight = container.clientHeight - workspacePadding;
      
        const scale = Math.min(containerWidth / stage.width(), containerHeight / stage.height());
        
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
      
        // CSS handles centering (left:50%/top:50%/translate(-50%,-50%))
        // We set internal Konva position to 0,0 since CSS manages the visual offset
        setCanvasPosition({ 
            x: 0, 
            y: 0 
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
            // Prevent zooming out past fit-to-screen boundary
            if (oldScale <= currentFitScale + 0.0001) return;
            newScale = Math.max(currentFitScale, oldScale / scaleBy);
          }
          
          newScale = Math.max(0.01, Math.min(newScale, 20));
      
          setCanvasScale(newScale);
          // Centering is maintained via CSS translate(-50%, -50%)
          setCanvasPosition({ x: 0, y: 0 });
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
