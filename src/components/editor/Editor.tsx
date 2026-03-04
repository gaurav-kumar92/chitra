
'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import LogoImg from '@/app/logo.png';
import {
  CanvasProvider,
  useCanvas,
} from '@/contexts/CanvasContext';

const Canvas = dynamic(() => import('@/components/editor/Canvas'), { ssr: false });
const Toolbar = dynamic(() => import('@/components/editor/Toolbar'), {
  ssr: false,
});
const LayersPanel = dynamic(() => import('@/components/editor/LayersPanel'), {
  ssr: false,
});
const PropertiesToolbar = dynamic(() => import('@/components/editor/PropertiesToolbar'), {
  ssr: false,
});
const AddItemDialog = dynamic(() => import('@/components/editor/AddItemDialog'), { ssr: false });
const ShapeDialog = dynamic(() => import('@/components/editor/ShapeDialog'), { ssr: false });
const FrameDialog = dynamic(() => import('@/components/editor/FrameDialog'), { ssr: false });
const MaskDialog = dynamic(() => import('@/components/editor/MaskDialog'), { ssr: false });
const ClipartDialog = dynamic(() => import('@/components/editor/ClipartDialog'), { ssr: false });
const IconDialog = dynamic(() => import('@/components/editor/IconDialog'), { ssr: false });
const EmojiDialog = dynamic(() => import('@/components/editor/EmojiDialog'), { ssr: false });
const OnCanvasTextEditor = dynamic(() => import('@/components/editor/OnCanvasTextEditor'), { ssr: false });
const CropImageModal = dynamic(() => import('@/components/editor/CropImageModal'), { ssr: false });

declare global {
  interface Window {
    Konva: any;
  }
}

function EditorUI() {
  const {
    canvasRef,
    setKonvaReady,
    konvaObjects,
    selectedNodes,
    setSelectedNodes,
    isMultiSelectMode,
    isAddItemDialogOpen,
    setAddItemDialogOpen,
    isShapeDialogOpen,
    setShapeDialogOpen,
    isFrameDialogOpen,
    setFrameDialogOpen,
    isMaskDialogOpen,
    setMaskDialogOpen,
    isClipartDialogOpen,
    setClipartDialogOpen,
    isIconDialogOpen,
    setIconDialogOpen,
    isEmojiDialogOpen,
    setEmojiDialogOpen,
    editingShapeNode,
    editingFrameNode,
    editingMaskNode,
    editingTextNode,
    setEditingTextNode,
    handleAddShape,
    handleUpdateShape,
    handleAddOrUpdateText,
    handleAddFrame,
    handleUpdateFrame,
    handleAddMask,
    handleUpdateMask,
    handleAddClipart,
    handleAddIcon,
    handleAddSymbol,
    handleSelectItem,
    handleMoveNode,
    canvasSize,
    backgroundImage,
    isCropModalOpen,
    nodeToCrop,
    setCropModalOpen,
    handleApplyCrop,
  } = useCanvas();

  const isCircular = canvasSize.endsWith('-circle');
  const sizeString = canvasSize.split('-')[0];

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/konva@9.3.6/konva.min.js"
        strategy="lazyOnload"
        onLoad={() => setKonvaReady(true)}
      />
      <div id="editor-ui">
        <div className="editor-main-column">
          <div className="flex justify-center items-center py-4">
            <Image 
              src={LogoImg} 
              alt="Chitra" 
              height={40} 
              className="w-auto h-10 object-contain"
              priority
            />
          </div>
          <Toolbar />
          
          <div className="relative flex-grow flex flex-col min-h-0" style={{ position: 'relative' }}>
            <Canvas
                ref={canvasRef}
                canvasSize={sizeString!}
                isCircular={isCircular!}
                backgroundImage={backgroundImage}
            />
            {editingTextNode && (
                <OnCanvasTextEditor
                node={editingTextNode}
                onClose={() => setEditingTextNode(null)}
                onUpdate={handleAddOrUpdateText}
                />
            )}
          </div>

          <PropertiesToolbar />
        </div>

        <LayersPanel
          layers={konvaObjects}
          selectedNodes={selectedNodes}
          onSelectNode={(id) => {
            const node = canvasRef.current?.layer.findOne(`#${id}`);
            if (node) {
              if (isMultiSelectMode) {
                const isSelected = selectedNodes.some((n) => n.id() === node.id());
                if (isSelected) {
                  setSelectedNodes(selectedNodes.filter((n) => n.id() !== node.id()));
                } else {
                  setSelectedNodes([...selectedNodes, node]);
                }
              } else {
                setSelectedNodes([node]);
              }
            }
          }}
          onMoveNode={handleMoveNode}
        />

        <AddItemDialog
          isOpen={isAddItemDialogOpen}
          onClose={() => setAddItemDialogOpen(false)}
          onSelectItem={handleSelectItem}
        />

        <ShapeDialog
          isOpen={isShapeDialogOpen}
          onClose={() => setShapeDialogOpen(false)}
          onAddShape={handleAddShape}
          onUpdateShape={handleUpdateShape}
          editingNode={editingShapeNode}
        />

        <FrameDialog
          isOpen={isFrameDialogOpen}
          onClose={() => setFrameDialogOpen(false)}
          onAddFrame={handleAddFrame}
          onUpdateFrame={handleUpdateFrame}
          editingNode={editingFrameNode}
        />

        <MaskDialog
          isOpen={isMaskDialogOpen}
          onClose={() => setMaskDialogOpen(false)}
          onAddMask={handleAddMask}
          onUpdateMask={handleUpdateMask}
          editingNode={editingMaskNode}
        />

        <ClipartDialog
          isOpen={isClipartDialogOpen}
          onClose={() => setClipartDialogOpen(false)}
          onAddClipart={handleAddClipart}
        />

        <IconDialog
          isOpen={isIconDialogOpen}
          onClose={() => setIconDialogOpen(false)}
          onAddIcon={handleAddIcon}
        />
        
        <EmojiDialog
          isOpen={isEmojiDialogOpen}
          onClose={() => setEmojiDialogOpen(false)}
          onAddEmoji={handleAddSymbol}
        />

        <CropImageModal
          isOpen={isCropModalOpen}
          imageNode={nodeToCrop}
          onClose={() => setCropModalOpen(false)}
          onApply={handleApplyCrop}
        />
      </div>
    </>
  );
}

export default function Editor() {
  return (
    <CanvasProvider>
      <EditorUI />
    </CanvasProvider>
  );
}
