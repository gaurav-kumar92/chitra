'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useTextHandler } from '@/hooks/useTextHandler';
import { useShapeHandler } from '@/hooks/useShapeHandler';
import { useFrameHandler } from '@/hooks/useFrameHandler';
import { useMaskHandler } from '@/hooks/useMaskHandler';
import { useClipartHandler } from '@/hooks/useClipartHandler';
import { useIconHandler } from '@/hooks/useIconHandler';
import { useNodeHandlers } from '@/hooks/useNodeHandlers';
import { useSelection } from '@/hooks/useSelection';
import { useCanvasChangeTracker } from '@/hooks/useCanvasChangeTracker';
import { useLockHandler } from '@/hooks/useLockHandler';
import { useAnimationHandler } from '@/hooks/useAnimationHandler';
import type { Node } from 'konva/lib/Node';
import { useRouter } from 'next/navigation';
import { useZoomPan } from "@/hooks/useZoomPan";
import { useBackground } from "@/hooks/useBackground";
import { useTransforms } from "@/hooks/useTransforms";
import { useClipboard } from '@/hooks/useClipboard';
import { useGrouping } from '@/hooks/useGrouping';
import { useExport } from '@/hooks/useExport';
import { useMaskImageControls } from '@/hooks/useMaskImageControls';
import { useCrop } from '@/hooks/useCrop';
import { useSymbolHandler } from '@/hooks/useSymbolHandler';

declare global {
  interface Window {
    Konva: any;
    isOpeningFileDialog?: boolean;
  }
}

type BackgroundImageProps = {
  x: number;
  y: number;
  scale: number;
};

