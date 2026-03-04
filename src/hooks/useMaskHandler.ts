
'use client';

import { useState, useCallback } from 'react';


type UseMaskHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    attachDoubleClick: (node: any) => void;
    editingMaskNode: any;
    setEditingMaskNode: (node: any) => void;
};

export const useMaskHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    setIsLoading,
    attachDoubleClick,
    editingMaskNode,
    setEditingMaskNode,
}: UseMaskHandlerProps) => {
    const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);

    const addImageToMask = useCallback((maskGroup: any) => {
        if (!maskGroup || maskGroup.name() !== 'mask' || !canvasRef.current?.layer) return;
        const layer = canvasRef.current.layer;
    
        if (document.querySelector('#mask-image-file-input')) {
            return;
        }
    
        const imageFileInput = document.createElement('input');
        imageFileInput.id = 'mask-image-file-input';
        imageFileInput.type = 'file';
        imageFileInput.accept = "image/png, image/jpeg, image/jpg, image/gif, image/svg+xml";
        imageFileInput.style.display = 'none';
        document.body.appendChild(imageFileInput);
    
        let isFileSelected = false;
    
        imageFileInput.onchange = () => {
            isFileSelected = true;
            window.isOpeningFileDialog = false;
            
            if (imageFileInput.files && imageFileInput.files.length > 0) {
                const file = imageFileInput.files[0];
                const reader = new FileReader();
                reader.onloadstart = () => setIsLoading(true);
                reader.onload = (e) => {
                    window.Konva.Image.fromURL(e.target!.result, (img: any) => {

                        maskGroup.find('.placeholder-icon, .mask-image').forEach((child: any) => child.destroy());
                        
                        const maskWidth = maskGroup.width();
                        const maskHeight = maskGroup.height();
                        const imgWidth = img.width();
                        const imgHeight = img.height();
                        
                        const scale = Math.max(maskWidth / imgWidth, maskHeight / imgHeight);
                        
                        img.setAttrs({
                            name: 'mask-image',
                            x: 0,
                            y: 0,
                            scaleX: scale,
                            scaleY: scale,
                            draggable: true,
                            'data-original-width': imgWidth,
                            'data-original-height': imgHeight,
                             dragBoundFunc: function(pos: { x: number, y: number}) {
                              const imageRect = this.getClientRect({skipTransform: false});
                              
                              const minX = maskWidth - imageRect.width;
                              const maxX = 0;
                              const minY = maskHeight - imageRect.height;
                              const maxY = 0;
                              
                              const boundedX = Math.max(minX, Math.min(pos.x, maxX));
                              const boundedY = Math.max(minY, Math.min(pos.y, maxY));
                              
                              return {
                                  x: boundedX,
                                  y: boundedY,
                              };
                            }
                        });
                        
                        const borderShape = maskGroup.findOne('.border-shape');
                        if (borderShape) {
                             borderShape.fill('transparent');
                             borderShape.offsetX(0);
                             borderShape.offsetY(0);
                        }
                        
                        maskGroup.add(img);
                        img.moveToBottom();
    
                        layer.draw();
                        updateLayers();
                        setIsLoading(false);
                        
                    });
                };
                reader.onerror = () => {
                  setIsLoading(false);
                  console.error("Failed to read file");
                };
                reader.readAsDataURL(file);
            }
            
            // Cleanup
            if (imageFileInput.parentNode) {
                imageFileInput.parentNode.removeChild(imageFileInput);
            }
        };
    
        // Handle cancellation - detect when dialog closes without file selection
        const handleDialogClose = () => {
            setTimeout(() => {
                if (!isFileSelected && window.isOpeningFileDialog) {
                    // User cancelled or clicked outside
                    window.isOpeningFileDialog = false;
                    
                    // Cleanup the input element
                    if (imageFileInput.parentNode) {
                        imageFileInput.parentNode.removeChild(imageFileInput);
                    }
                }
            }, 300); // Increased timeout for better detection
        };
    
        // Listen for focus return (dialog closed)
        window.addEventListener('focus', handleDialogClose, { once: true });
        
        // Fallback: listen for click events (user clicked elsewhere)
        const handleClick = () => {
            setTimeout(() => {
                if (!isFileSelected && window.isOpeningFileDialog) {
                    window.isOpeningFileDialog = false;
                    if (imageFileInput.parentNode) {
                        imageFileInput.parentNode.removeChild(imageFileInput);
                    }
                }
            }, 100);
        };
        
        // Add click listener as backup
        setTimeout(() => {
            document.addEventListener('click', handleClick, { once: true });
        }, 500);
        
        window.isOpeningFileDialog = true;
        imageFileInput.click();
    }, [updateLayers, setIsLoading]);

    const handleAddMask = useCallback((config: any) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
        const { stage, layer } = canvasRef.current;
    
        const size = 150;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const group = new window.Konva.Group({
            x: stage.width() / 2,
            y: stage.height() / 2,
            width: size,
            height: size,
            draggable: true,
            name: 'mask',
            'data-type': config.type,
            'data-letter': config.letter,
            id: uniqueId,
            offsetX: size/2,
            offsetY: size/2
        });
    
        let borderShape: any;
    
        const commonAttrs = {
            x: size / 2, 
            y: size / 2,
            fill: '#f0f0f0', 
            stroke: config.borderColor,
            strokeWidth: config.borderThickness,
            name: 'border-shape',
        };
    
        switch (config.type) {
            case 'circle':
                borderShape = new window.Konva.Circle({ ...commonAttrs, radius: size / 2 });
                group.offsetX(0);
                group.offsetY(0);
                break;
            case 'star':
                borderShape = new window.Konva.Star({ ...commonAttrs, numPoints: 5, innerRadius: size / 4, outerRadius: size / 2 });
                group.offsetX(0);
                group.offsetY(0);
                break;
            case 'triangle':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 3, radius: size / 2 });
                group.offsetX(0);
                group.offsetY(0);
                break;
            case 'polygon':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: config.sides || 6, radius: size / 2 });
                group.offsetX(0);
                group.offsetY(0);
                break;
            case 'diamond':
                borderShape = new window.Konva.RegularPolygon({ ...commonAttrs, sides: 4, radius: size / (Math.sqrt(2)) });
                group.offsetX(0);
                group.offsetY(0);
                break;
            case 'heart':
                borderShape = new window.Konva.Path({
                x: 0,
                y: 0,
                data: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
                fill: '#f0f0f0', 
                stroke: config.borderColor,
                strokeWidth: config.borderThickness,
                name: 'border-shape',
                scale: { x: size / 24, y: size / 24 } // Scale path to fit the size
                });
                group.width(size);
                group.height(size);
            break;
            case 'alphabet':
                const textForClip = new window.Konva.Text({
                    text: config.letter || 'A',
                    fontSize: size,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold',
                });
                
                group.width(textForClip.width());
                group.height(textForClip.height());
                group.offsetX(textForClip.width() / 2);
                group.offsetY(textForClip.height() / 2);
    
                borderShape = new window.Konva.Text({
                    x: 0,
                    y: 0,
                    width: group.width(),
                    height: group.height(),
                    text: config.letter || 'A',
                    fontSize: size,
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontStyle: 'bold',
                    fill: '#f0f0f0',
                    stroke: config.borderColor,
                    strokeWidth: config.borderThickness,
                    name: 'border-shape',
                });
                break;
            default: // rect
                 borderShape = new window.Konva.Rect({ 
                    x: 0, 
                    y: 0,
                    width: size, 
                    height: size, 
                    fill: '#f0f0f0', 
                    stroke: config.borderColor, 
                    strokeWidth: config.borderThickness,
                    name: 'border-shape',
                });
                break;
        }
    
        if (borderShape) {
            group.add(borderShape);
        }
    
        const placeholderSvgPath = 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2 2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z';
        const placeholderIcon = new window.Konva.Path({
            data: placeholderSvgPath,
            fill: '#9ca3af',
            scale: { x: 2.5, y: 2.5 },
            name: 'placeholder-icon',
            x: group.width() / 2,
            y: group.height() / 2,
            offsetX: 12,
            offsetY: 12,
        });
        group.add(placeholderIcon);
    
        group.clipFunc(function (ctx: any) {
            if (borderShape) {
                const isRect = borderShape.getClassName() === 'Rect';
                const isText = borderShape.getClassName() === 'Text';
                const isPath = borderShape.getClassName() === 'Path';
        
                let localPos = {x: 0, y: 0};
                if (!isRect && !isText && group.offsetX() === 0) {
                    localPos.x = size/2;
                    localPos.y = size/2;
                }
                
                ctx.beginPath();
                if (isRect) {
                    ctx.rect(localPos.x, localPos.y, borderShape.width(), borderShape.height());
                } else if (isText) {
                    ctx.font = `${borderShape.fontStyle()} ${borderShape.fontSize()}px ${borderShape.fontFamily()}`;
                    ctx.fillText(borderShape.text(), localPos.x, localPos.y);
                } else if (isPath) {
                    // Manual heart path drawing
                    const scale = borderShape.scaleX();
                    ctx.save();
                    ctx.scale(scale, scale);
                    
                    // Heart path data translated to canvas commands
                    ctx.moveTo(12, 5.67);
                    ctx.bezierCurveTo(10.94, 4.61, 8.37, 2.04, 5.92, 2.04);
                    ctx.bezierCurveTo(2.32, 2.04, -0.65, 5.94, -0.65, 9.54);
                    ctx.bezierCurveTo(-0.65, 11.58, 0.44, 13.38, 2.98, 14.69);
                    ctx.lineTo(12, 21.23);
                    ctx.lineTo(21.02, 14.69);
                    ctx.bezierCurveTo(24.65, 12.33, 24.65, 7.18, 20.84, 4.61);

                    ctx.closePath();
                    
                    ctx.restore();
                } else if (borderShape.getClassName() === 'Circle') {
                    ctx.arc(localPos.x, localPos.y, borderShape.radius(), 0, Math.PI * 2, false);
                } else if (borderShape.getClassName() === 'Star') {
                    let rotation = borderShape.rotation() || 0;
                    let points = borderShape.numPoints();
                    let innerRadius = borderShape.innerRadius();
                    let outerRadius = borderShape.outerRadius();
                    ctx.moveTo(localPos.x, localPos.y - outerRadius);
        
                    for (let n = 1; n < points * 2; n++) {
                        let radius = n % 2 === 0 ? outerRadius : innerRadius;
                        let angle = (n * Math.PI) / points + rotation;
                        ctx.lineTo(localPos.x + radius * Math.sin(angle), localPos.y - radius * Math.cos(angle));
                    }
                } else if (borderShape.getClassName() === 'RegularPolygon') {
                    let sides = borderShape.sides();
                    let radius = borderShape.radius();
                    const startAngle = sides === 3 ? -Math.PI / 2 : (sides === 4 ? Math.PI / 4 : 0);
                    ctx.moveTo(localPos.x + radius * Math.cos(startAngle), localPos.y + radius * Math.sin(startAngle));
                    for (let i = 1; i <= sides; i++) {
                        ctx.lineTo(localPos.x + radius * Math.cos(startAngle + i * 2 * Math.PI / sides), localPos.y + radius * Math.sin(startAngle + i * 2 * Math.PI / sides));
                    }
                }
                ctx.closePath();
            }
        });
    
        attachDoubleClick(group);
        layer.add(group);
        updateLayers();
        layer.draw();
        setSelectedNodes([group]);
        setMaskDialogOpen(false);
      }, [canvasRef, updateLayers, setSelectedNodes, setMaskDialogOpen, attachDoubleClick]);

      const handleUpdateMask = useCallback((attrs: any) => {
        if (!editingMaskNode) return;
        const border = editingMaskNode.findOne('.border-shape');

        if (border) {
          if (attrs.borderColor) {
            border.stroke(attrs.borderColor);
          }
          if (attrs.borderThickness !== undefined) {
            border.strokeWidth(attrs.borderThickness);
          }
           if (attrs.sides && border.getClassName() === 'RegularPolygon') {
            border.sides(attrs.sides);
          }
        }
        canvasRef.current?.layer.draw();
    }, [editingMaskNode, canvasRef]);


    return {
        isMaskDialogOpen,
        setMaskDialogOpen,
        editingMaskNode,
        setEditingMaskNode,
        handleAddMask,
        handleUpdateMask,
        addImageToMask,
    };
};

    