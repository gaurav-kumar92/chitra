
'use client';

import React, { useState, useEffect } from 'react';
import {
  Undo,
  Redo,
  Plus,
  Trash2,
  Save,
  Lock,
  Unlock,
  Copy,
  ClipboardPaste,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCanvas } from '@/contexts/CanvasContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Toolbar = () => {
  const {
    setAddItemDialogOpen,
    deselectNodes,
    selectedNodes,
    handleSave,
    undo,
    redo,
    canUndo,
    canRedo,
    handleDelete,
    isSelectionLocked,
    isAnySelectedLocked,
    toggleLock,
    handleCopy,
    handlePaste,
    clipboard,
  } = useCanvas();

  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('chitra-tour-v2');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setShowHint(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const hasSelection = selectedNodes.length > 0;
  const canPaste = clipboard.length > 0;

  const handleAddClick = () => {
    setShowHint(false);
    setAddItemDialogOpen(true);
    deselectNodes();
  };

  return (
    <div className="toolbar" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-center gap-1">
        {/* Add */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Add"
            title="Add"
            onClick={handleAddClick}
            className={showHint ? "ring-2 ring-primary ring-offset-2" : ""}
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          {showHint && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl animate-bounce whitespace-nowrap z-[100]">
              START HERE
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-primary"></div>
            </div>
          )}
        </div>

        <Separator orientation="vertical" />

        {/* Save Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Save" title="Save">
              <Save className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSave('png')}>Save as PNG</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSave('jpg')}>Save as JPG</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSave('svg')}>Save as SVG</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSave('gif')}>Save as GIF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSave('pdf')}>Save as PDF (for Print)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" />

        {/* Undo */}
        <Button
          variant="ghost"
          size="icon"
          disabled={!canUndo}
          aria-label="Undo"
          title={canUndo ? 'Undo' : 'Nothing to undo'}
          onClick={undo}
        >
          <Undo className="h-4 w-4" />
        </Button>

        {/* Redo */}
        <Button
          variant="ghost"
          size="icon"
          disabled={!canRedo}
          aria-label="Redo"
          title={canRedo ? 'Redo' : 'Nothing to redo'}
          onClick={redo}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" />

        {/* Copy */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          disabled={!hasSelection}
          aria-label="Copy Selection"
          title={hasSelection ? "Copy Selection" : "Nothing selected"}
        >
          <Copy className="h-4 w-4" />
        </Button>

        {/* Paste */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePaste}
          disabled={!canPaste}
          aria-label="Paste"
          title={canPaste ? "Paste" : "Clipboard is empty"}
        >
          <ClipboardPaste className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" />

        {/* Lock / Unlock */}
        <Button
          variant="ghost"
          size="icon"
          disabled={!hasSelection}
          aria-label={isSelectionLocked ? 'Unlock selected' : 'Lock selected'}
          title={
            isSelectionLocked
              ? 'Unlock selected (all selected are locked)'
              : isAnySelectedLocked
              ? 'Some selected are locked'
              : 'Lock selected'
          }
          onClick={toggleLock}
          className={
            isAnySelectedLocked
              ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
              : undefined
          }
        >
          {isSelectionLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </Button>

        {/* Delete */}
        <Button
          variant={hasSelection ? 'destructive' : 'ghost'}
          size="icon"
          disabled={!hasSelection}
          aria-label="Delete selected"
          title={hasSelection ? 'Delete selected' : 'Nothing selected'}
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