type CanvasContextType = {
  canvasRef: React.RefObject<{ stage: any; layer: any; background: any }>;
  konvaObjects: any[];
  setKonvaObjects: React.Dispatch<React.SetStateAction<any[]>>;
  selectedNodes: any[];
  setSelectedNodes: React.Dispatch<React.SetStateAction<any[]>>;
  isMultiSelectMode: boolean;
  setMultiSelectMode: React.Dispatch<React.SetStateAction<boolean>>;
  isCanvasReady: boolean;
  setCanvasReady: React.Dispatch<React.SetStateAction<boolean>>;
  isKonvaReady: boolean;
  setKonvaReady: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isAddItemDialogOpen: boolean;
  setAddItemDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isShapeDialogOpen: boolean;
  setShapeDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFrameDialogOpen: boolean;
  setFrameDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMaskDialogOpen: boolean;
  setMaskDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isClipartDialogOpen: boolean;
  setClipartDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isIconDialogOpen: boolean;
  setIconDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEmojiDialogOpen: boolean;
  setEmojiDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingShapeNode: any;
  setEditingShapeNode: React.Dispatch<React.SetStateAction<any>>;
  editingFrameNode: any;
  setEditingFrameNode: React.Dispatch<React.SetStateAction<any>>;
  editingMaskNode: any;
  setEditingMaskNode: React.Dispatch<React.SetStateAction<any>>;
  editingTextNode: any;
  setEditingTextNode: React.Dispatch<React.SetStateAction<any>>;
  isCropModalOpen: boolean;
  setCropModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nodeToCrop: any;
  setNodeToCrop: React.Dispatch<React.SetStateAction<any>>;

  canvasSize: string;
  setCanvasSize: (size: string) => void;
  backgroundColor: any;
  setBackgroundColor: (color: any) => void;
  backgroundImage: string | null;
  setBackgroundImage: React.Dispatch<React.SetStateAction<string | null>>;
  backgroundImageProps: BackgroundImageProps;
  
  canvasScale: number;
  minScale: number;
  canvasPosition: { x: number; y: number };
  setCanvasPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  zoomIn: () => void;
  zoomOut: () => void;
  fitToScreen: () => void;
  handleZoomChange: (value: string) => void;


  clipboard: any[];

  // Functions
  updateLayers: () => void;
  deselectNodes: () => void;
  handleSave: (format?: 'png' | 'jpg' | 'svg' | 'pdf'| 'gif') => void;
  handleMoveNode: (action: 'up' | 'down', nodeId: string) => void;
  handleAlign: (position: string) => void;
  handleMoveToFront: () => void;
  handleMoveToBack: () => void;
  handleOpacityChange: (opacity: number) => void;
  handleScaleChange: (scale: number) => void;
  handleRotationChange: (rotation: number) => void;
  handleFlip: (direction: 'horizontal' | 'vertical') => void;
  handleColorUpdate: (config: any) => void;
  handleSelectItem: (itemType: string) => void;
  addImageFromComputer: () => void;
  handleAddShape: (config: any) => void;
  handleUpdateShape: (attrs: any) => void;
  handleAddOrUpdateText: (config: any) => void;
  handleAddFrame: (config: any) => void;
  handleUpdateFrame: (attrs: any) => void;
  handleAddMask: (config: any) => void;
  handleUpdateMask: (attrs: any) => void;
  handleAddClipart: (clipart: { parts: { [key: string]: string; }; defaultColors: { [key: string]: string; }; }) => void;
  handleAddIcon: (icon: { path: string }) => void;
  handleAddSymbol: (symbol: string) => void;
  addImageToMask: (maskGroup: any) => void;
  handleMaskImageZoom: (direction: 'in' | 'out') => void;
  handleMaskImageReset: () => void;
  handleMaskImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleAnimationChange: (animation: any) => void;
  handleClipartPartColorChange: (partName: string, color: string) => void;
  handleSetBackgroundImage: () => void;
  handleBackgroundImageZoom: (direction: 'in' | 'out') => void;
  handleBackgroundImagePan: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleBackgroundImageReset: () => void;
  handleRemoveBackgroundImage: () => void;
  handleCropImage: () => void;
  handleApplyCrop: (croppedDataUrl: string) => void;


  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  handleGroup: () => void;
  handleUngroup: () => void;
  handleDelete: () => void;
  handleCopy: () => void;
  handlePaste: () => void;
  forceRecord: () => void;

  isSelectionLocked: boolean;
  isAnySelectedLocked: boolean;
  toggleLock: () => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({ children }: { children: ReactNode }) => {
  const canvasRef = useRef<{ stage: any; layer: any; background: any }>(null);
  const router = useRouter();

  const [konvaObjects, setKonvaObjects] = useState<any[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<any[]>([]);
  const [isMultiSelectMode, setMultiSelectMode] = useState(false);
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [isKonvaReady, setKonvaReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    canvasScale,
    canvasPosition,
    setCanvasPosition,
    zoomIn,
    zoomOut,
    fitToScreen,
    handleZoomChange,
    minScale,
  } = useZoomPan({ canvasRef, isCanvasReady });
  

  const [isAddItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [isShapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [editingShapeNode, setEditingShapeNode] = useState<any>(null);
  const [editingTextNode, setEditingTextNode] = useState<any>(null);
  const [isFrameDialogOpen, setFrameDialogOpen] = useState(false);
  const [editingFrameNode, setEditingFrameNode] = useState<any>(null);
  const [isMaskDialogOpen, setMaskDialogOpen] = useState(false);
  const [editingMaskNode, setEditingMaskNode] = useState<any>(null);
  const [isClipartDialogOpen, setClipartDialogOpen] = useState(false);
  const [isIconDialogOpen, setIconDialogOpen] = useState(false);
  const [isEmojiDialogOpen, setEmojiDialogOpen] = useState(false);
 

  const [canvasSize, setCanvasSizeState] = useState('1080x1080');
  
  const {
    undo: undoBase,
    redo: redoBase,
    canUndo,
    canRedo,
    forceRecord,
    runAsSingleHistoryStep,
  } = useCanvasChangeTracker(canvasRef, isCanvasReady);

  const setCanvasSize = (size: string) => {
    setCanvasSizeState(size);
    forceRecord();
  };
  const {
    isCropModalOpen,
    setCropModalOpen,
    nodeToCrop,
    setNodeToCrop,
    handleCropImage,
    handleApplyCrop,
  } = useCrop({
    canvasRef,
    selectedNodes,
    forceRecord,
  });
 
  const {
    backgroundColor,
    setBackgroundColor,
    backgroundImage,
    setBackgroundImage,
    backgroundImageProps,
    handleSetBackgroundImage,
    handleBackgroundImageZoom,
    handleBackgroundImagePan,
    handleBackgroundImageReset,
    handleRemoveBackgroundImage
  } = useBackground({
    canvasRef,
    forceRecord,
    isKonvaReady
  });

  const { isSelectionLocked, isAnySelectedLocked, toggleLock } = useLockHandler(
    selectedNodes,
    setSelectedNodes
  );

  const isNodeLocked = useCallback((n: any) => !!n?.getAttr?.('isLocked'), []);
 const getUnlocked = useCallback(
    (nodes: any[]) => nodes.filter((n) => !isNodeLocked(n)),
    [isNodeLocked]
  );
  const {
    applyFill,
    applyStroke,
    handleOpacityChange,
    handleScaleChange,
    handleRotationChange,
    handleFlip,
    handleAlign,
    handleMoveNode,
    handleMoveToFront,
    handleMoveToBack,
    handleColorUpdate
  } = useTransforms({
    canvasRef,
    selectedNodes,
    getUnlocked,
    isNodeLocked,
    forceRecord
  });
 
  const {
    handleMaskImageZoom,
    handleMaskImageReset,
    handleMaskImagePan,
  } = useMaskImageControls({
    canvasRef,
    selectedNodes,
    isNodeLocked,
    forceRecord,
  });
  
  const updateLayers = useCallback(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;

    const children = layer.getChildren((node: any) => {
      const className = node?.getClassName?.() ?? '';
      const isTransformer = className === 'Transformer' || node?.hasName?.('Transformer');
      const isBackground = node?.name?.() === 'background';
      const hasId = !!node?.id?.();
      return hasId && !isTransformer && !isBackground;
    });

    setKonvaObjects(Array.from(children));
    layer.draw();
  }, []);

  const deselectNodes = useCallback(() => {
    setSelectedNodes([]);
  }, []);
  const { handleAnimationChange, timelineState } = useAnimationHandler({ canvasRef, selectedNodes, forceRecord });
  const { handleSave } = useExport({
    canvasRef,
    deselectNodes,
    timelineState,
  });
  
  const attachDoubleClick = useCallback((node: Node) => {
    node.on('dblclick dbltap', () => {
      if (node.getAttr('isLocked')) return;
      let targetNode = node as any;
      if (node.parent?.hasName('circularText') || node.parent?.hasName('mask') || node.parent?.hasName('textGroup') || node.parent?.hasName('clipart')) {
        targetNode = node.parent;
      }
      if (targetNode.hasName('group')) {
        handleUngroup();
      } else {
        nodeHandlers.handleDoubleClick(targetNode);
      }
    });
  }, []);

  const {
    clipboard,
    handleCopy,
    handlePaste,
    handleDelete,
  } = useClipboard({
    canvasRef,
    selectedNodes,
    setSelectedNodes,
    getUnlocked,
    deselectNodes,
    updateLayers,
    attachDoubleClick,
    runAsSingleHistoryStep,
    forceRecord,
  });
  const {
    handleGroup,
    handleUngroup,
  } = useGrouping({
    canvasRef,
    selectedNodes,
    setSelectedNodes,
    setMultiSelectMode,
    updateLayers,
    attachDoubleClick,
    runAsSingleHistoryStep,
  });
  

  const { addImageToMask, handleAddMask, handleUpdateMask } = useMaskHandler({ canvasRef, updateLayers, setSelectedNodes, setIsLoading, attachDoubleClick: attachDoubleClick, editingMaskNode, setEditingMaskNode });
  const nodeHandlers = useNodeHandlers({ setEditingTextNode, setEditingShapeNode, setShapeDialogOpen, setEditingFrameNode, setFrameDialogOpen, addImageToMask, setIsLoading });
  
  const { handleAddClipart } = useClipartHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });
  const { handleAddIcon } = useIconHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });
  const { handleAddSymbol } = useSymbolHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick, forceRecord });

  useSelection({ isCanvasReady, canvasRef, isMultiSelectMode, selectedNodes, setSelectedNodes });
  const { handleAddOrUpdateText } = useTextHandler({ canvasRef, updateLayers, setSelectedNodes, applyFill, attachDoubleClick: attachDoubleClick, editingTextNode, setEditingTextNode, forceRecord });
  const { handleAddShape, handleUpdateShape } = useShapeHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick: attachDoubleClick, editingShapeNode, setEditingShapeNode, forceRecord });
  const { handleAddFrame, handleUpdateFrame } = useFrameHandler({ canvasRef, updateLayers, setSelectedNodes, attachDoubleClick: attachDoubleClick });

  const addImageFromComputer = useCallback(() => {
    const imageFileInput = document.createElement('input');
    imageFileInput.type = 'file';
    imageFileInput.accept = 'image/png, image/jpeg,_jpg, image/gif, image/svg+xml';
    imageFileInput.onchange = () => {
      if (imageFileInput.files && imageFileInput.files.length > 0) {
        const file = imageFileInput.files[0];
        const reader = new FileReader();
        reader.onloadstart = () => setIsLoading(true);
        reader.onload = (e) => {
          window.Konva.Image.fromURL(e.target!.result as string, (img: any) => {
            if (!canvasRef.current?.stage || !canvasRef.current?.layer) return;
            const { stage, layer } = canvasRef.current;
            const MAX_WIDTH = stage.width() * 0.8;
            const MAX_HEIGHT = stage.height() * 0.8;
            const scale = Math.min(MAX_WIDTH / img.width(), MAX_HEIGHT / img.height(), 1);
            const uniqueId = `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            img.setAttrs({ 
                id: uniqueId, 
                x: stage.width() / 2, 
                y: stage.height() / 2, 
                scaleX: scale, 
                scaleY: scale, 
                name: 'image', 
                draggable: true,
                offsetX: img.width() / 2,
                offsetY: img.height() / 2,
                'data-original-src': e.target!.result
            });

            img.on('dragend', () => {
              delete (img as any)._dragStartPos;
              delete (img as any)._dragStartBox;
            });

            attachDoubleClick(img);
            layer.add(img);
            updateLayers();
            setSelectedNodes([img]);
            layer.draw();
            setIsLoading(false);
            forceRecord();
          });
        };
        reader.onerror = () => setIsLoading(false);
        reader.readAsDataURL(file);
      }
      imageFileInput.value = '';
    };
    imageFileInput.click();
  }, [updateLayers, setIsLoading, setSelectedNodes, attachDoubleClick, forceRecord]);

  const handleSelectItem = useCallback((itemType: string) => {
    setAddItemDialogOpen(false);
    deselectNodes();
    if (!canvasRef.current) return;
    if(itemType === 'text') {
        handleAddOrUpdateText({
            text: 'New Text',
            fontSize: 48,
            fontFamily: 'Inter',
            isBold: false,
            isItalic: false,
            isUnderline: false,
            isStrikethrough: false,
            letterSpacing: 0,
            lineHeight: 1.2,
            align: 'center',
            isShadow: false,
            shadowBlur: 10,
            shadowDistance: 5,
            shadowOpacity: 0.5,
            isGlow: false,
            glowColor: '#0000ff',
            glowBlur: 10,
            glowOpacity: 0.7,
            radius: 150,
            curvature: 0,
          });
    }
    switch (itemType) {
      case 'shape': setEditingShapeNode(null); setShapeDialogOpen(true); break;
      case 'image': addImageFromComputer(); break;
      case 'frame': setEditingFrameNode(null); setFrameDialogOpen(true); break;
      case 'mask': setEditingMaskNode(null); setMaskDialogOpen(true); break;
      case 'clipart': setClipartDialogOpen(true); break;
      case 'icon': setIconDialogOpen(true); break;
      case 'emoji': setEmojiDialogOpen(true); break;
      default: break;
    }
  }, [deselectNodes, addImageFromComputer, setAddItemDialogOpen, handleAddOrUpdateText, setShapeDialogOpen, setFrameDialogOpen, setMaskDialogOpen, setClipartDialogOpen, setIconDialogOpen, setEmojiDialogOpen, setEditingShapeNode, setEditingFrameNode, setEditingMaskNode]);

 const handleClipartPartColorChange = useCallback((partName: string, color: string) => {
    const clipartNode = selectedNodes.find(n => n.hasName('clipart'));
    if (!clipartNode || isNodeLocked(clipartNode)) return;

    let partsToUpdate;
    if (partName === 'eyes') {
        partsToUpdate = clipartNode.find('.clipart-leftEye, .clipart-rightEye');
    } else {
        partsToUpdate = clipartNode.find(`.clipart-${partName}`);
    }

    if (partsToUpdate.length > 0) {
        partsToUpdate.forEach((part: any) => {
            part.fill(color);
            part.setAttr(`data-color-${partName}`, color);
        });
        canvasRef.current?.layer.draw();
        forceRecord?.();
    }
}, [selectedNodes, isNodeLocked, forceRecord, canvasRef]);

  useEffect(() => {
    if (isKonvaReady && isCanvasReady && canvasRef.current?.background) {
      const backgroundRect = canvasRef.current.background;
      const layer = canvasRef.current.layer;

      backgroundRect.fill(null);
      backgroundRect.fillLinearGradientColorStops(null);
      backgroundRect.fillRadialGradientColorStops(null);
      backgroundRect.fillPatternImage(null);

      if (backgroundImage) {
          // background image is handled by Canvas.tsx
      } else if (backgroundColor.isGradient) {
        const width = backgroundRect.width();
        const height = backgroundRect.height();
        const colorStopsFlat = backgroundColor.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);
        if (backgroundColor.gradientDirection === 'radial') {
          const rectWidth = backgroundRect.width();
          const rectHeight = backgroundRect.height();
        
          const centerX = rectWidth / 2;
          const centerY = rectHeight / 2;
        
          backgroundRect.fillPriority('radial-gradient');
        
          backgroundRect.fillRadialGradientStartPoint({
            x: centerX,
            y: centerY,
          });
          backgroundRect.fillRadialGradientStartRadius(0);
        
          backgroundRect.fillRadialGradientEndPoint({
            x: centerX,
            y: centerY,
          });
        
          backgroundRect.fillRadialGradientEndRadius(
            Math.sqrt(rectWidth * rectWidth + rectHeight * rectHeight) / 2
          );
        
          backgroundRect.fillRadialGradientColorStops(colorStopsFlat);
        } else {
          backgroundRect.fillPriority('linear-gradient');
        
          let start = { x: 0, y: 0 };
          let end = { x: 0, y: rectHeight };
        
          const rectWidth = backgroundRect.width();
          const rectHeight = backgroundRect.height();
        
          switch (backgroundColor.gradientDirection) {
            case 'top-to-bottom':
              end = { x: 0, y: rectHeight };
              break;
            case 'left-to-right':
              end = { x: rectWidth, y: 0 };
              break;
            case 'diagonal-tl-br':
              end = { x: rectWidth, y: rectHeight };
              break;
            case 'diagonal-tr-bl':
              start = { x: rectWidth, y: 0 };
              end = { x: 0, y: rectHeight };
              break;
          }
        
          backgroundRect.fillLinearGradientStartPoint(start);
          backgroundRect.fillLinearGradientEndPoint(end);
          backgroundRect.fillLinearGradientColorStops(colorStopsFlat);
        }
        
      } else {
        backgroundRect.fillPriority('color');
        backgroundRect.fill(backgroundColor.solidColor);
      }
      if (layer) layer.draw();
    }
  }, [backgroundColor, isKonvaReady, backgroundImage]);

  useEffect(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    const children = layer.getChildren((n: any) => {
      const className = n?.getClassName?.() ?? '';
      const isTransformer = className === 'Transformer' || n?.hasName?.('Transformer');
      const isBackground = n?.name?.() === 'background';
      const hasId = !!n?.id?.();
      return hasId && !isTransformer && !isBackground;
    });
    setKonvaObjects(Array.from(children ?? []));
  }, [selectedNodes]);
  
  useEffect(() => {
    if (isKonvaReady && isCanvasReady && canvasRef.current?.stage) {
      fitToScreen();
      window.addEventListener('resize', fitToScreen);
      setIsLoading(false);

      return () => {
          window.removeEventListener('resize', fitToScreen);
      };
    }
}, [isKonvaReady, isCanvasReady, fitToScreen, canvasRef]);

  type LockedSnapshot = { id: string; className: string; attrs: any; parentId?: string; zIndex?: number; };
  const snapshotLockedNodes = useCallback((): LockedSnapshot[] => {
    const layer = canvasRef.current?.layer;
    if (!layer) return [];
    const locked: any[] = layer.find((n: any) => n.getAttr && n.getAttr('isLocked'));
    return locked.map((n: any) => ({ id: n.id?.() || '', className: n.getClassName?.() || 'Group', attrs: { ...n.getAttrs?.() }, parentId: n.getParent?.()?.id?.(), zIndex: n.getZIndex?.() }));
  }, []);

  const restoreLockedNodes = useCallback((snapshots: LockedSnapshot[]) => {
    const layer = canvasRef.current?.layer;
    if (!layer) return;
    snapshots.forEach((s) => {
      let target: any = layer.findOne(`#${s.id}`);
      if (target) {
        target.setAttrs(s.attrs);
        if (typeof s.zIndex === 'number') {
          try {
            target.setZIndex(s.zIndex);
          } catch { /* ignore */ }
        }
      } else {
        const Ctor = (window.Konva as any)[s.className] || window.Konva.Group;
        const node = new Ctor(s.attrs);
        const parent = (s.parentId && (layer.findOne(`#${s.parentId}`) as any)) || layer;
        parent.add(node);
      }
    });
    layer.batchDraw();
  }, []);

  const undo = useCallback(() => {
    const lockedBefore = snapshotLockedNodes();
    undoBase();
    restoreLockedNodes(lockedBefore);
  }, [undoBase, snapshotLockedNodes, restoreLockedNodes]);

  const redo = useCallback(() => {
    const lockedBefore = snapshotLockedNodes();
    redoBase();
    restoreLockedNodes(lockedBefore);
  }, [redoBase, snapshotLockedNodes, restoreLockedNodes]);

  const value: CanvasContextType = {
    canvasRef, konvaObjects, setKonvaObjects, selectedNodes, setSelectedNodes, isMultiSelectMode, setMultiSelectMode,
    isCanvasReady, setCanvasReady, isKonvaReady, setKonvaReady, isLoading, setIsLoading, isAddItemDialogOpen,
    setAddItemDialogOpen, isShapeDialogOpen, setShapeDialogOpen, isFrameDialogOpen,
    setFrameDialogOpen, isMaskDialogOpen, setMaskDialogOpen, isClipartDialogOpen, setClipartDialogOpen, isIconDialogOpen, setIconDialogOpen, isEmojiDialogOpen, setEmojiDialogOpen, editingShapeNode, 
    setEditingShapeNode, editingFrameNode, setEditingFrameNode, editingMaskNode, setEditingMaskNode, editingTextNode, 
    setEditingTextNode, isCropModalOpen, setCropModalOpen, nodeToCrop, setNodeToCrop,
    canvasSize, setCanvasSize, backgroundColor, setBackgroundColor, backgroundImage, setBackgroundImage, backgroundImageProps, clipboard,
    canvasScale, minScale, canvasPosition, setCanvasPosition, zoomIn, zoomOut, fitToScreen, handleZoomChange,
    updateLayers, deselectNodes, handleSave, handleMoveNode, handleAlign, handleMoveToFront, handleMoveToBack, handleOpacityChange, handleScaleChange, handleRotationChange, handleFlip,
    handleColorUpdate, handleSelectItem, addImageFromComputer, handleAddShape, handleUpdateShape, handleAddOrUpdateText,
    handleAddFrame, handleUpdateFrame, handleAddMask, handleUpdateMask, handleAddClipart, handleAddIcon, handleAddSymbol, addImageToMask, handleMaskImageZoom,
    handleMaskImageReset, handleMaskImagePan, handleAnimationChange,
    handleClipartPartColorChange, handleSetBackgroundImage, handleBackgroundImageZoom, handleBackgroundImagePan, handleBackgroundImageReset,
    handleRemoveBackgroundImage, handleCropImage, handleApplyCrop,
    undo, redo, canUndo, canRedo,
    handleGroup, handleUngroup, handleDelete, handleCopy, handlePaste, forceRecord,
    isSelectionLocked, isAnySelectedLocked, toggleLock,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

export const useCanvas = (): CanvasContextType => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
