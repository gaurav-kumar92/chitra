
'use client';

import { useState, useCallback, useEffect, useRef } from "react";

export function useZoomPan({ canvasRef, isCanvasReady }) {
    const [canvasScale, setCanvasScale] = useState(1);
    const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);
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

    // Touch Interaction Logic
    useEffect(() => {
        const container = document.getElementById("canvas-wrapper");
        const stage = canvasRef.current?.stage;
        if (!container || !stage || !isCanvasReady) return;
      
        const getStagePointerFromTouch = (touch: Touch | undefined) => {
            if (!touch) return null;
            const rect = container.getBoundingClientRect();
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        };
      
        const onTouchStart = (e: TouchEvent) => {
            if (!e.touches || e.touches.length !== 1) return;
            const touch = e.touches[0];
            const pointer = getStagePointerFromTouch(touch);
            if (!pointer) return;
            
            const konvaTarget = stage.getIntersection(pointer);
            if (konvaTarget && konvaTarget !== stage && konvaTarget.name() !== 'background') {
                setIsPanning(false);
                setLastTouch(null);
                return;
            }
  
            setIsPanning(true);
            setLastTouch({ x: touch.clientX, y: touch.clientY });
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!isPanning || !lastTouch || !e.touches || e.touches.length !== 1) return;
            const touch = e.touches[0];
            e.preventDefault();
            
            const dx = touch.clientX - lastTouch.x;
            const dy = touch.clientY - lastTouch.y;
  
            setCanvasPosition((prev) => ({
                x: prev.x + dx,
                y: prev.y + dy
            }));
            setLastTouch({ x: touch.clientX, y: touch.clientY });
        };
      
        const onTouchEnd = () => {
            setIsPanning(false);
            setLastTouch(null);
        };
      
        container.addEventListener("touchstart", onTouchStart, { passive: true });
        container.addEventListener("touchmove", onTouchMove, { passive: false });
        container.addEventListener("touchend", onTouchEnd);
        container.addEventListener('touchcancel', onTouchEnd);
      
        return () => {
            container.removeEventListener("touchstart", onTouchStart);
            container.removeEventListener("touchmove", onTouchMove);
            container.removeEventListener("touchend", onTouchEnd);
            container.removeEventListener('touchcancel', onTouchEnd);
        };
    }, [isCanvasReady, isPanning, lastTouch, canvasRef]);

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
