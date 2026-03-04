
'use client';

import { useState, useEffect, FC } from 'react';

type MaskDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddMask: (config: any) => void;
    onUpdateMask: (attrs: any) => void;
    editingNode: any;
};

const MaskDialog: FC<MaskDialogProps> = ({ isOpen, onClose, onAddMask, onUpdateMask, editingNode }) => {
    const [activeMaskForAddition, setActiveMaskForAddition] = useState<string | null>(null);
    const [borderColor, setBorderColor] = useState('#3b82f6');
    const [borderThickness, setBorderThickness] = useState(0);
    const [sides, setSides] = useState(6);
    
    useEffect(() => {
        if (editingNode) {
            const border = editingNode.findOne('Shape,Circle,Rect,Star,RegularPolygon,Text');
            if (border) {
                setBorderColor(border.stroke() || '#3b82f6');
                setBorderThickness(border.strokeWidth() || 0);
            }
            const maskType = editingNode.getAttr('data-type');
            if (maskType === 'polygon') {
                const polygon = editingNode.findOne('RegularPolygon');
                if (polygon) {
                    setSides(polygon.sides() || 6);
                }
            }
        } else {
            resetDialog();
        }
    }, [editingNode, isOpen]);

    useEffect(() => {
        if (editingNode) {
            onUpdateMask({ borderColor, borderThickness, sides });
        }
    }, [borderColor, borderThickness, sides, editingNode, onUpdateMask]);

    const resetDialog = () => {
        setActiveMaskForAddition(null);
        setBorderColor('#3b82f6');
        setBorderThickness(0);
        setSides(6);
    };

    const handleClose = () => {
        resetDialog();
        onClose();
    };

    const handleAddButtonClick = () => {
        if (activeMaskForAddition) {
            onAddMask({
                type: activeMaskForAddition,
                borderColor,
                borderThickness,
                sides,
            });
            handleClose();
        }
    };
    
    const handleShapeSelection = (shapeType: string) => {
        if (shapeType === 'polygon') {
            setActiveMaskForAddition(shapeType);
        } else {
            onAddMask({ type: shapeType, borderColor, borderThickness, sides: 6 });
            handleClose();
        }
    };
    
    if (!isOpen) {
        return null;
    }
    
    const showSidesControl = activeMaskForAddition === 'polygon' || (editingNode && editingNode.getAttr('data-type') === 'polygon');
    const showMainButtons = !activeMaskForAddition && !editingNode;
    const showAddButton = !!activeMaskForAddition;
    const dialogTitle = editingNode ? 'Edit Mask' : 'Add a Mask';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={handleClose}></div>
            <div className="dialog flex flex-col" style={{maxWidth: '500px', maxHeight: '85vh'}}>
                <h3 className="text-lg font-semibold mb-4 flex-shrink-0">{dialogTitle}</h3>
                
                <div className="overflow-y-auto pr-4 flex-grow">
                    <div className="flex flex-col gap-4 mb-4">
                        <div className="color-picker-container-inline justify-center">
                            <label htmlFor="mask-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Border Color</label>
                            <div id="color-preview-mask" className="color-preview-circle" style={{backgroundColor: borderColor}}></div>
                            <input type="color" id="mask-color-picker" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} className="color-picker-input-hidden" />
                        </div>
                        <div>
                            <label htmlFor="mask-border-thickness-slider" className="block text-sm font-medium text-gray-700">
                            Border Thickness (<span>{borderThickness}</span>px)
                            </label>
                            <input type="range" id="mask-border-thickness-slider" min="0" max="50" step="1" value={borderThickness} onChange={(e) => setBorderThickness(Number(e.target.value))} className="w-full" />
                        </div>
                        {showSidesControl && (
                            <div>
                                <label htmlFor="mask-sides-slider" className="block text-sm font-medium text-gray-700">
                                    Sides (<span>{sides}</span>)
                                </label>
                                <input type="range" id="mask-sides-slider" min="3" max="12" step="1" value={sides} onChange={(e) => setSides(Number(e.target.value))} className="w-full" />
                            </div>
                        )}
                    </div>

                    {showMainButtons && (
                        <>
                            <div id="mask-buttons-container" className="shape-button-container mt-4">
                                <button className="shape-btn" data-mask-shape="rect" title="Rectangle Mask" onClick={() => handleShapeSelection('rect')}>
                                    <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                                </button>
                                <button className="shape-btn" data-mask-shape="circle" title="Circle Mask" onClick={() => handleShapeSelection('circle')}>
                                    <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
                                </button>
                                <button className="shape-btn" data-mask-shape="triangle" title="Triangle Mask" onClick={() => handleShapeSelection('triangle')}>
                                    <svg viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2z"/></svg>
                                </button>
                                <button className="shape-btn" data-mask-shape="star" title="Star Mask" onClick={() => handleShapeSelection('star')}>
                                    <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                </button>
                                <button className="shape-btn" data-mask-shape="polygon" title="Polygon Mask" onClick={() => handleShapeSelection('polygon')}>
                                    <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"><path d="M12 2.5l7.79 4.5 0 9 -7.79 4.5 -7.79 -4.5 0 -9Z"/></svg>
                                </button>
                                <button className="shape-btn" data-mask-shape="diamond" title="Diamond Mask" onClick={() => handleShapeSelection('diamond')}>
                                    <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"><path d="M12 2L22 12 12 22 2 12 12 2Z"/></svg>
                                </button>
                                <button className="shape-btn" data-mask-shape="heart" title="Heart Mask" onClick={() => handleShapeSelection('heart')}>
                                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="currentColor"><path d="M12 5.67L10.94 4.61c-2.57-2.57-6.72-2.57-9.29 0s-2.57 6.72 0 9.29L12 21.23l10.35-10.35c2.57-2.57 2.57-6.72 0-9.29s-6.72-2.57-9.29 0L12 5.67z"/></svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="dialog-actions flex justify-end gap-2 mt-4 flex-shrink-0">
                    <button id="cancel-mask-btn" className="dialog-button dialog-button-secondary" onClick={handleClose}>
                        {editingNode ? 'Done' : 'Cancel'}
                    </button>
                    {showAddButton && (
                        <button id="add-mask-btn" className="dialog-button dialog-button-primary" onClick={handleAddButtonClick}>
                            Add Mask
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaskDialog;
