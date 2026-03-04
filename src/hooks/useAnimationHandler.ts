
'use client';

import { useCallback, useRef } from 'react';

type UseAnimationHandlerProps = {
  canvasRef: React.RefObject<{ stage: any; layer: any }>;
  selectedNodes: any[];
  forceRecord?: () => void;
};

export const useAnimationHandler = ({
  canvasRef,
  selectedNodes,
  forceRecord,
}: UseAnimationHandlerProps) => {
  const activeTweens = useRef<Map<any, any>>(new Map());
  const animatedNodesRef = useRef<any[]>([]);
  const animationMetaRef = useRef<Map<any, { type: string; duration: number }>>(
    new Map()
  );

  const resetNodeState = (node: any) => {
    const originalState = node.getAttr('data-original-state');
    if (originalState) {
      node.opacity(originalState.opacity);
     // node.scaleX(originalState.scaleX);
     // node.scaleY(originalState.scaleY);
      node.rotation(originalState.rotation);
     // node.offsetX(originalState.offsetX);
     // node.offsetY(originalState.offsetY);
    } else {
        node.opacity(1);
    }
    node.clearCache(); // Important for filter-based animations like blur
    node.clipWidth(undefined); // Clear clipping
    node.getLayer()?.batchDraw();
  };

  const playAnimationForNodes = useCallback((nodes: any[]) => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    

    


    nodes.forEach((node: any) => {
        
      // 🔴 STOP existing animation for THIS node only
      const existingTween = activeTweens.current.get(node);
      if (existingTween) {
        existingTween.pause();
        existingTween.reset();
        activeTweens.current.delete(node); // ✅ correct Konva API
        
      }
      const animationType = node.getAttr('data-animation-type');

        if (!animationType || animationType === 'none') {
            resetNodeState(node);
            return;
        }
        
        // This is the fix for the jumping bug.
        // We get the bounding box *after* any offsets have been applied.
        // ✅ FIX: Center animation origin WITHOUT visual jump
// ✅ TRUE CENTER FIX — uses parent coordinate space


// preserve visual position in parent space
const absTransform = node.getAbsoluteTransform().copy();
const parentTransform = node.getParent()?.getAbsoluteTransform().copy();
parentTransform?.invert();

// current visual position in parent space
const pos = absTransform.point({ x: 0, y: 0 });
const parentPos = parentTransform
  ? parentTransform.point(pos)
  : pos;

// restore visual position (NO JUMP)
node.position({
  x: parentPos.x,
  y: parentPos.y,
});
 //1️⃣ Capture ORIGINAL state (before any mutation)
const originalState = {
  x: node.x(),
  y: node.y(),
  opacity: node.opacity(),
  scaleX: node.scaleX(),
  scaleY: node.scaleY(),
  rotation: node.rotation(),
  offsetX: node.offsetX(),
  offsetY: node.offsetY(),
};

node.setAttr('data-original-state', originalState);
node.addName('animating');

// 2️⃣ Compute visual bounds in LOCAL space
const rect = node.getClientRect({ skipTransform: true });

// 3️⃣ Compute new center offset
const newOffsetX = rect.width / 2;
const newOffsetY = rect.height / 2;

// 4️⃣ Compute delta from current offset
const dx = newOffsetX - originalState.offsetX;
const dy = newOffsetY - originalState.offsetY;

// 5️⃣ Apply offset
node.offsetX(newOffsetX);
node.offsetY(newOffsetY);

// 6️⃣ COMPENSATE POSITION (THIS WAS MISSING 🔥)
node.x(originalState.x + dx * originalState.scaleX);
node.y(originalState.y + dy * originalState.scaleY);

        

// 5. Start animation
const duration = node.getAttr('data-animation-duration') || 1;
        
        node.setAttr('data-original-state', originalState);
        node.addName('animating');

        // Centralize origin for rotational and scaling animations
        // but keep original position.
       

       
        let tween: any;

        switch (animationType) {
            case 'fade':
                node.opacity(0);
                tween = new window.Konva.Tween({ node, duration, opacity: 1 });
                break;
            case 'pulse':
                tween = new window.Konva.Tween({ node, duration, scaleX: originalState.scaleX * 1.2, scaleY: originalState.scaleY * 1.2, easing: window.Konva.Easings.EaseInOut, yoyo: true });
                break;
            case 'shake':
                tween = new window.Konva.Tween({ node, duration: 0.1, rotation: originalState.rotation + 5, easing: window.Konva.Easings.EaseInOut, yoyo: true, onFinish: () => node.rotation(originalState.rotation) });
                break;
            case 'wipe-in':
                node.clip({ x: 0, y: 0, width: 0, height: originalState.height });
                tween = new window.Konva.Tween({ node, duration, clipWidth: originalState.width });
                break;
            case 'wipe-out':
                node.clip({ x: 0, y: 0, width: originalState.width, height: originalState.height });
                tween = new window.Konva.Tween({ node, duration, clipWidth: 0 });
                break;
            case 'pan':
                node.x(originalState.x - 100);
                tween = new window.Konva.Tween({ node, duration, x: originalState.x, easing: window.Konva.Easings.EaseOut });
                break;
            case 'rise':
                node.y(originalState.y + 100);
                node.opacity(0);
                tween = new window.Konva.Tween({ node, duration, y: originalState.y, opacity: 1, easing: window.Konva.Easings.EaseOut });
                break;
            case 'pop':
                node.scale({ x: 0, y: 0 });
                tween = new window.Konva.Tween({ node, duration, scaleX: originalState.scaleX, scaleY: originalState.scaleY, easing: window.Konva.Easings.ElasticEaseOut });
                break;
            case 'blur':
                node.cache();
                node.filters([window.Konva.Filters.Blur]);
                node.blurRadius(20);
                tween = new window.Konva.Tween({ node, duration, blurRadius: 0, easing: window.Konva.Easings.EaseOut });
                break;
            case 'breathe':
                tween = new window.Konva.Tween({ node, duration: duration * 2, scaleX: originalState.scaleX * 1.05, scaleY: originalState.scaleY * 1.05, easing: window.Konva.Easings.EaseInOut, yoyo: true });
                break;
            case 'tumble':
                tween = new window.Konva.Tween({ node, duration, rotation: 360, scaleX: 0.1, scaleY: 0.1, easing: window.Konva.Easings.EaseIn });
                break;
            case 'drift':
                node.x(originalState.x - 50);
                node.y(originalState.y + 50);
                tween = new window.Konva.Tween({ node, duration, x: originalState.x, y: originalState.y, easing: window.Konva.Easings.EaseOut });
                break;
            case 'flash':
                node.opacity(0);
                tween = new window.Konva.Tween({ node, duration: 0.2, opacity: 1, easing: window.Konva.Easings.EaseInOut, yoyo: true });
                break;
            case 'stomp':
                node.y(originalState.y - 200);
                node.opacity(0);
                tween = new window.Konva.Tween({ node, duration: duration * 0.5, y: originalState.y, opacity: 1, easing: window.Konva.Easings.BounceEaseOut });
                break;
            case 'rotate':
                node.rotation(0);
                tween = new window.Konva.Tween({ node, duration, rotation: 360 });
                break;
            case 'flicker':
                tween = new window.Konva.Tween({ node, duration: 0.1, opacity: 0.5, easing: window.Konva.Easings.EaseInOut, yoyo: true });
                break;
            case 'wiggle':
                tween = new window.Konva.Tween({ node, duration: 0.2, rotation: originalState.rotation + 2, easing: window.Konva.Easings.EaseInOut, yoyo: true });
                break;
            case 'stretch':
                node.scaleY(0.1);
                tween = new window.Konva.Tween({ node, duration, scaleY: originalState.scaleY, easing: window.Konva.Easings.ElasticEaseOut });
                break;
            case 'zoom-in':
                node.scale({ x: 0, y: 0 });
                tween = new window.Konva.Tween({ node, duration, scaleX: originalState.scaleX, scaleY: originalState.scaleY, easing: window.Konva.Easings.EaseOut });
                break;
            case 'zoom-out':
                node.scale({ x: originalState.scaleX * 2, y: originalState.scaleY * 2 });
                node.opacity(0);
                tween = new window.Konva.Tween({ node, duration, scaleX: originalState.scaleX, scaleY: originalState.scaleY, opacity: 1, easing: window.Konva.Easings.EaseOut });
                break;
            case 'swirl':
                node.scale({ x: 0, y: 0 });
                node.rotation(360);
                tween = new window.Konva.Tween({ node, duration, scaleX: originalState.scaleX, scaleY: originalState.scaleY, rotation: originalState.rotation, easing: window.Konva.Easings.EaseOut });
                break;
            case 'flip':
                node.scaleX(0);
                tween = new window.Konva.Tween({ node, duration, scaleX: originalState.scaleX, easing: window.Konva.Easings.ElasticEaseOut });
                break;
            case 'drop':
                node.y(originalState.y - 200);
                tween = new window.Konva.Tween({ node, duration, y: originalState.y, easing: window.Konva.Easings.BounceEaseOut });
                break;
            case 'bounce':
                node.y(originalState.y - 100);
                tween = new window.Konva.Tween({ node, duration: duration * 1.5, y: originalState.y, easing: window.Konva.Easings.BounceEaseOut });
                break;
            default:
                resetNodeState(node);
                return;
        }
      
      if (tween) {
        tween.play();
        activeTweens.current.set(node, tween);
      }
    });
  }, [canvasRef]);


    const handleAnimationChange = useCallback((config: any) => {
      if (selectedNodes.length === 0) return;
    
      selectedNodes.forEach(node => {
        node.setAttr('data-animation-type', config.type);
        node.setAttr('data-animation-duration', config.duration);
    
        animationMetaRef.current.set(node, {
          type: config.type,
          duration: config.duration,
        });
      });
    
      animatedNodesRef.current = [...selectedNodes];
    
      playAnimationForNodes(selectedNodes);
      forceRecord?.();
    }, [selectedNodes, forceRecord, playAnimationForNodes]);
    
  
  const timelineState = {
    getDuration: () => {
      const durations = Array.from(animationMetaRef.current.values()).map(
        meta => (meta.duration || 1) * 1000
      );
      return durations.length > 0 ? Math.max(...durations) : 1000;
    },
  
    seek: (timeMs: number) => {
      // existing seek logic
    },
  
    bindStage: (_stage: any) => {},
  };
  
  return {
    handleAnimationChange,
    timelineState,
  };
};
