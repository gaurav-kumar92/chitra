
import { useState, useEffect, useRef, useCallback } from 'react';
import Konva from 'konva';
import { useHistory } from './useHistory';

export const useBackground = (canvasRef: React.RefObject<Konva.Stage>, forceRecord: ReturnType<typeof useHistory>['forceRecord']) => {
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
    x: 0,
    y: 0,
    scale: 1,
  });
  const setBackgroundColor = (color: any) => {
    const nextState = { ...backgroundColorState, ...color };
  
    const transparencyToggledOn =
      !backgroundColorState.isTransparent && nextState.isTransparent;
  
    const transparencyToggledOff =
      backgroundColorState.isTransparent && !nextState.isTransparent;
  
    if (transparencyToggledOn) {
      nextState.solidColor = 'transparent';
      nextState.isGradient = false;
    }
  
    if (transparencyToggledOff) {
      nextState.solidColor = '#ffffff'; // default white
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
                if (forceRecord) {
                  forceRecord();
                }
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
  }, [forceRecord]);

  const handleBackgroundImageZoom = (zoom: number) => {
    setBackgroundImageProps(prev => ({ ...prev, scale: prev.scale * zoom }));
  };

  const handleBackgroundImagePan = (pan: { x: number; y: number }) => {
    setBackgroundImageProps(prev => ({ ...prev, x: prev.x + pan.x, y: prev.y + pan.y }));
  };

  const handleBackgroundImageReset = () => {
    setBackgroundImageProps({ x: 0, y: 0, scale: 1 });
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundImage(null);
    setBackgroundColorState(prev => ({ ...prev, solidColor: '#E0E0E0', isGradient: false, isTransparent: false }));
    if (forceRecord) {
      forceRecord();
    }
  };

  const drawBackground = useCallback(() => {
    if (!canvasRef.current) return;
  
    let layer = canvasRef.current.findOne('#background-layer') as Konva.Layer;
    if (!layer) {
      layer = new Konva.Layer({ id: 'background-layer' });
      canvasRef.current.add(layer);
    }
  
    let backgroundRect = layer.findOne('#background-rect') as Konva.Rect;
    if (!backgroundRect) {
      backgroundRect = new Konva.Rect({ id: 'background-rect', x: 0, y: 0 });
      layer.add(backgroundRect);
    }
  
    const stage = canvasRef.current.getStage();
    const width = stage.width();
    const height = stage.height();
  
    backgroundRect.width(width);
    backgroundRect.height(height);
  
    // HARD RESET (mandatory)
    backgroundRect.fill(null);
    backgroundRect.fillLinearGradientStartPoint(null);
    backgroundRect.fillLinearGradientEndPoint(null);
    backgroundRect.fillLinearGradientColorStops(null);
    backgroundRect.fillRadialGradientStartPoint(null);
    backgroundRect.fillRadialGradientEndPoint(null);
    backgroundRect.fillRadialGradientColorStops(null);
  
    if (backgroundColorState.isTransparent && !backgroundImage) {
      backgroundRect.fill('transparent');
  
    } else if (backgroundImage) {
      // Image handled elsewhere
  
    } else if (backgroundColorState.isGradient) {
      const radius = Math.sqrt(width * width + height * height) / 2;
  
      const colorStopsFlat = backgroundColorState.colorStops.flatMap(
        (cs: any) => [cs.stop, cs.color]
      );
  
      if (backgroundColorState.gradientDirection === 'radial') {
        backgroundRect.fillRadialGradient({
          start: { x: width / 2, y: height / 2 },
          end: { x: width / 2, y: height / 2 },
          startRadius: 0,
          endRadius: radius,
          colorStops: colorStopsFlat,
        });
      } else {
        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 0 };
  
        switch (backgroundColorState.gradientDirection) {
          case 'left-to-right':
            end = { x: width, y: 0 };
            break;
          case 'diagonal-tl-br':
            end = { x: width, y: height };
            break;
          case 'diagonal-tr-bl':
            start = { x: width, y: 0 };
            end = { x: 0, y: height };
            break;
          default:
            end = { x: 0, y: height };
        }
  
        backgroundRect.fillLinearGradient({
          start,
          end,
          colorStops: colorStopsFlat,
        });
      }
  
    } else {
      backgroundRect.fill(backgroundColorState.solidColor);
    }
  
    layer.batchDraw();
  }, [canvasRef, backgroundColorState, backgroundImage]);
  

  useEffect(() => {
    drawBackground();
  }, [drawBackground, backgroundColorState, backgroundImage, backgroundImageProps]);

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

}
