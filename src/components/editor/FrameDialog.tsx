// src/components/editor/FrameDialog.tsx

'use client';

import { useState, useEffect } from 'react';

type FrameDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddFrame: (config: any) => void;
    onUpdateFrame: (attrs: any) => void;
    editingNode: any;
};

const FrameDialog: React.FC<FrameDialogProps> = ({ isOpen, onClose, onAddFrame, onUpdateFrame, editingNode }) => {
    const [activeFrameForAddition, setActiveFrameForAddition] = useState<string | null>(null);
    const [color, setColor] = useState('#3b82f6');
    const [thickness, setThickness] = useState(10);
    const [sides, setSides] = useState(6);
    const isPolygon = editingNode && editingNode.getAttr('data-type') === 'polygon';

    useEffect(() => {
        if (isOpen) {
            if (editingNode) {
                setColor(editingNode.stroke() || '#3b82f6');
                setThickness(editingNode.strokeWidth() || 10);
                const frameType = editingNode.getAttr('data-type');
                if (frameType === 'polygon') {
                    setSides(editingNode.sides() || 6);
                }
            } else {
                resetDialog();
            }
        }
    }, [editingNode, isOpen]);

    const resetDialog = () => {
        setActiveFrameForAddition(null);
        setColor('#3b82f6');
        setThickness(10);
        setSides(6);
    };

    const handleClose = () => {
        if (editingNode) {
            onUpdateFrame({ color, thickness, sides });
        }
        resetDialog();
        onClose();
    };
    
    const handleAddButtonClick = () => {
        if (activeFrameForAddition) {
            onAddFrame({
                type: activeFrameForAddition,
                color,
                thickness,
                sides,
            });
            handleClose();
        }
    };

    const handleShapeSelection = (shapeType: string) => {
        if (shapeType === 'polygon' || shapeType === 'diamond') {
            setActiveFrameForAddition(shapeType);
        } else {
            onAddFrame({ type: shapeType, color, thickness, sides: 6 });
            handleClose();
        }
    };
    
    if (!isOpen) {
        return null;
    }

    const showSidesControl = activeFrameForAddition === 'polygon' || (editingNode && editingNode.getAttr('data-type') === 'polygon');
    const showMainButtons = !activeFrameForAddition && !editingNode;
    const showAddButton = !!activeFrameForAddition;
    const dialogTitle = editingNode ? 'Edit Frame' : 'Add Frame';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={handleClose}></div>
            <div className="dialog">
                <h3 className="text-lg font-semibold mb-4">{dialogTitle}</h3>
                <div className="flex flex-col gap-4 mb-4">
                     {/*} <div className="color-picker-container-inline justify-center">
                        <label htmlFor="frame-color-picker" className="block text-sm font-medium text-gray-700 mr-4">Color</label>
                        <div id="color-preview-frame" className="color-preview-circle" style={{backgroundColor: color}}></div>
                        <input type="color" id="frame-color-picker" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker-input-hidden" />
                    </div> */}
                    <div>
                        <label htmlFor="frame-thickness-slider" className="block text-sm font-medium text-gray-700">
                            Thickness (<span>{thickness}</span>px)
                        </label>
                        <input type="range" id="frame-thickness-slider" min="1" max="50" step="1" value={thickness} onChange={(e) => setThickness(Number(e.target.value))} className="w-full" />
                    </div>
                    {showSidesControl && (
                        <div>
                            <label htmlFor="frame-sides-slider" className="block text-sm font-medium text-gray-700">
                                Sides (<span>{sides}</span>)
                            </label>
                            <input type="range" id="frame-sides-slider" min="3" max="12" step="1" value={sides} onChange={(e) => setSides(Number(e.target.value))} className="w-full" />
                        </div>
                    )}
                </div>

                {showMainButtons && (
                    <div id="frame-buttons-container" className="shape-button-container mt-4">
                        <button className="shape-btn" data-frame-shape="rect" title="Rectangle Frame" onClick={() => handleShapeSelection('rect')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1" /></svg>
                        </button>
                        <button className="shape-btn" data-frame-shape="circle" title="Circle Frame" onClick={() => handleShapeSelection('circle')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>
                        </button>
                         <button className="shape-btn" data-frame-shape="triangle" title="Triangle Frame" onClick={() => handleShapeSelection('triangle')}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L1 21h22L12 2z"/></svg>
                        </button>
                        <button className="shape-btn" data-frame-shape="star" title="Star Frame" onClick={() => handleShapeSelection('star')}>
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        </button>
                        <button className="shape-btn" data-frame-shape="polygon" title="Polygon Frame" onClick={() => handleShapeSelection('polygon')}>
                            <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M12 2.5l7.79 4.5v9l-7.79 4.5-7.79-4.5v-9L12 2.5z"/></svg>
                        </button>
                        <button className="shape-btn" data-frame-shape="diamond" title="Diamond Frame" onClick={() => handleShapeSelection('diamond')}>
                            <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M12 2L22 12 12 22 2 12 12 2z"/></svg>
                        </button>
                    </div>
                )}
                <div className="dialog-actions flex justify-end gap-2 mt-4">
                     <button id="cancel-frame-btn" className="dialog-button dialog-button-secondary" onClick={handleClose}>
                        {editingNode ? 'Done' : 'Cancel'}
                    </button>
                    {showAddButton && (
                        <button id="add-frame-btn" className="dialog-button dialog-button-primary" onClick={handleAddButtonClick}>
                            Add Frame
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FrameDialog;
