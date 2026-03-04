
'use client';

import { useCallback } from 'react';

type UseSymbolHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    attachDoubleClick: (node: any) => void;
    forceRecord?: () => void;
};

export const useSymbolHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick,
    forceRecord,
}: UseSymbolHandlerProps) => {

    const handleAddSymbol = useCallback((symbol: string) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;

        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const textNode = new window.Konva.Text({
            text: symbol,
            fontSize: 100,
            fontFamily: 'Inter',
            fill: '#000000',
            name: 'text',
        });
        
        const textGroup = new window.Konva.Group({
            id: uniqueId,
            x: stage.width() / 2,
            y: stage.height() / 2,
            draggable: true,
            name: 'textGroup',
            'data-text': symbol,
            'data-font-size': 100,
            'data-font-family': 'Inter',
            'data-is-gradient': false,
            'data-solid-color': '#000000',
        });

        textGroup.add(textNode);
        
        const textWidth = textGroup.width();
        const textHeight = textGroup.height();
        textGroup.offsetX(textWidth / 2);
        textGroup.offsetY(textHeight / 2);

        attachDoubleClick(textGroup);
        layer.add(textGroup);
        updateLayers();
        setSelectedNodes([textGroup]);
        layer.draw();
        forceRecord?.();

    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddSymbol };
};
