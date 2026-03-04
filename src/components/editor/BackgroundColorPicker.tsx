
'use client';

import React from 'react';
import ColorPropertiesPanel from './ColorPropertiesPanel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '../ui/button';

type BackgroundColorPickerProps = {
  onChange: (config: any) => void;
  value: any;
};

const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  onChange,
  value,
}) => {
  const mockNode = {
    name: () => 'background',
    getAttr: (attr: string) => {
      switch (attr) {
        case 'data-is-gradient': return value.isGradient;
        case 'data-solid-color': return value.solidColor;
        case 'data-color-stops': return value.colorStops;
        case 'data-gradient-direction': return value.gradientDirection;
        case 'data-is-transparent': return value.isTransparent;
        default: return undefined;
      }
    },
    hasName: (name: string) => name === 'background',
    findOne: () => null,
    fill: () => value.solidColor,
  };

  const currentColor = value.isTransparent
    ? 'transparent'
    : value.isGradient 
    ? 'linear-gradient(to right, #3b82f6, #a855f7)'
    : value.solidColor;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 border">
          <div 
            className="h-5 w-5 rounded" 
            style={{
              background: currentColor,
              border: value.isTransparent ? '1px dashed #000' : 'none'
            }}
          ></div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background
          </label>
          <ColorPropertiesPanel
            selectedNode={mockNode}
            onColorChange={onChange}
            isStroke={false}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BackgroundColorPicker;
