
'use client';

import { useState, useEffect } from 'react';

type ShapeDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddShape: (config: any) => void;
    onUpdateShape: (attrs: any) => void;
    editingNode: any;
};

const ShapeDialog: React.FC<ShapeDialogProps> = ({ isOpen, onClose, onAddShape, onUpdateShape, editingNode }) => {
    const [activeShapeForAddition, setActiveShapeForAddition] = useState<string | null>(null);
    const [thickness, setThickness] = useState(5);
    const [sides, setSides] = useState(6);
    const [tension, setTension] = useState(0.5);

    useEffect(() => {
        if (isOpen) {
            if (editingNode) {
                const shapeType = editingNode.getAttr('data-type');
                if (shapeType === 'line' || shapeType === 'arrow' || shapeType === 'curve') {
                    setThickness(editingNode.strokeWidth() || 5);
                }
                if (shapeType === 'polygon') {
                    setSides(editingNode.sides() || 6);
                }
                if (shapeType === 'curve') {
                    setTension(editingNode.getAttr('data-tension') || 0.5);
                }
            } else {
                // Reset to defaults when opening to add a new shape
                resetDialog();
            }
        }
    }, [editingNode, isOpen]);

    const resetDialog = () => {
        setActiveShapeForAddition(null);
        setThickness(5);
        setSides(6);
        setTension(0.5);
    };

    const handleClose = () => {
        resetDialog();
        onClose();
    };

    const handleAddButtonClick = () => {
        if (activeShapeForAddition) {
            onAddShape({
                type: activeShapeForAddition,
                thickness,
                sides,
                tension
            });
            handleClose();
        }
    };

    const handleShapeSelection = (shapeType: string) => {
        const config = {
            type: shapeType,
            thickness,
            sides,
            tension
        };
        if (['polygon', 'line', 'arrow', 'curve'].includes(shapeType)) {
            setActiveShapeForAddition(shapeType);
        } else {
            onAddShape(config);
            handleClose();
        }
    };
    
    if (!isOpen) {
        return null;
    }

    const shapeType = editingNode?.getAttr('data-type');
    const showThicknessControl = activeShapeForAddition === 'line' || activeShapeForAddition === 'arrow' || activeShapeForAddition === 'curve' || ['line', 'arrow', 'curve'].includes(shapeType);
    const showSidesControl = activeShapeForAddition === 'polygon' || shapeType === 'polygon';
    const showTensionControl = activeShapeForAddition === 'curve' || shapeType === 'curve';
    const showMainButtons = !activeShapeForAddition && !editingNode;
    const showAddButton = !!activeShapeForAddition;
    const isEditingLineLike = editingNode && (showThicknessControl || showSidesControl || showTensionControl);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="dialog-overlay" onClick={handleClose}></div>
            <div className="dialog flex flex-col" style={{ maxHeight: '85vh', maxWidth: '300px' }}>
                <h3 id="shape-dialog-title" className="text-lg font-semibold mb-4 flex-shrink-0">
                    {editingNode ? 'Edit Shape' : 'Add a Shape'}
                </h3>
                <div className="overflow-y-auto pr-4 flex-grow">
                   {showThicknessControl && (
                        <div id="shape-thickness-controls" className="shape-slider-container">
                            <label htmlFor="shape-thickness-slider" className="block text-sm font-medium text-gray-700">
                                Thickness (<span>{thickness}</span>px)
                            </label>
                            <input type="range" id="shape-thickness-slider" min="1" max="50" step="1" value={thickness} 
                                   onChange={(e) => { 
                                       const newThickness = Number(e.target.value);
                                       setThickness(newThickness);
                                       if(editingNode) onUpdateShape({ thickness: newThickness });
                                   }} 
                                   className="w-full" />
                        </div>
                    )}

                    {showSidesControl && (
                        <div id="shape-sides-controls" className="shape-slider-container">
                            <label htmlFor="shape-sides-slider" className="block text-sm font-medium text-gray-700">
                                Sides (<span>{sides}</span>)
                            </label>
                            <input type="range" id="shape-sides-slider" min="3" max="12" step="1" value={sides} 
                                   onChange={(e) => { 
                                       const newSides = Number(e.target.value);
                                       setSides(newSides);
                                       if(editingNode) onUpdateShape({ sides: newSides });
                                   }} 
                                   className="w-full" />
                        </div>
                    )}
                    
                    {showTensionControl && (
                        <div id="shape-tension-controls" className="shape-slider-container">
                            <label htmlFor="shape-tension-slider" className="block text-sm font-medium text-gray-700">
                                Tension (<span>{tension.toFixed(2)}</span>)
                            </label>
                            <input type="range" id="shape-tension-slider" min="0" max="2" step="0.05" value={tension} 
                                   onChange={(e) => { 
                                       const newTension = Number(e.target.value);
                                       setTension(newTension);
                                       if(editingNode) onUpdateShape({ tension: newTension });
                                   }} 
                                   className="w-full" />
                        </div>
                    )}

                    {showMainButtons && (
                        <div id="shape-buttons-container" className="shape-button-container mt-4">
                            <button className="shape-btn" data-shape="rect" title="Rectangle" onClick={() => handleShapeSelection('rect')}>
                                <svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="roundedRect" title="Rounded Rectangle" onClick={() => handleShapeSelection('roundedRect')}>
                                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="4" ry="4"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="circle" title="Circle" onClick={() => handleShapeSelection('circle')}>
                                <svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="triangle" title="Triangle" onClick={() => handleShapeSelection('triangle')}>
                                <svg viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2z"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="line" title="Line" onClick={() => handleShapeSelection('line')}>
                            <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M3 12h18"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="curve" title="Curve" onClick={() => handleShapeSelection('curve')}>
                               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12c4.4-4.4 8.8-4.4 13.2 0"/><path d="M20 12c-4.4 4.4-8.8 4.4-13.2 0"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="star" title="Star" onClick={() => handleShapeSelection('star')}>
                                <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="pentagon" title="Pentagon" onClick={() => handleShapeSelection('pentagon')}>
                                <svg viewBox="0 0 24 24"><path d="M12 2.5l9.51 6.91-3.63 11.09H6.12l-3.63-11.09L12 2.5z"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="polygon" title="Polygon" onClick={() => handleShapeSelection('polygon')}>
                                <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none"><path d="M12 2.5l7.79 4.5 0 9 -7.79 4.5 -7.79 -4.5 0 -9Z"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="arrow" title="Arrow" onClick={() => handleShapeSelection('arrow')}>
                                <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                            </button>
                            <button className="shape-btn" data-shape="heart" title="Heart" onClick={() => handleShapeSelection('heart')}>
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            </button>
                        </div>
                    )}
                     { editingNode && !isEditingLineLike && !showMainButtons && !showAddButton && (
                        <p className="text-center text-gray-500 mt-4">Color properties can be changed in the main panel.</p>
                     )}
                </div>
                
                <div className="dialog-actions flex justify-end gap-2 mt-4 flex-shrink-0">
                    <button id="cancel-shape-btn" className="dialog-button dialog-button-secondary" onClick={handleClose}>
                        {editingNode ? 'Done' : 'Cancel'}
                    </button>
                    {showAddButton && (
                        <button id="add-shape-btn" className="dialog-button dialog-button-primary" onClick={handleAddButtonClick}>
                            Add Shape
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShapeDialog;
    