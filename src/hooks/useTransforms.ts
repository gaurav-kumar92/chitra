'use client';

import { useCallback } from "react";

export function useTransforms({ 
    canvasRef, 
    selectedNodes, 
    getUnlocked, 
    isNodeLocked, 
    forceRecord 
  }) {
     // ---- applyFill (AS-IS) ----
  const applyFill = useCallback(
    (node: any, config: any) => {
      if (isNodeLocked(node)) return;
      let targetNodes;

      if (node.hasName('clipart')) {
        targetNodes = node.find('.clipart-face');
      } else if (node.hasName('textGroup') || node.hasName('circularText')) {
        targetNodes = node.find('.mainChar, .text, Text');
      } else {
        targetNodes = [node];
      }
      targetNodes.forEach((n: any) => {
        if (isNodeLocked(n) || typeof n.fill !== 'function') return;
        n.fill(null);
        n.fillLinearGradientColorStops([]);
        n.fillRadialGradientColorStops([]);
        if (config.isGradient) {
            const { width, height } = n.getClientRect({ relativeTo: n.getParent() });
            const colorStopsFlat = config.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);

            if (config.gradientDirection === 'radial') {
                n.fillPriority('radial-gradient');
                n.fillRadialGradientStartPoint({ x: width / 2, y: height / 2 });
                n.fillRadialGradientStartRadius(0);
                n.fillRadialGradientEndPoint({ x: width / 2, y: height / 2 });
                n.fillRadialGradientEndRadius(Math.max(width, height) / 2);
                n.fillRadialGradientColorStops(colorStopsFlat);
              } else {
                n.fillPriority('linear-gradient');
                let start = { x: 0, y: 0 };
                let end = { x: 0, y: 0 };
                switch (config.gradientDirection) {
                    case 'top-to-bottom': end = { x: 0, y: height }; break;
                    case 'left-to-right': end = { x: width, y: 0 }; break;
                    case 'diagonal-tl-br': end = { x: width, y: height }; break;
                    case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
                  }
                  n.fillLinearGradientStartPoint(start);
                  n.fillLinearGradientEndPoint(end);
                  n.fillLinearGradientColorStops(colorStopsFlat);
                }
              } else {
                n.fillPriority('color');
                n.fill(config.solidColor);
              }
            });
          },
          [isNodeLocked]
        );
        // ---- applyStroke (AS-IS) ----
  const applyStroke = useCallback(
    (node: any, config: any) => {
      if (isNodeLocked(node)) return;

      if (config.isGradient) {
        const { width, height } = node.getClientRect({ relativeTo: node.getParent() });
        const colorStopsFlat = config.colorStops.flatMap((cs: any) => [cs.stop, cs.color]);

        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 0 };

        switch (config.gradientDirection) {
          case 'left-to-right': end = { x: width, y: 0 }; break;
          case 'diagonal-tl-br': end = { x: width, y: height }; break;
          case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
          default: end = { x: 0, y: height }; break;
        }
        node.strokeLinearGradientStartPoint(start);
        node.strokeLinearGradientEndPoint(end);
        node.strokeLinearGradientColorStops(colorStopsFlat);

        node.setAttr('data-is-gradient', true);
        node.setAttr('data-gradient-direction', config.gradientDirection);
        node.setAttr('data-color-stops', config.colorStops);
      } else {
        const solidColor = config.solidColor || node.getAttr('data-solid-color') || '#3b82f6';
        node.strokeLinearGradientStartPoint({ x: 0, y: 0 });
        node.strokeLinearGradientEndPoint({ x: 0, y: 0 });
        node.strokeLinearGradientColorStops(null);
        node.stroke(solidColor);

        node.setAttr('data-is-gradient', false);
        node.setAttr('data-solid-color', solidColor);
      }

      const layer = node.getLayer();
      if (layer) layer.draw();
    },
    [isNodeLocked]
  );
  // ---- handleOpacityChange (AS-IS) ----
  const handleOpacityChange = useCallback((opacity: number) => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;

    nodes.forEach((node) => node.opacity(opacity));
    canvasRef.current?.layer?.draw?.();
    forceRecord?.();
  }, [selectedNodes, getUnlocked, canvasRef, forceRecord]);
 // ---- handleScaleChange (AS-IS) ----
 const handleScaleChange = useCallback((scalePercent: number) => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0 || !canvasRef.current?.stage) return;

    const canvasWidth = canvasRef.current.stage.width();

    nodes.forEach(node => {
      const clientRect = node.getClientRect({ skipTransform: true });
      const unscaledWidth = clientRect.width;

      if (unscaledWidth > 0) {
        const targetScale = (canvasWidth / unscaledWidth) * scalePercent;
        node.scale({ x: targetScale, y: targetScale });
      }
    });
    canvasRef.current?.layer?.draw?.();
    forceRecord?.();
  }, [selectedNodes, getUnlocked, canvasRef, forceRecord]);
 // ---- handleRotationChange (AS-IS) ----
 const handleRotationChange = useCallback((rotation: number) => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;

    nodes.forEach((node) => node.rotation(rotation));
    canvasRef.current?.layer?.draw?.();
    forceRecord?.();
  }, [selectedNodes, getUnlocked, canvasRef, forceRecord]);
  // ---- handleFlip (AS-IS) ----
  const handleFlip = useCallback((direction: 'horizontal' | 'vertical') => {
    const layer = canvasRef.current?.layer;
    if (!layer) return;

    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;

    nodes.forEach((node) => {
      const box = node.getClientRect();
      if (direction === 'horizontal') node.scaleX(node.scaleX() * -1);
      else node.scaleY(node.scaleY() * -1);

      const newBox = node.getClientRect();
      const deltaX = (box.x + box.width / 2) - (newBox.x + newBox.width / 2);
      const deltaY = (box.y + box.height / 2) - (newBox.y + newBox.height / 2);
      node.x(node.x() + deltaX);
      node.y(node.y() + deltaY);
    });

    layer.batchDraw();
    forceRecord?.();
  }, [selectedNodes, getUnlocked, canvasRef, forceRecord]);
   // ---- handleAlign (AS-IS) ----
   const handleAlign = useCallback((position: string) => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0 || !canvasRef.current?.stage) return;

    const stage = canvasRef.current.stage;

    nodes.forEach((node) => {
      const box = node.getClientRect({ relativeTo: stage });
      let newX = node.x();
      let newY = node.y();

      switch (position) {
        case 'top':    newY -= box.y; break;
        case 'left':   newX -= box.x; break;
        case 'center':
          newX -= (box.x + box.width / 2) - stage.width() / 2;
          newY -= (box.y + box.height / 2) - stage.height() / 2;
          break;
        case 'right':  newX += stage.width() - (box.x + box.width); break;
        case 'bottom': newY += stage.height() - (box.y + box.height); break;
      }

      node.position({ x: newX, y: newY });
    });

    canvasRef.current?.layer?.draw?.();
  }, [selectedNodes, getUnlocked, canvasRef]);
  // ---- handleMoveNode (AS-IS) ----
  const handleMoveNode = useCallback((action: 'up' | 'down', nodeId: string) => {
    if (!canvasRef.current?.layer) return;

    const { layer } = canvasRef.current;
    const node = layer.findOne(`#${nodeId}`);
    if (!node || isNodeLocked(node)) return;

    if (action === 'up') node.moveUp();
    else if (action === 'down' && node.getZIndex() > 1) node.moveDown();

    layer.batchDraw();
    forceRecord?.();
  }, [canvasRef, isNodeLocked, forceRecord]);
  // ---- handleColorUpdate (AS-IS) ----
  const handleColorUpdate = useCallback((config: any) => {
    const nodes = getUnlocked(selectedNodes);
    if (nodes.length === 0) return;

    nodes.forEach((node) => {
      if (node.hasName('group')) {
        node.find('*').forEach((child: any) => {
          if (isNodeLocked(child)) return;

          const childUsesStroke =
            (child.name() === 'shape' &&
              ['line', 'arrow', 'curve'].includes(child.getAttr('data-type'))) ||
            child.name() === 'frame';

          child.setAttrs({
            'data-is-gradient': config.isGradient,
            'data-solid-color': config.solidColor,
            'data-color-stops': config.colorStops,
            'data-gradient-direction': config.gradientDirection,
          });

          if (childUsesStroke) applyStroke(child, config);
          else applyFill(child, config);
        });
      } else {
        const nodeType = node.name();
        const shapeType = node.getAttr('data-type');

        const usesStroke =
          (nodeType === 'shape' &&
            ['line', 'arrow', 'curve'].includes(shapeType)) ||
          nodeType === 'frame';

        node.setAttrs({
          'data-is-gradient': config.isGradient,
          'data-solid-color': config.solidColor,
          'data-color-stops': config.colorStops,
          'data-gradient-direction': config.gradientDirection,
        });

        if (usesStroke) applyStroke(node, config);
        else applyFill(node, config);
      }
    });

    canvasRef.current?.layer.draw();
    forceRecord?.();
  }, [selectedNodes, getUnlocked, canvasRef, isNodeLocked, applyFill, applyStroke, forceRecord]);
  return {
    applyFill,
    applyStroke,
    handleOpacityChange,
    handleScaleChange,
    handleRotationChange,
    handleFlip,
    handleAlign,
    handleMoveNode,
    handleColorUpdate
  };
}