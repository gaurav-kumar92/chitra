
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';

type BackgroundImagePanelProps = {
  onZoom: (direction: 'in' | 'out') => void;
  onPan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onReset: () => void;
  onRemove: () => void;
};

const BackgroundImagePanel: React.FC<BackgroundImagePanelProps> = ({ onZoom, onPan, onReset, onRemove }) => {
  return (
    <div id="background-image-properties" className="py-2">
      <div className="flex flex-col items-center justify-center gap-2">
        <h4 className="text-sm font-medium text-gray-700">Background Image</h4>
        <div className="grid grid-cols-4 gap-1">
            <Button variant="ghost" size="icon" onClick={() => onZoom('in')} title="Zoom In"><ZoomIn size={16}/></Button>
            <Button variant="ghost" size="icon" onClick={() => onZoom('out')} title="Zoom Out"><ZoomOut size={16}/></Button>
            <Button variant="ghost" size="icon" onClick={() => onPan('up')} title="Move Up"><ArrowUp size={16}/></Button>
            <Button variant="ghost" size="icon" onClick={() => onPan('down')} title="Move Down"><ArrowDown size={16}/></Button>
            <Button variant="ghost" size="icon" onClick={() => onPan('left')} title="Move Left"><ArrowLeft size={16}/></Button>
            <Button variant="ghost" size="icon" onClick={() => onPan('right')} title="Move Right"><ArrowRight size={16}/></Button>
            <Button variant="ghost" size="icon" onClick={onReset} title="Reset Image"><RefreshCw size={16}/></Button>
            <Button variant="destructive" size="icon" onClick={onRemove} title="Remove Image"><Trash2 size={16}/></Button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundImagePanel;
