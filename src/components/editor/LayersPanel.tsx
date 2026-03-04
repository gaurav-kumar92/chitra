
'use client';

import React from 'react';
import { Node } from 'konva/lib/Node';

type LayersPanelProps = {
  layers: Node[];
  selectedNodes: Node[];
  onSelectNode: (nodeId: string) => void;
  onMoveNode: (action: 'up' | 'down', nodeId: string) => void;
};

const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  selectedNodes,
  onSelectNode,
  onMoveNode,
}) => {
  const getLayerNameAndIcon = (node: Node) => {
    let icon: React.ReactNode = null;
    let name = 'Object';

    if (node.hasName('group')) {
        icon = (
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <rect x="7" y="7" width="10" height="10" rx="1"/>
            </svg>
        );
        name = `Group (${node.getChildren().length} items)`;
    } else if (node.hasName('textGroup') || node.hasName('circularText')) {
      const textContent = node.getAttr('data-text') || '';
      const shortText =
        textContent.length > 15
          ? textContent.substring(0, 15) + '...'
          : textContent;

      icon = (
        <svg
          className="icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7V4h16v3M9 20h6M12 4v16" />
        </svg>
      );
      name = node.hasName('textGroup')
        ? `Text: "${shortText}"`
        : `Curved Text`;
    } else if (node.hasName('shape')) {
      const shapeType = node.getAttr('data-type');
      icon = (
        <svg
          className="icon"
          xmlns="http://wwww3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
      name = `Shape: ${
        shapeType ? shapeType.charAt(0).toUpperCase() + shapeType.slice(1) : ''
      }`;
    } else if (node.hasName('icon')) {
        icon = (
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12.5 6.477 2.5 12 2.5z"/><path d="M12 17.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/><path d="M12 7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/></svg>
        );
        name = 'Icon';
    } else if (node.hasName('image')) {
      icon = (
        <svg
          className="icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
      name = 'Image';
    } else if (node.hasName('frame')) {
      const frameType = node.getAttr('data-type');
      icon = (
        <svg
          className="icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        </svg>
      );
      name = `Frame: ${
        frameType ? frameType.charAt(0).toUpperCase() + frameType.slice(1) : ''
      }`;
    } else if (node.hasName('mask')) {
      const maskType = node.getAttr('data-type');
      icon = (
        <svg
          className="icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM4.5 12a7.5 7.5 0 0 0 7.5 7.5v-15A7.5 7.5 0 0 0 4.5 12z" />
        </svg>
      );
      let namePrefix = `Mask: ${
        maskType ? maskType.charAt(0).toUpperCase() + maskType.slice(1) : ''
      }`;
      if (maskType === 'alphabet') {
        name = `${namePrefix} '${node.getAttr('data-letter')}'`;
      } else {
        name = namePrefix;
      }
    } else if (node.hasName('clipart')) {
        icon = (
             <svg className="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
        );
        name = 'Clipart';
    }
    return { icon, name };
  };

  const reversedLayers = layers.slice().reverse();

  return (
    <div id="layers-panel">
      <h3 className="text-lg font-semibold mb-4 text-center">Layers</h3>
      <ul id="layers-list">
        {reversedLayers.map((node: Node, index: number) => {
          const { icon, name } = getLayerNameAndIcon(node);
          const isSelected = selectedNodes.some(n => n.id() === node.id());
          const nodeCount = reversedLayers.length;

          return (
            <li
              key={`${node.id()}-${index}`}
              className={`layer-item ${isSelected ? 'selected' : ''}`}
              data-id={node.id()}
            >
              <div
                className="layer-info"
                onClick={() => onSelectNode(node.id())}
              >
                {icon}
                <span className="name">{name}</span>
              </div>
              <div className="layer-actions">
                <button
                  className="layer-action-btn"
                  title="Move Up"
                  aria-label="Move layer up"
                  disabled={index === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveNode('up', node.id());
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5l6 6h-3v6h-6v-6H6z" />
                  </svg>
                </button>
                <button
                  className="layer-action-btn"
                  title="Move Down"
                  aria-label="Move layer down"
                  disabled={index === nodeCount - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveNode('down', node.id());
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19l-6-6h3V7h6v6h3z" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LayersPanel;
