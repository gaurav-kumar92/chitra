
'use client';

import React, { useEffect, useState } from 'react';
import ColorPropertiesPanel from './ColorPropertiesPanel';
import { ZoomIn, ZoomOut, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Menu, Group, Ungroup, ListPlus, Sparkles, Palette, Type, Paintbrush } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import AnimationPanel from './AnimationPanel';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import TextPropertiesPanel from './TextPropertiesPanel';
import { useCanvas } from '@/contexts/CanvasContext';

type ObjectPropertiesPanelProps = {
  selectedNodes: any[];
  onAlign: (position: string) => void;
  onOpacityChange: (opacity: number) => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onColorChange: (config: any) => void;
  onMaskImageZoom: (direction: 'in' | 'out') => void;
  onMaskImageReset: () => void;
  onMaskImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  isMultiSelectMode: boolean;
  onMultiSelectToggle: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onAnimationChange: (animation: any) => void;
  onClipartPartColorChange: (partName: string, color: string) => void;
};

const ObjectPropertiesPanel: React.FC<ObjectPropertiesPanelProps> = ({
  selectedNodes,
  onAlign,
  onOpacityChange,
  onFlip,
  onColorChange,
  onMaskImageZoom,
  onMaskImageReset,
  onMaskImagePan,
  isMultiSelectMode,
  onMultiSelectToggle,
  onGroup,
  onUngroup,
  onAnimationChange,
  onClipartPartColorChange,
}) => {
  const { handleAddOrUpdateText } = useCanvas();
  const [opacity, setOpacity] = useState(1);
  const [isAnimationPopoverOpen, setAnimationPopoverOpen] = useState(false);
  const [isTextPopoverOpen, setTextPopoverOpen] = useState(false);
  
  const selectedNode = selectedNodes.length > 0 ? selectedNodes[0] : null;
  const hasSelection = selectedNodes.length > 0;

  useEffect(() => {
    if (selectedNode) {
      setOpacity(selectedNode.opacity() ?? 1);
    } else {
      setOpacity(1);
    }
  }, [selectedNode]);
  
  const handleOpacitySliderChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    onOpacityChange(newOpacity);
  };
  
  const isText = hasSelection && selectedNodes.length === 1 && (selectedNode.hasName('textGroup') || selectedNode.hasName('circularText'));
  const isClipart = hasSelection && selectedNodes.length === 1 && selectedNode.hasName('clipart');
  const canHaveColor = hasSelection && selectedNodes.length === 1 && (selectedNode.hasName('shape') || selectedNode.hasName('textGroup') || selectedNode.hasName('circularText')|| selectedNode.hasName('frame') || selectedNode.hasName('icon') || isClipart);
  const isLineOrCurve = hasSelection && selectedNodes.length === 1 && (selectedNode.getAttr('data-type') === 'line' || selectedNode.getAttr('data-type') === 'curve' || selectedNode.getAttr('data-type') === 'arrow'|| selectedNode.hasName('frame'));
  const isMask = hasSelection && selectedNodes.length === 1 && selectedNode.hasName('mask');
  const maskHasImage = isMask && selectedNode.findOne('.mask-image');
  const isGroupSelected = hasSelection && selectedNodes.length === 1 && selectedNodes[0]?.hasName('group');

  const getFillColor = () => {
    if (!selectedNode) return '#cccccc';
    if (isClipart) return '#cccccc'; // Use a generic icon for multipart
    if (typeof selectedNode.fill === 'function') {
      return selectedNode.fill();
    }
    const textChild = selectedNode.findOne?.('Text, .mainChar, .text');
    if (textChild && typeof textChild.fill === 'function') {
      return textChild.fill();
    }
    return null;
  };

  const currentColor = canHaveColor && !isClipart && (selectedNode.getAttr('data-is-gradient') 
    ? 'linear-gradient(to right, #3b82f6, #a855f7)'
    : selectedNode.getAttr('data-solid-color') || (isLineOrCurve ? selectedNode.stroke() : getFillColor()) || '#000000');

  const handleAnimationApplied = (config: any) => {
    onAnimationChange(config);
    setAnimationPopoverOpen(false);
  };
  
  const isMultiSelectActive = isMultiSelectMode && hasSelection;

  return (
    <div id="object-properties" className={`inline-flex items-center justify-center gap-2 flex-nowrap p-2 ${!hasSelection ? 'opacity-50 pointer-events-none' : ''}`}>
       <Button
          variant={isMultiSelectActive ? "active" : "ghost"}
          size="icon"
          onClick={onMultiSelectToggle}
          title={isMultiSelectMode ? "Exit Multi-Select" : "Select Multiple"}
          disabled={!hasSelection}
        >
          <ListPlus className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onGroup} title="Group Items" disabled={selectedNodes.length <= 1}>
            <Group className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onUngroup} title="Ungroup Items" disabled={!isGroupSelected}>
            <Ungroup className="h-4 w-4" />
        </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 border" disabled={!canHaveColor}>
            {isClipart ? (
              <Paintbrush className="h-5 w-5" />
            ) : (
              <div className="h-5 w-5 rounded" style={{ background: canHaveColor ? currentColor : '#cccccc' }}></div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto">
           <ColorPropertiesPanel 
              selectedNode={selectedNode}
              onColorChange={onColorChange}
              onClipartPartColorChange={onClipartPartColorChange}
              isStroke={isLineOrCurve}
          />
        </PopoverContent>
      </Popover>
      
      {isText && (
         <Popover open={isTextPopoverOpen} onOpenChange={setTextPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                <Type className="h-4 w-4 mr-2" /> Text
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px]">
              <TextPropertiesPanel
                editingNode={selectedNode}
                onUpdateText={handleAddOrUpdateText}
                onClose={() => setTextPopoverOpen(false)}
              />
            </PopoverContent>
          </Popover>
      )}

      <Separator orientation="vertical" />
      
      <div className="flex items-center gap-1">
        <button onClick={() => onAlign('left')} className="align-btn" title="Align Left" disabled={!hasSelection}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="3" y2="12"></line><line x1="5" y1="5" x2="5" y2="19"></line><rect y="5" x="9" width="10" height="14" rx="2"></rect></svg></button>
        <button onClick={() => onAlign('center')} className="align-btn" title="Center on Canvas" disabled={!hasSelection}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="12" y2="12" /><line x1="12" x2="12" y1="3" y2="21" /></svg></button>
        <button onClick={() => onAlign('right')} className="align-btn" title="Align Right" disabled={!hasSelection}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="21" y2="12"></line><line x1="19" y1="5" x2="19" y2="19"></line><rect y="5" x="5" width="10" height="14" rx="2"></rect></svg></button>
      </div>

      <Separator orientation="vertical" />

      <div className="opacity-controls-horizontal w-32">
        <Label htmlFor="opacity-slider" className="text-xs mr-2">Opacity</Label>
        <Slider
          id="opacity-slider"
          min={0}
          max={1}
          step={0.05}
          value={[opacity]}
          onValueChange={(val) => handleOpacitySliderChange(val[0])}
          disabled={!hasSelection}
        />
      </div>

       <Separator orientation="vertical" />

       <div className="flex items-center gap-1">
          <button onClick={() => onFlip('horizontal')} className="align-btn text-xs px-2 h-auto py-1" disabled={!hasSelection}>Flip H</button>
          <button onClick={() => onFlip('vertical')} className="align-btn text-xs px-2 h-auto py-1" disabled={!hasSelection}>Flip V</button>
       </div>
      
       <Separator orientation="vertical" />
       
       <Popover open={isAnimationPopoverOpen} onOpenChange={setAnimationPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8" disabled={!hasSelection}>
              <Sparkles className="h-4 w-4 mr-2" /> Animate
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <AnimationPanel selectedNode={selectedNode} onAnimationChange={handleAnimationApplied} />
          </PopoverContent>
        </Popover>

      {isMask && maskHasImage && (
        <>
          <Separator orientation="vertical" />
          <Popover>
            <PopoverTrigger asChild>
               <Button variant="ghost" size="icon" disabled={!hasSelection}><Menu size={16}/></Button>
            </PopoverTrigger>
            <PopoverContent>
              <div id="mask-properties" className="py-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Mask Properties</h4>
                  <p className="text-xs text-gray-500 mb-2">Adjust the image inside the mask.</p>
                  <div className="flex items-center justify-center gap-2">
                      <button onClick={() => onMaskImageZoom('in')} className="align-btn" title="Zoom In"><ZoomIn size={16}/></button>
                      <button onClick={() => onMaskImageZoom('out')} className="align-btn" title="Zoom Out"><ZoomOut size={16}/></button>
                      <button onClick={onMaskImageReset} className="align-btn" title="Reset Image"><RefreshCw size={16}/></button>
                      <button onClick={() => onMaskImagePan('up')} className="align-btn" title="Move Up"><ArrowUp size={16}/></button>
                      <button onClick={() => onMaskImagePan('down')} className="align-btn" title="Move Down"><ArrowDown size={16}/></button>
                      <button onClick={() => onMaskImagePan('left')} className="align-btn" title="Move Left"><ArrowLeft size={16}/></button>
                      <button onClick={() => onMaskImagePan('right')} className="align-btn" title="Move Right"><ArrowRight size={16}/></button>
                  </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
};

export default ObjectPropertiesPanel;
