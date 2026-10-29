import { Animated } from 'react-native';
import { glassTheme } from '../theme/glassTheme';

export type SpringPreset = 'primary' | 'softPanel' | 'elasticRelease' | 'modalEntrance';

/**
 * Creates a tuned Animated.spring configuration with dynamic springStrength scaling
 */
export function createGlassSpring(
  value: Animated.Value | Animated.ValueXY,
  toValue: number | { x: number; y: number },
  preset: SpringPreset = 'primary',
  springStrengthMultiplier: number = 1.0,
  useNativeDriver: boolean = true
): Animated.CompositeAnimation {
  const base = glassTheme.springs[preset];

  // Scale stiffness and damping proportionally by springStrength
  const effectiveStiffness = base.stiffness * springStrengthMultiplier;
  const effectiveDamping = base.damping * Math.sqrt(springStrengthMultiplier);

  return Animated.spring(value, {
    toValue: toValue as any,
    stiffness: effectiveStiffness,
    damping: effectiveDamping,
    mass: base.mass,
    overshootClamping: base.overshootClamping,
    restDisplacementThreshold: base.restDisplacementThreshold,
    restSpeedThreshold: base.restSpeedThreshold,
    useNativeDriver,
  });
}

/**
 * Creates smooth touch compression spring (scales down to 0.96 then rebounds to 1.0)
 */
export function animatePress(
  scaleValue: Animated.Value,
  pressed: boolean,
  springStrengthMultiplier: number = 1.0,
  targetScale: number = 0.96
) {
  createGlassSpring(
    scaleValue,
    pressed ? targetScale : 1.0,
    'primary',
    springStrengthMultiplier,
    true
  ).start();
}
