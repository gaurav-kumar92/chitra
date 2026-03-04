
'use client';

import React, { useEffect, useState } from 'react';
import { useCanvas } from '@/contexts/CanvasContext';
import ObjectPropertiesPanel from './ObjectPropertiesPanel';
import ZoomControls from './ZoomControls';
import BackgroundImagePanel from './BackgroundImagePanel';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Menu, RotateCw, Scaling, Crop } from 'lucide-react';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import CanvasSizeSelector from './CanvasSizeSelector';
import BackgroundColorPicker from './BackgroundColorPicker';
import BackgroundImagePicker from './BackgroundImagePicker';
import { Separator } from '../ui/separator';

const PropertiesToolbar = () => {
  const {
    selectedNodes,
    handleAlign,
    handleOpacityChange,
    handleScaleChange,
    handleRotationChange,
    handleFlip,
    handleColorUpdate,
    handleMaskImageZoom,
    handleMaskImageReset,
    handleMaskImagePan,
    isMultiSelectMode,
    setMultiSelectMode,
    handleGroup,
    handleUngroup,
    setSelectedNodes,
    handleAnimationChange,
    handleClipartPartColorChange,
    backgroundImage,
    handleBackgroundImageZoom,
    handleBackgroundImagePan,
    handleBackgroundImageReset,
    handleRemoveBackgroundImage,
    canvasRef,
    canvasSize,
    setCanvasSize,
    backgroundColor,
    setBackgroundColor,
    handleCropImage,
  } = useCanvas();

  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const hasSelection = selectedNodes.length > 0;
  const selectedNode = hasSelection ? selectedNodes[0] : null;

  useEffect(() => {
    if (selectedNode && canvasRef.current?.stage) {
      const canvasWidth = canvasRef.current.stage.width();
      const nodeWidth = selectedNode.getClientRect({ skipTransform: false }).width;
      
      const currentScale = selectedNode.scaleX();
      
      if (nodeWidth > 0 && canvasWidth > 0) {
        const baseScaleForFullWidth = canvasWidth / nodeWidth;
        const displayPercent = currentScale / baseScaleForFullWidth;
        setScale(displayPercent);
      } else {
        setScale(1);
      }
      
      setRotation(selectedNode.rotation() ?? 0);
    } else {
      setScale(1);
      setRotation(0);
    }
  }, [selectedNode, canvasRef]);

  const handleScaleSliderChange = (newScalePercent: number) => {
    setScale(newScalePercent);
    handleScaleChange(newScalePercent);
  };
  
  const handleRotationSliderChange = (newRotation: number) => {
    setRotation(newRotation);
    handleRotationChange(newRotation);
  };
  
  const handleMultiSelectToggle = () => {
    const newMode = !isMultiSelectMode;
    setMultiSelectMode(newMode);
    // If turning multi-select OFF and more than one item is selected,
    // collapse selection to the last selected item.
    if (!newMode && selectedNodes.length > 1) {
      setSelectedNodes([selectedNodes[selectedNodes.length - 1]]);
    }
  };

  const canCrop = selectedNodes.length === 1 && selectedNodes[0].hasName('image');

  return (
    <div className="toolbar mt-4 w-full h-auto py-2 flex flex-col md:flex-row items-center gap-2">

<div className="w-full overflow-x-auto md:overflow-visible">
  <div className="flex md:justify-center">
    <div className="flex items-center gap-1 whitespace-nowrap min-w-max md:min-w-fit">
            <ZoomControls />
            <CanvasSizeSelector value={canvasSize} onChange={setCanvasSize} />
            <BackgroundColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
            <BackgroundImagePicker />
            {backgroundImage && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" title="Edit Background Image">
                    <Menu size={16} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <BackgroundImagePanel
                    onZoom={handleBackgroundImageZoom}
                    onPan={handleBackgroundImagePan}
                    onReset={handleBackgroundImageReset}
                    onRemove={handleRemoveBackgroundImage}
                  />
                </PopoverContent>
              </Popover>
            )}
            <Separator orientation="vertical" className="h-6 mx-2" />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!hasSelection}>
                  <Scaling size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs">
                    Scale ({Math.round(scale * 100)}%)
                  </Label>
                  <Slider
                    min={0.01}
                    max={2}
                    step={0.01}
                    value={[scale]}
                    onValueChange={(val) => handleScaleSliderChange(val[0])}
                    disabled={!hasSelection}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!hasSelection}>
                  <RotateCw size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs">
                    Rotation ({Math.round(rotation)}°)
                  </Label>
                  <Slider
                    min={0}
                    max={360}
                    step={1}
                    value={[rotation]}
                    onValueChange={(val) => handleRotationSliderChange(val[0])}
                    disabled={!hasSelection}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              disabled={!canCrop}
              onClick={handleCropImage}
            >
              <Crop size={16} />
            </Button>
          </div>
        </div>
      </div>

      
      <div className="w-full overflow-x-auto properties-scrollbar">
      <div className="flex justify-start md:justify-center whitespace-nowrap">
         <ObjectPropertiesPanel
          selectedNodes={selectedNodes}
          onAlign={handleAlign}
          onOpacityChange={handleOpacityChange}
          onFlip={handleFlip}
          onColorChange={handleColorUpdate}
          onMaskImageZoom={handleMaskImageZoom}
          onMaskImageReset={handleMaskImageReset}
          onMaskImagePan={handleMaskImagePan}
          isMultiSelectMode={isMultiSelectMode}
          onAnimationChange={handleAnimationChange}
          onClipartPartColorChange={handleClipartPartColorChange}
          onMultiSelectToggle={handleMultiSelectToggle}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
        />
        </div>
      </div>
    </div>
  );
};

export default PropertiesToolbar;

    