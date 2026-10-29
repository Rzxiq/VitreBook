import { useRef } from 'react';
import { Animated, PanResponder, PanResponderInstance } from 'react-native';
import { elasticResistance } from '../utils/glassMath';
import { createGlassSpring } from '../animations/springPhysics';
import { useGlassStore } from '../hooks/useGlassStore';

interface UseGlassPanResponderOptions {
  boundaryLimitX?: number;
  boundaryLimitY?: number;
  onDragStart?: () => void;
  onDragEnd?: (offset: { x: number; y: number }) => void;
  onPositionChange?: (x: number, y: number) => void;
}

export function useGlassPanResponder(options: UseGlassPanResponderOptions = {}) {
  const { boundaryLimitX = 140, boundaryLimitY = 140, onDragStart, onDragEnd } = options;
  const springStrength = useGlassStore((s) => s.springStrength);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const isDragging = useRef(false);

  const panResponder: PanResponderInstance = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        isDragging.current = true;
        pan.setOffset({
          x: (pan.x as any)._value || 0,
          y: (pan.y as any)._value || 0,
        });
        pan.setValue({ x: 0, y: 0 });
        if (onDragStart) onDragStart();
      },
      onPanResponderMove: (_, gestureState) => {
        const resistedX = elasticResistance(gestureState.dx, boundaryLimitX);
        const resistedY = elasticResistance(gestureState.dy, boundaryLimitY);
        pan.setValue({ x: resistedX, y: resistedY });
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        pan.flattenOffset();

        // Spring smoothly back to origin
        createGlassSpring(pan, { x: 0, y: 0 }, 'elasticRelease', springStrength, true).start(
          () => {
            if (onDragEnd) onDragEnd({ x: 0, y: 0 });
          }
        );
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
        pan.flattenOffset();
        createGlassSpring(pan, { x: 0, y: 0 }, 'elasticRelease', springStrength, true).start();
      },
    })
  ).current;

  return {
    pan,
    panResponder,
    isDragging,
  };
}
