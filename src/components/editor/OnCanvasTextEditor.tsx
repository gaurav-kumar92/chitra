
'use client';

import React, { useEffect, useState, useRef } from 'react';

type OnCanvasTextEditorProps = {
  node: any;
  onClose: () => void;
  onUpdate: (config: any) => void;
};

const OnCanvasTextEditor: React.FC<OnCanvasTextEditorProps> = ({ node, onClose, onUpdate }) => {
  const [text, setText] = useState(node.getAttr('data-text') || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus and select text when the editor appears
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
        handleFinish();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [text, node]);

  const handleFinish = () => {
    const trimmedText = text.trim();
    if (trimmedText === '') {
        onClose();
        return;
    }

    const fullConfig = {
        ...node.attrs,
        id: node.id(),
        'data-text': text,
        text: text,
    };
    onUpdate(fullConfig);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    // Finish editing on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleFinish();
    }
  };

  if (!node) return null;

  const isCircular = node.name() === 'circularText';
  if (isCircular) {
      // Circular text editing is handled via the properties panel
      onClose();
      return null;
  }

  // getClientRect() provides the bounding box in pixels relative to the stage container.
  // This takes into account rotation, scaling, and panning of the stage.
  const box = node.getClientRect();
  
  // Match font properties
  const fontSize = node.getAttr('data-font-size') || 24;
  const stageScale = node.getStage()?.scaleX() || 1;
  const fontFamily = node.getAttr('data-font-family') || 'Inter';
  const fontWeight = node.getAttr('data-is-bold') ? 'bold' : 'normal';
  const fontStyle = node.getAttr('data-is-italic') ? 'italic' : 'normal';
  const textAlign = node.getAttr('data-align') || 'left';
  const lineHeight = node.getAttr('data-line-height') || 1.2;
  const color = node.findOne('.text')?.fill() || node.fill?.() || '#000000';

  const editorStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${box.y}px`,
    left: `${box.x}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
    minHeight: '1.2em',
    background: 'white',
    border: '1px solid #7c3aed',
    borderRadius: '2px',
    boxShadow: '0 0 10px rgba(124, 58, 237, 0.3)',
    zIndex: 1000,
    fontSize: `${fontSize * stageScale}px`,
    fontFamily: fontFamily,
    fontWeight: fontWeight,
    fontStyle: fontStyle,
    lineHeight: lineHeight,
    textAlign: textAlign as any,
    color: color,
    padding: '0',
    margin: '0',
    outline: 'none',
    resize: 'none',
    overflow: 'hidden',
    display: 'block',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  };

  return (
    <textarea
        ref={textareaRef}
        style={editorStyle}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleFinish}
    />
  );
};

export default OnCanvasTextEditor;
