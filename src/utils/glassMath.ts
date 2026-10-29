/**
 * Mathematical utilities for optical refraction, specular highlights, and elastic resistance
 */

export function clamp(value: number, min: number, max: number): number {
  'worklet';
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  'worklet';
  return a + (b - a) * t;
}

/**
 * Calculates smooth elastic resistance when dragging past boundaries
 * @param displacement current drag offset beyond boundary
 * @param limit maximum stretch boundary before full dampening
 * @param resistanceFactor logarithmic resistance multiplier
 */
export function elasticResistance(
  displacement: number,
  limit: number = 120,
  resistanceFactor: number = 0.55
): number {
  'worklet';
  const sign = Math.sign(displacement);
  const abs = Math.abs(displacement);
  // Logarithmic damping curve
  const dampened = limit * (1 - Math.exp((-abs * resistanceFactor) / limit));
  return sign * dampened;
}

/**
 * Calculates normalized highlight coordinates based on touch origin
 */
export function calculateSpecularPosition(
  touchX: number,
  touchY: number,
  width: number,
  height: number
): { x: number; y: number; opacity: number } {
  const normX = width > 0 ? clamp(touchX / width, 0, 1) : 0.5;
  const normY = height > 0 ? clamp(touchY / height, 0, 1) : 0.5;
  // Intensity is highest near the upper surface
  const topBias = 1 - normY * 0.5;
  return {
    x: normX * 100,
    y: normY * 100,
    opacity: clamp(topBias * 0.35, 0.1, 0.4),
  };
}
