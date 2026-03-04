'use client';

import { useState, useEffect, useCallback } from 'react';
import type Konva from 'konva';
import { useHistory } from './useHistory';

type UseBackgroundProps = {
  canvasRef: React.RefObject<{ stage: any; layer: any; background: any }>;
  forceRecord?: () => void;
  isKonvaReady?: boolean;
};

export const useBackground = ({ canvasRef, forceRecord, isKonvaReady }: UseBackgroundProps) => {
  const [backgroundColorState, setBackgroundColorState] = useState({
    isGradient: false,
    isTransparent: false,
    solidColor: '#ffffff',
    colorStops: [
      { stop: 0, color: '#3b82f6' },
      { stop: 1, color: '#a855f7' },
    ],
    gradientDirection: 'top-to-bottom',
  });

  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundImageProps, setBackgroundImageProps] = useState({
    x: 0, y: 0, scale: 1,
  });

  const setBackgroundColor = (color: any) => {
    const nextState = { ...backgroundColorState, ...color };
    const transparencyToggledOn = !backgroundColorState.isTransparent && nextState.isTransparent;
    const transparencyToggledOff = backgroundColorState.isTransparent && !nextState.isTransparent;

    if (transparencyToggledOn) {
      nextState.solidColor = 'transparent';
      nextState.isGradient = false;
    }
    if (transparencyToggledOff) {
      nextState.solidColor = '#ffffff';
      nextState.isGradient = false;
    }

    setBackgroundColorState(nextState);
    setBackgroundImage(null);
    forceRecord?.();
  };

  const handleSetBackgroundImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setBackgroundImage(reader.result as string);
          setBackgroundColorState(prev => ({ ...prev, solidColor: 'transparent', isGradient: false, isTransparent: true }));
          forceRecord?.();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [forceRecord]);

  const handleBackgroundImageZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 1.1 : 0.9;
    setBackgroundImageProps(prev => ({ ...prev, scale: prev.scale * factor }));
  };

  const handleBackgroundImagePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const amount = 20;
    setBackgroundImageProps(prev => {
      const next = { ...prev };
      if (direction === 'up') next.y -= amount;
      if (direction === 'down') next.y += amount;
      if (direction === 'left') next.x -= amount;
      if (direction === 'right') next.x += amount;
      return next;
    });
  };

  const handleBackgroundImageReset = () => {
    setBackgroundImageProps({ x: 0, y: 0, scale: 1 });
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundImage(null);
    setBackgroundColorState(prev => ({ ...prev, solidColor: '#ffffff', isGradient: false, isTransparent: false }));
    forceRecord?.();
  };

  const drawBackground = useCallback(() => {
    if (!isKonvaReady || !canvasRef.current?.stage || !canvasRef.current?.background) return;
    
    const backgroundRect = canvasRef.current.background;
    const layer = canvasRef.current.layer;

    backgroundRect.fill(null);
    backgroundRect.fillLinearGradientColorStops(null);
    backgroundRect.fillRadialGradientColorStops(null);
    backgroundRect.fillPatternImage(null);

    if (backgroundImage) {
      // Logic handled in Canvas.tsx via props
    } else if (backgroundColorState.isGradient) {
      const width = backgroundRect.width();
      const height = backgroundRect.height();
      const colorStopsFlat = backgroundColorState.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);
      
      if (backgroundColorState.gradientDirection === 'radial') {
        backgroundRect.fillPriority('radial-gradient');
        backgroundRect.fillRadialGradientStartPoint({ x: width / 2, y: height / 2 });
        backgroundRect.fillRadialGradientStartRadius(0);
        backgroundRect.fillRadialGradientEndPoint({ x: width / 2, y: height / 2 });
        backgroundRect.fillRadialGradientEndRadius(Math.sqrt(width * width + height * height) / 2);
        backgroundRect.fillRadialGradientColorStops(colorStopsFlat);
      } else {
        backgroundRect.fillPriority('linear-gradient');
        let start = { x: 0, y: 0 };
        let end = { x: 0, y: height };
        if (backgroundColorState.gradientDirection === 'left-to-right') end = { x: width, y: 0 };
        if (backgroundColorState.gradientDirection === 'diagonal-tl-br') end = { x: width, y: height };
        if (backgroundColorState.gradientDirection === 'diagonal-tr-bl') { start = { x: width, y: 0 }; end = { x: 0, y: height }; }
        backgroundRect.fillLinearGradientStartPoint(start);
        backgroundRect.fillLinearGradientEndPoint(end);
        backgroundRect.fillLinearGradientColorStops(colorStopsFlat);
      }
    } else {
      backgroundRect.fillPriority('color');
      backgroundRect.fill(backgroundColorState.solidColor);
    }
    layer?.batchDraw();
  }, [backgroundColorState, isKonvaReady, backgroundImage, canvasRef]);

  useEffect(() => {
    drawBackground();
  }, [drawBackground]);

  return {
    backgroundColor: backgroundColorState,
    setBackgroundColor,
    backgroundImage,
    setBackgroundImage,
    backgroundImageProps,
    handleSetBackgroundImage,
    handleBackgroundImageZoom,
    handleBackgroundImagePan,
    handleBackgroundImageReset,
    handleRemoveBackgroundImage,
  };
};
