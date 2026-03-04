
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Minimize } from 'lucide-react';
import { useCanvas } from '@/contexts/CanvasContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '../ui/separator';

const ZoomControls: React.FC = () => {
  const { canvasScale, zoomIn, zoomOut, fitToScreen } = useCanvas();

  const displayScale = `${Math.round(canvasScale * 100)}%`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="w-20 h-8 text-sm font-semibold"
          title="Zoom options"
        >
          {displayScale}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex flex-col gap-2">
            <Button variant="ghost" className='justify-between' onClick={zoomIn}>
                <span>Zoom In</span>
                <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className='justify-between' onClick={zoomOut}>
                <span>Zoom Out</span>
                <ZoomOut className="h-4 w-4" />
            </Button>
            <Separator />
            <Button variant="ghost" className='justify-between' onClick={fitToScreen}>
                <span>Fit to Screen</span>
                <Minimize className="h-4 w-4" />
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ZoomControls;
