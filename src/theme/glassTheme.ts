/**
 * Liquid Glass UI Engine - Obsidian Visual Design Tokens
 * Conforming to Section 3 of the Liquid Glass Specification
 */

export const glassTheme = {
  colors: {
    // Cinematic Obsidian Backgrounds
    backgroundBase: '#050506',
    backgroundSecondary: '#0A0A0D',
    backgroundTertiary: '#0F0F14',

    // Liquid Glass Fills (Dynamic Opacity Base)
    glassSurface: 'rgba(20, 20, 24, 0.58)',
    glassSurfaceElevated: 'rgba(26, 26, 32, 0.68)',
    glassSurfacePressed: 'rgba(32, 32, 40, 0.78)',
    glassSurfaceInput: 'rgba(16, 16, 20, 0.65)',
    glassSurfaceSheet: 'rgba(14, 14, 18, 0.88)',

    // Optical Refraction & Specular Highlights
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassBorderHighlight: 'rgba(255, 255, 255, 0.22)',
    glassSpecularTop: 'rgba(255, 255, 255, 0.28)',
    glassInnerReflection: 'rgba(255, 255, 255, 0.05)',
    glassGlow: 'rgba(255, 255, 255, 0.08)',

    // Text & Content Hierarchy
    textPrimary: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    textDisabled: '#52525B',

    // Restrained Accents (Cool Silver / Obsidian Emerald / Ruby)
    accentSilver: '#E2E8F0',
    accentCoolWhite: '#FFFFFF',
    accentCyanGlow: 'rgba(56, 189, 248, 0.25)',
    accentEmerald: '#10B981',
    accentRuby: '#E50914',

    // Optical Shadows
    shadowDeep: 'rgba(0, 0, 0, 0.65)',
    shadowAmbient: 'rgba(0, 0, 0, 0.35)',
  },

  radii: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    full: 9999,
  },

  blur: {
    subtle: 8,
    standard: 16,
    deep: 24,
    intense: 36,
  },

  // Physics Configurations (Section 5)
  springs: {
    // Primary tactile interaction (button press, tab switch)
    primary: {
      stiffness: 280,
      damping: 24,
      mass: 0.8,
      overshootClamping: false,
      restDisplacementThreshold: 0.001,
      restSpeedThreshold: 0.001,
    },
    // Soft panel movement (dragging, sheet expand)
    softPanel: {
      stiffness: 170,
      damping: 22,
      mass: 1.0,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
    // Elastic release (card release, snap back)
    elasticRelease: {
      stiffness: 220,
      damping: 18,
      mass: 0.9,
      overshootClamping: false,
      restDisplacementThreshold: 0.005,
      restSpeedThreshold: 0.005,
    },
    // Modal & Sheet entrance
    modalEntrance: {
      stiffness: 240,
      damping: 26,
      mass: 0.9,
      overshootClamping: false,
      restDisplacementThreshold: 0.005,
      restSpeedThreshold: 0.005,
    },
  },
} as const;

export type GlassTheme = typeof glassTheme;
