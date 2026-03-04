import { useCallback } from 'react';
import type Konva from 'konva';

export type GradientConfig = {
  type: 'linear' | 'radial';
  direction?: 'top-to-bottom' | 'left-to-right' | 'diagonal-tl-br' | 'diagonal-tr-bl';
  colorStops: { stop: number; color: string }[];
};

export function useGradient() {
  const applyGradient = useCallback(
    (rect: Konva.Rect, config: GradientConfig) => {
      if (!rect || typeof window === 'undefined') return;

      const { width, height } = rect.getClientRect();
      const colorStopsFlat = config.colorStops.flatMap(cs => [
        cs.stop,
        cs.color,
      ]);

      rect.fill(null);
      rect.fillLinearGradientColorStops(null);
      rect.fillRadialGradientColorStops(null);

      if (config.type === 'radial') {
        const radius = Math.sqrt(width * width + height * height) / 2;
        rect.fillPriority('radial-gradient');
        rect.fillRadialGradientStartPoint({ x: width / 2, y: height / 2 });
        rect.fillRadialGradientStartRadius(0);
        rect.fillRadialGradientEndPoint({ x: width / 2, y: height / 2 });
        rect.fillRadialGradientEndRadius(radius);
        rect.fillRadialGradientColorStops(colorStopsFlat);
        return;
      }

      let start = { x: 0, y: 0 };
      let end = { x: 0, y: height };

      switch (config.direction) {
        case 'left-to-right': end = { x: width, y: 0 }; break;
        case 'diagonal-tl-br': end = { x: width, y: height }; break;
        case 'diagonal-tr-bl': start = { x: width, y: 0 }; end = { x: 0, y: height }; break;
      }

      rect.fillPriority('linear-gradient');
      rect.fillLinearGradientStartPoint(start);
      rect.fillLinearGradientEndPoint(end);
      rect.fillLinearGradientColorStops(colorStopsFlat);
    },
    []
  );

  return { applyGradient };
}
