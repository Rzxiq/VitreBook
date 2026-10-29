import { ViewStyle } from 'react-native';
import { glassTheme } from '../theme/glassTheme';
import { GlassElevation } from '../types/glass';

export interface GlassMaterialConfig {
  opacity?: number;
  elevation?: GlassElevation;
  showReflection?: boolean;
  borderWidth?: number;
  radius?: number;
}

export class GlassMaterial {
  /**
   * Generates dynamic surface background style factoring in real-time opacity
   */
  static getSurfaceStyle(opacity: number = 0.58, elevation: GlassElevation = 'raised'): ViewStyle {
    let baseR = 20;
    let baseG = 20;
    let baseB = 24;

    switch (elevation) {
      case 'flat':
        baseR = 14;
        baseG = 14;
        baseB = 18;
        break;
      case 'raised':
        baseR = 20;
        baseG = 20;
        baseB = 25;
        break;
      case 'floating':
        baseR = 26;
        baseG = 26;
        baseB = 34;
        break;
      case 'overlay':
        baseR = 12;
        baseG = 12;
        baseB = 16;
        break;
    }

    const clampedAlpha = Math.max(0.1, Math.min(0.95, opacity));

    return {
      backgroundColor: `rgba(${baseR}, ${baseG}, ${baseB}, ${clampedAlpha})`,
    };
  }

  /**
   * Generates optical edge refraction borders:
   * Fine top border has specular highlight (white 0.22 - 0.35)
   * Bottom border fades to subtle graphite (white 0.06)
   */
  static getBorderTokens(opacity: number = 0.58) {
    const boost = Math.min(0.15, opacity * 0.15);
    return {
      borderTopColor: `rgba(255, 255, 255, ${(0.22 + boost).toFixed(2)})`,
      borderBottomColor: `rgba(255, 255, 255, ${(0.07 + boost * 0.5).toFixed(2)})`,
      borderLeftColor: `rgba(255, 255, 255, ${(0.12 + boost).toFixed(2)})`,
      borderRightColor: `rgba(255, 255, 255, ${(0.12 + boost).toFixed(2)})`,
    };
  }

  /**
   * Generates layered shadow depth without GPU penalty
   */
  static getShadowStyle(elevation: GlassElevation = 'raised'): ViewStyle {
    switch (elevation) {
      case 'flat':
        return {
          elevation: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.35,
          shadowRadius: 4,
        };
      case 'raised':
        return {
          elevation: 6,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.55,
          shadowRadius: 12,
        };
      case 'floating':
        return {
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.75,
          shadowRadius: 24,
        };
      case 'overlay':
        return {
          elevation: 18,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.85,
          shadowRadius: 32,
        };
    }
  }
}
