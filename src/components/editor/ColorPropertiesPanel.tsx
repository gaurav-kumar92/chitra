
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

type ColorStop = {
    id: string;
    stop: number;
    color: string;
};

type ColorPropertiesPanelProps = {
    selectedNode: any;
    onColorChange: (config: any) => void;
    onClipartPartColorChange: (partName: string, color: string) => void;
    isStroke?: boolean;
};

let nextId = 0;

const ColorPropertiesPanel: React.FC<ColorPropertiesPanelProps> = ({ selectedNode, onColorChange, onClipartPartColorChange, isStroke = false }) => {
    const [isGradient, setIsGradient] = useState(false);
    const [isTransparent, setIsTransparent] = useState(false);
    const [solidColor, setSolidColor] = useState('#3b82f6');
    const [gradientDirection, setGradientDirection] = useState('top-to-bottom');
    const [colorStops, setColorStops] = useState([
        {
          id: crypto.randomUUID(),
          stop: 0,
          color: '#ffffff',
        },
        {
          id: crypto.randomUUID(),
          stop: 1,
          color: '#000000',
        },
      ]);
    
    const isInitializing = useRef(false);

    const isClipart = useMemo(() => selectedNode?.hasName('clipart'), [selectedNode]);

    const clipartParts = useMemo(() => {
        if (!isClipart) return [];

        const partNodes = selectedNode.find((node: any) => node.name().startsWith('clipart-'));
        const partData = new Map<string, { color: string; nodes: any[] }>();

        partNodes.forEach((node: any) => {
            let partName = node.name().replace('clipart-', '');
            
            if (partName.toLowerCase().includes('eye')) {
                partName = 'eyes';
            }

            if (!partData.has(partName)) {
                partData.set(partName, { color: node.fill(), nodes: [] });
            }
            partData.get(partName)!.nodes.push(node);
        });

        return Array.from(partData.entries()).map(([name, data]) => ({
            name,
            initialColor: data.color,
        }));
    }, [selectedNode, isClipart]);

    const [partColors, setPartColors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isClipart) {
            const initialColors = clipartParts.reduce((acc, part) => {
                acc[part.name] = part.initialColor;
                return acc;
            }, {} as { [key: string]: string });
            setPartColors(initialColors);
        }
    }, [isClipart, clipartParts]);

    const handlePartColorChange = (partName: string, color: string) => {
        setPartColors(prev => ({ ...prev, [partName]: color }));
        onClipartPartColorChange(partName, color);
    };

    const handleUpdate = useCallback(() => {
        if (isInitializing.current || isClipart) return;
        
        onColorChange({
            isGradient,
            solidColor,
            colorStops,
            gradientDirection,
            isTransparent,
        });
    }, [isGradient, solidColor, colorStops, gradientDirection, isTransparent, onColorChange, isClipart]);

    useEffect(() => {
        if (selectedNode && !isClipart) {
            isInitializing.current = true;
            
            let nodeIsTransparent = selectedNode.getAttr('data-is-transparent') || false;
            setIsTransparent(nodeIsTransparent);

            let nodeIsGradient = selectedNode.getAttr('data-is-gradient') || false;
            
            if (!nodeIsGradient && (selectedNode.hasName('textGroup') || selectedNode.hasName('circularText'))) {
                const textChild = selectedNode.findOne('Text, .mainChar');
                if (textChild) {
                    nodeIsGradient = textChild.getAttr('data-is-gradient') || false;
                }
            }
            
            setIsGradient(nodeIsGradient);
    
            if (nodeIsGradient) {
                let stops = selectedNode.getAttr('data-color-stops');
                let direction = selectedNode.getAttr('data-gradient-direction');
                
                if ((!stops || stops.length === 0) && (selectedNode.hasName('textGroup') || selectedNode.hasName('circularText'))) {
                    const textChild = selectedNode.findOne('Text, .mainChar');
                    if (textChild) {
                        stops = textChild.getAttr('data-color-stops');
                        direction = textChild.getAttr('data-gradient-direction');
                    }
                }
                
                if (stops && stops.length > 0) {
                    setColorStops(stops.map((s: any, i: number) => ({...s, id: s.id || i})));
                } else {
                    let color1 = selectedNode.getAttr('data-color1');
                    let color2 = selectedNode.getAttr('data-color2');
                    
                    if (selectedNode.hasName('textGroup') || selectedNode.hasName('circularText')) {
                        const textChild = selectedNode.findOne('Text, .mainChar');
                        if (textChild) {
                            color1 = color1 || textChild.getAttr('data-color1');
                            color2 = color2 || textChild.getAttr('data-color2');
                        }
                    }
                    
                    setColorStops([
                        { id: crypto.randomUUID(), stop: 0, color: color1 || '#3b82f6' },
                        { id: crypto.randomUUID(), stop: 1, color: color2 || '#a855f7' },
                    ]);
                }
                setGradientDirection(direction || 'top-to-bottom');
            } else {
                let nodeColor = selectedNode.getAttr('data-solid-color');
                
                if (!nodeColor && (selectedNode.hasName('textGroup') || selectedNode.hasName('circularText'))) {
                    const textChild = selectedNode.findOne('Text, .mainChar');
                    if (textChild) {
                        nodeColor = textChild.getAttr('data-solid-color') || textChild.fill();
                    }
                } else if (!nodeColor) {
                    const fillValue = typeof selectedNode.fill === 'function' ? selectedNode.fill() : null;
                    const strokeValue = typeof selectedNode.stroke === 'function' ? selectedNode.stroke() : null;
                    
                    if (fillValue && typeof fillValue === 'string') {
                        nodeColor = fillValue;
                    } else if (strokeValue && typeof strokeValue === 'string') {
                        nodeColor = strokeValue;
                    }
                }
                
                setSolidColor(nodeColor || '#3b82f6');
            }
            
            setTimeout(() => {
                isInitializing.current = false;
            }, 0);
        }
    }, [selectedNode, isClipart]);

    useEffect(() => {
        handleUpdate();
    }, [isGradient, solidColor, colorStops, gradientDirection, isTransparent, handleUpdate]);
    
    const label = isStroke ? 'Stroke' : 'Fill';

    const handleAddColorStop = () => {
        const newStop = (colorStops[colorStops.length - 1]?.stop || 0 + 1) / 2;
        const newColor = colorStops[colorStops.length - 1]?.color || '#ffffff';
        const newStops = [...colorStops, { id: crypto.randomUUID(), stop: newStop, color: newColor }];
        newStops.sort((a, b) => a.stop - b.stop);
        setColorStops(newStops);
    };

    const handleRemoveColorStop = (id: string) => {
        if (colorStops.length <= 2) return;
        setColorStops(colorStops.filter(stop => stop.id !== id));
    };

    const handleColorStopChange = (id: string, field: 'color' | 'stop', value: string | number) => {
        const newStops = colorStops.map(stop => 
            stop.id === id ? { ...stop, [field]: value } : stop
        );
        if (field === 'stop') {
            newStops.sort((a, b) => a.stop - b.stop);
        }
        setColorStops(newStops);
    };

    if (isClipart) {
        // Simple title case for labels
        const formatPartName = (name: string) => {
            return name.charAt(0).toUpperCase() + name.slice(1);
        }

        return (
            <div className="flex flex-col gap-4 p-2">
                <h4 className="text-sm font-medium text-center mb-2">Clipart Colors</h4>
                {clipartParts.length === 0 && <div className="p-2 text-center text-sm text-gray-500">No editable parts.</div>}
                {clipartParts.map(part => (
                    <div key={part.name} className="color-picker-container-inline justify-between">
                        <label className="block text-sm font-medium text-gray-700">{formatPartName(part.name)}</label>
                        <div className="relative">
                            <div className="color-preview-circle" style={{ backgroundColor: partColors[part.name] || '#000000' }}></div>
                            <input 
                                type="color" 
                                value={partColors[part.name] || '#000000'} 
                                onChange={(e) => handlePartColorChange(part.name, e.target.value)} 
                                className="color-picker-input-hidden" 
                            />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="border-t border-b border-gray-200 py-4 my-4">
             <div className="mb-4">
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        id="universal-transparent-checkbox" 
                        checked={isTransparent} 
                        onChange={(e) => setIsTransparent(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="universal-transparent-checkbox" className="ml-2 block text-sm text-gray-900">Transparent</label>
                </div>
            </div>

            {!isTransparent && (
                <>
                    <div className="mb-4">
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="universal-gradient-checkbox" 
                                checked={isGradient} 
                                onChange={(e) => setIsGradient(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="universal-gradient-checkbox" className="ml-2 block text-sm text-gray-900">Gradient {label}</label>
                        </div>
                    </div>

                    {isGradient ? (
                        <div id="universal-gradient-controls" className="flex flex-col gap-4">
                            {colorStops.map((stop, index) => (
                                <div key={stop.id} className="flex flex-col gap-2 p-2 border rounded-md">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-600">Color Stop {index + 1}</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <div className="color-preview-circle w-6 h-6" style={{backgroundColor: stop.color}}></div>
                                                <input type="color" value={stop.color} onChange={(e) => handleColorStopChange(stop.id, 'color', e.target.value)} className="color-picker-input-hidden" />
                                            </div>
                                            {colorStops.length > 2 && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveColorStop(stop.id)}>
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Slider
                                            value={[stop.stop]}
                                            onValueChange={(val) => handleColorStopChange(stop.id, 'stop', val[0])}
                                            max={1}
                                            step={0.01}
                                        />
                                        <div className="text-xs text-center mt-1">{stop.stop.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={handleAddColorStop} className="w-full">
                                <PlusCircle className="h-4 w-4 mr-2" /> Add Color
                            </Button>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                                <select value={gradientDirection} onChange={(e) => setGradientDirection(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="top-to-bottom">Top to Bottom</option>
                                    <option value="left-to-right">Left to Right</option>
                                    <option value="diagonal-tl-br">Diagonal (TL to BR)</option>
                                    <option value="diagonal-tr-bl">Diagonal (TR to BL)</option>
                                    {!isStroke && <option value="radial">Radial</option>}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="color-picker-container-inline justify-between">
                            <label className="block text-sm font-medium text-gray-700">Solid {label}</label>
                            <div className="relative">
                                <div className="color-preview-circle" style={{backgroundColor: solidColor}}></div>
                                <input type="color" value={solidColor} onChange={(e) => setSolidColor(e.target.value)} className="color-picker-input-hidden" />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ColorPropertiesPanel;
