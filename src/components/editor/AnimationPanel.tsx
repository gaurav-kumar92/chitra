
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type AnimationPanelProps = {
  selectedNode: any;
  onAnimationChange: (config: any) => void;
};

const AnimationPanel: React.FC<AnimationPanelProps> = ({ selectedNode, onAnimationChange }) => {
  const [animationType, setAnimationType] = useState('none');
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (selectedNode) {
      setAnimationType(selectedNode.getAttr('data-animation-type') || 'none');
      setDuration(selectedNode.getAttr('data-animation-duration') || 1);
    }
  }, [selectedNode]);

  const handleApplyAnimation = () => {
    onAnimationChange({
      type: animationType,
      duration,
    });
  };
  
  const handleRemoveAnimation = () => {
    setAnimationType('none');
    onAnimationChange({
      type: 'none',
    });
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <h3 className="text-sm font-medium">Animation</h3>

      <div className="flex flex-col gap-2">
        <Label htmlFor="animation-type">Type</Label>
        <Select value={animationType} onValueChange={setAnimationType}>
          <SelectTrigger id="animation-type">
            <SelectValue placeholder="Select animation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="fade">Fade In</SelectItem>
            <SelectItem value="pulse">Pulse</SelectItem>
            <SelectItem value="shake">Shake</SelectItem>
            <SelectItem value="wipe-in">Wipe In</SelectItem>
            <SelectItem value="wipe-out">Wipe Out</SelectItem>
            <SelectItem value="pan">Pan</SelectItem>
            <SelectItem value="rise">Rise</SelectItem>
            <SelectItem value="pop">Pop</SelectItem>
            <SelectItem value="blur">Blur</SelectItem>
            <SelectItem value="breathe">Breathe</SelectItem>
            <SelectItem value="tumble">Tumble</SelectItem>
            <SelectItem value="drift">Drift</SelectItem>
            <SelectItem value="flash">Flash</SelectItem>
            <SelectItem value="stomp">Stomp</SelectItem>
            <SelectItem value="rotate">Rotate</SelectItem>
            <SelectItem value="flicker">Flicker</SelectItem>
            <SelectItem value="wiggle">Wiggle</SelectItem>
            <SelectItem value="stretch">Stretch</SelectItem>
            <SelectItem value="zoom-in">Zoom In</SelectItem>
            <SelectItem value="zoom-out">Zoom Out</SelectItem>
            <SelectItem value="swirl">Swirl</SelectItem>
            <SelectItem value="flip">Flip</SelectItem>
            <SelectItem value="drop">Drop</SelectItem>
            <SelectItem value="bounce">Bounce</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {animationType !== 'none' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="animation-duration">Duration (s)</Label>
          <div className='flex items-center gap-2'>
            <Slider
              id="animation-duration"
              min={0.1}
              max={5}
              step={0.1}
              value={[duration]}
              onValueChange={(val) => setDuration(val[0])}
            />
            <span className='text-xs font-mono'>{duration.toFixed(1)}s</span>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4">
        <Button variant="destructive" size="sm" onClick={handleRemoveAnimation}>Remove</Button>
        <Button size="sm" onClick={handleApplyAnimation}>Apply</Button>
      </div>
    </div>
  );
};

export default AnimationPanel;

    