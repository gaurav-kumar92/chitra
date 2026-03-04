

'use client';

import { useCallback } from 'react';

type UseNodeHandlersProps = {
    setEditingTextNode: (node: any) => void;
    setEditingShapeNode: (node: any) => void;
    setShapeDialogOpen: (isOpen: boolean) => void;
    setEditingFrameNode: (node: any) => void;
    setFrameDialogOpen: (isOpen: boolean) => void;
    addImageToMask: (maskGroup: any) => void;
    setIsLoading: (isLoading: boolean) => void;
};

export const useNodeHandlers = ({
    setEditingTextNode,
    setEditingShapeNode,
    setShapeDialogOpen,
    setEditingFrameNode,
    setFrameDialogOpen,
    addImageToMask,
    setIsLoading,
}: UseNodeHandlersProps) => {

    const handleDoubleClick = useCallback((node: any) => {
        const nodeName = node.name();

        switch(nodeName) {
            case 'textGroup':
            case 'circularText':
                setEditingTextNode(node);
                break;
            case 'shape':
                setEditingShapeNode(node);
                setShapeDialogOpen(true);
                break;
            case 'image':
            case 'clipart':
                // Standalone image replacement logic
                const imageFileInput = document.createElement('input');
                imageFileInput.type = 'file';
                imageFileInput.accept = "image/png, image/jpeg, image/jpg, image/gif, image/svg+xml";
                imageFileInput.onchange = () => {
                    if (imageFileInput.files && imageFileInput.files.length > 0) {
                        const file = imageFileInput.files[0];
                        const reader = new FileReader();
                        reader.onloadstart = () => setIsLoading(true);
                        reader.onload = (e) => {
                            const newImg = new window.Konva.Image({
                                image: new Image(),
                            });
                            const img = new Image();
                            img.src = e.target!.result as string;
                            img.onload = () => {
                                newImg.image(img);
                                node.image(img);
                                setIsLoading(false);
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                    imageFileInput.value = '';
                };
                imageFileInput.click();
                break;
            case 'frame':
                setEditingFrameNode(node);
                setFrameDialogOpen(true);
                break;
            case 'mask':
                addImageToMask(node);
                break;
            default:
                // Do nothing for other node types
                break;
        }
    }, [
        setEditingTextNode, 
        setEditingShapeNode, 
        setShapeDialogOpen, 
        setEditingFrameNode, 
        setFrameDialogOpen, 
        addImageToMask,
        setIsLoading
    ]);

    const attachDoubleClick = useCallback((node: any) => {
        node.on('dblclick dbltap', () => {
            let targetNode = node;
            // This logic is important for grouped objects like masks or text
            if (node.parent?.hasName('circularText') || node.parent?.hasName('mask') || node.parent?.hasName('textGroup') || node.parent?.hasName('clipart')) {
                targetNode = node.parent;
            }
            handleDoubleClick(targetNode);
        });
    }, [handleDoubleClick]);


    return { handleDoubleClick, attachDoubleClick };
};
