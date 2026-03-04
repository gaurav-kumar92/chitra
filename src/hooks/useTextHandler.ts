'use client';
import { useCallback } from 'react';

type UseTextHandlerProps = {
  canvasRef: React.RefObject<{ stage: any; layer: any }>;
  updateLayers: () => void;
  setSelectedNodes: (nodes: any[]) => void;
  applyFill: (node: any, config: any) => void;
  attachDoubleClick: (node: any) => void;
  editingTextNode: any;
  setEditingTextNode: (node: any) => void;
  forceRecord?: () => void;
};

export const useTextHandler = ({
  canvasRef,
  updateLayers,
  setSelectedNodes,
  applyFill,
  attachDoubleClick,
  editingTextNode,
  setEditingTextNode,
  forceRecord,
}: UseTextHandlerProps) => {
  const handleAddOrUpdateText = useCallback(
    (config: any) => {
      if (
        !canvasRef.current?.stage ||
        !canvasRef.current?.layer ||
        !window.Konva
      ) {
        console.warn('Canvas or Konva not ready');
        return;
      }

      const { stage, layer } = canvasRef.current;
      const uniqueId =
        config.id || `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // --- Preservation of Transform ---
      let oldTransform = {
        x: stage.width() / 2,
        y: stage.height() / 2,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      };
      let oldAttrs = {};

      const oldNode = layer.findOne(`#${uniqueId}`);
      if (oldNode) {
        oldTransform = {
          x: oldNode.x(),
          y: oldNode.y(),
          scaleX: oldNode.scaleX(),
          scaleY: oldNode.scaleY(),
          rotation: oldNode.rotation(),
        };
        // Preserve all existing data attributes
        Object.keys(oldNode.attrs).forEach((key) => {
          if (key.startsWith('data-')) {
            (oldAttrs as any)[key] = oldNode.attrs[key];
          }
        });
        oldNode.destroy();
      }

      if (editingTextNode?.id?.() === uniqueId) {
        setEditingTextNode(null);
      }

      // Combine all attributes: old data, current node context, and new dialog config
      const dataAttrs = {
        ...oldAttrs,
        ...(editingTextNode?.getAttrs?.() || {}), // Get context from editing node if available
        ...config, // Apply new changes from dialog last to override
      };

      // Define all attributes for the new node based on the final config
      const allAttrs = {
        'data-text': dataAttrs.text || 'New Text',
        'data-font-size': dataAttrs.fontSize || 24,
        'data-font-family': dataAttrs.fontFamily || 'Inter',
        'data-letter-spacing': dataAttrs.letterSpacing ?? 0,
        'data-line-height': dataAttrs.lineHeight ?? 1.2,
        'data-align': dataAttrs.align || 'left',
        'data-is-bold': dataAttrs.isBold || false,
        'data-is-italic': dataAttrs.isItalic || false,
        'data-is-underline': dataAttrs.isUnderline || false,
        'data-is-strikethrough': dataAttrs.isStrikethrough || false,
        'data-is-shadow': dataAttrs.isShadow || false,
        'data-shadow-blur': dataAttrs.shadowBlur ?? 10,
        'data-shadow-distance': dataAttrs.shadowDistance ?? 5,
        'data-shadow-opacity': dataAttrs.shadowOpacity ?? 0.5,
        'data-is-glow': dataAttrs.isGlow || false,
        'data-glow-color': dataAttrs.glowColor || '#0000ff',
        'data-glow-blur': dataAttrs.glowBlur ?? 10,
        'data-glow-opacity': dataAttrs.glowOpacity ?? 0.7,
        'data-radius': dataAttrs.radius || 150,
        'data-curvature': dataAttrs.curvature ?? 0,
        'data-is-gradient': dataAttrs.isGradient || false,
        'data-solid-color': dataAttrs.solidColor || '#000000',
        'data-color-stops': dataAttrs.colorStops || [],
        'data-gradient-direction':
          dataAttrs.gradientDirection || 'top-to-bottom',
      };

      let newNode: any;

      if (allAttrs['data-curvature'] > 0) {
        // Logic for Circular Text
        const circularGroup = new window.Konva.Group({
          id: uniqueId,
          name: 'circularText',
          draggable: true,
          ...oldTransform,
          ...allAttrs,
        });

        const tempText = new window.Konva.Text({
          text: 'A',
          fontSize: allAttrs['data-font-size'],
          fontFamily: allAttrs['data-font-family'],
        });
        const charHeight = tempText.height();
        const fontStyle = `${allAttrs['data-is-bold'] ? 'bold ' : ''}${
          allAttrs['data-is-italic'] ? 'italic ' : ''
        }`.trim();
        const decorations = [
          allAttrs['data-is-underline'] ? 'underline' : '',
          allAttrs['data-is-strikethrough'] ? 'line-through' : '',
        ]
          .filter(Boolean)
          .join(' ');

        let cumulativeAngle = 0;
        for (const char of allAttrs['data-text']) {
          tempText.text(char);
          const charWidth = tempText.width();
          const charAngularWidth =
            (charWidth + allAttrs['data-letter-spacing']) /
            allAttrs['data-radius'];
          const centerAngle = cumulativeAngle + charAngularWidth / 2;
          const placementAngle = centerAngle - Math.PI / 2;

          const charNode = new window.Konva.Text({
            text: char,
            x: allAttrs['data-radius'] * Math.cos(placementAngle),
            y: allAttrs['data-radius'] * Math.sin(placementAngle),
            fontSize: allAttrs['data-font-size'],
            fontFamily: allAttrs['data-font-family'],
            fontStyle,
            textDecoration: decorations,
            rotation: (centerAngle * 180) / Math.PI,
            offsetX: charWidth / 2,
            offsetY: charHeight / 2,
            name: 'mainChar',
            fill: allAttrs['data-solid-color'],
          });
          circularGroup.add(charNode);
          cumulativeAngle += charAngularWidth;
        }
        tempText.destroy();
        circularGroup.rotation(
          (circularGroup.rotation() || 0) -
            (cumulativeAngle * 180) / (2 * Math.PI)
        );
        
        // After adding all chars, get bounding box and set offset
        const box = circularGroup.getClientRect({ skipTransform: true });
        circularGroup.offsetX(box.width / 2);
        circularGroup.offsetY(box.height / 2);

        newNode = circularGroup;
      } else {
        // Logic for Regular Text
        const textGroup = new window.Konva.Group({
          id: uniqueId,
          name: 'textGroup',
          draggable: true,
          ...oldTransform,
          ...allAttrs,
        });

        const mainText = new window.Konva.Text({
          text: allAttrs['data-text'],
          fontSize: allAttrs['data-font-size'],
          fontFamily: allAttrs['data-font-family'],
          letterSpacing: allAttrs['data-letter-spacing'],
          lineHeight: allAttrs['data-line-height'],
          align: allAttrs['data-align'],
          fill: allAttrs['data-solid-color'],
          name: 'text',
          fontStyle: `${allAttrs['data-is-bold'] ? 'bold ' : ''}${
            allAttrs['data-is-italic'] ? 'italic ' : ''
          }`.trim(),
          textDecoration: [
            allAttrs['data-is-underline'] ? 'underline' : '',
            allAttrs['data-is-strikethrough'] ? 'line-through' : '',
          ]
            .filter(Boolean)
            .join(' '),
        });

        if (allAttrs['data-is-shadow']) {
          mainText.shadowEnabled(true);
          mainText.shadowColor('#000000');
          mainText.shadowBlur(allAttrs['data-shadow-blur']);
          mainText.shadowOffset({
            x: allAttrs['data-shadow-distance'],
            y: allAttrs['data-shadow-distance'],
          });
          mainText.shadowOpacity(allAttrs['data-shadow-opacity']);
        }

        textGroup.add(mainText);
        textGroup.offsetX(mainText.width() / 2);
        textGroup.offsetY(mainText.height() / 2);
        newNode = textGroup;
      }

      if (newNode) {
        attachDoubleClick(newNode);
        layer.add(newNode);

        const colorConfig = {
          isGradient: allAttrs['data-is-gradient'],
          solidColor: allAttrs['data-solid-color'],
          colorStops: allAttrs['data-color-stops'],
          gradientDirection: allAttrs['data-gradient-direction'],
        };

        if (colorConfig.isGradient && colorConfig.colorStops?.length > 0) {
          applyFill(newNode, colorConfig);
        }

        setSelectedNodes([newNode]);
        updateLayers();
        layer.draw();
        forceRecord?.();
      }
    },
    [
      canvasRef,
      setSelectedNodes,
      updateLayers,
      applyFill,
      attachDoubleClick,
      forceRecord,
      editingTextNode,
      setEditingTextNode,
    ]
  );

  return {
    handleAddOrUpdateText,
  };
};
