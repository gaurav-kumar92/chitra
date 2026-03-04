
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon } from 'lucide-react';
import { useCanvas } from '@/contexts/CanvasContext';

const BackgroundImagePicker = () => {
  const { handleSetBackgroundImage } = useCanvas();

  return (
    <Button variant="ghost" className="h-8 w-8 p-0 border" onClick={handleSetBackgroundImage} title="Set Background Image">
      <ImageIcon className="h-5 w-5" />
    </Button>
  );
};

export default BackgroundImagePicker;
