
'use client';

import { useState, useCallback } from 'react';

type UseFrameHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    attachDoubleClick: (node: any) => void;
};

export const useFrameHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick,
}: UseFrameHandlerProps) => {
    const [isFrameDialogOpen, setFrameDialogOpen] = useState(false);
    const [editingFrameNode, setEditingFrameNode] = useState<any>(null);

    const handleAddFrame = useCallback((config: any) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        const { stage, layer } = canvasRef.current;
        
        let newFrame;
        const size = 100;
        const x = stage.width() / 2;
        const y = stage.height() / 2;
        
    
        const commonAttrs = {
            x: x, 
            y: y,
            strokeWidth: config.thickness,
            draggable: true,
            name: 'frame',
            'data-type': config.type
        };
    
        switch (config.type) {
          case 'rect':
            newFrame = new window.Konva.Rect({ ...commonAttrs, width: size, height: size, offsetX: size/2, offsetY: size/2 });
            break;
          case 'circle':
            newFrame = new window.Konva.Circle({ ...commonAttrs, radius: size / 2 });
            break;
          case 'triangle':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2 });
            break;
          case 'star':
            newFrame = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: 20, outerRadius: 40 });
            break;
          case 'polygon':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size/2 });
            break;
          case 'diamond':
            newFrame = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / (Math.sqrt(2)) });
            break;
        }
    
        if(newFrame) {
          const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          newFrame.setAttrs({
            'data-is-gradient': false,
            'data-solid-color': config.color || '#3b82f6',
            id: uniqueId,
          });
          newFrame.stroke(config.color || '#3b82f6');
        
          attachDoubleClick(newFrame);
          layer.add(newFrame);
          updateLayers();
          layer.draw();
          setSelectedNodes([newFrame]);
          
        }
        setFrameDialogOpen(false);
      }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick]);
    
      const handleUpdateFrame = useCallback((attrs: any) => {
        if (!editingFrameNode) return;
      
        if (attrs.thickness) {
          editingFrameNode.strokeWidth(attrs.thickness);
        }
        if (attrs.sides && editingFrameNode.getClassName() === 'RegularPolygon') {
          editingFrameNode.sides(attrs.sides);
        }
        canvasRef.current?.layer.draw();

      }, [editingFrameNode, canvasRef]);

    return {
        isFrameDialogOpen,
        setFrameDialogOpen,
        editingFrameNode,
        setEditingFrameNode,
        handleAddFrame,
        handleUpdateFrame,
    };
};

    