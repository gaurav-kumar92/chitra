
'use client';

import { useCallback } from 'react';

type UseIconHandlerProps = {
    canvasRef: React.RefObject<{ stage: any; layer: any; }>;
    updateLayers: () => void;
    setSelectedNodes: (nodes: any[]) => void;
    attachDoubleClick: (node: any) => void;
    forceRecord?: () => void;
};

export const useIconHandler = ({
    canvasRef,
    updateLayers,
    setSelectedNodes,
    attachDoubleClick,
    forceRecord,
}: UseIconHandlerProps) => {

    const handleAddIcon = useCallback((icon: { path: string }) => {
        if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;

        const { stage, layer } = canvasRef.current;
        const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const newIcon = new window.Konva.Path({
            id: uniqueId,
            data: icon.path,
            x: stage.width() / 2,
            y: stage.height() / 2,
            fill: '#3b82f6',
            draggable: true,
            name: 'icon',
            'data-is-gradient': false,
            'data-solid-color': '#3b82f6',
        });
        
        const bounds = newIcon.getClientRect({ skipTransform: true });
        const scale = 100 / Math.max(bounds.width, bounds.height);
        
        newIcon.scale({ x: scale, y: scale });
        newIcon.offsetX(bounds.width / 2);
        newIcon.offsetY(bounds.height / 2);

        attachDoubleClick(newIcon);
        layer.add(newIcon);
        updateLayers();
        setSelectedNodes([newIcon]);
        layer.draw();
        forceRecord?.();

    }, [canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord]);

    return { handleAddIcon };
};
