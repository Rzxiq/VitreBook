import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  View,
} from 'react-native';
import { GlassButtonProps } from '../../types/glass';
import { glassTheme } from '../../theme/glassTheme';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  onLongPress,
  icon,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const scale = useRef(new Animated.Value(1)).current;
  const highlightAnim = useRef(new Animated.Value(0.15)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    createGlassSpring(scale, 0.95, 'primary', springStrength, true).start();
    createGlassSpring(highlightAnim, 0.35, 'primary', springStrength, true).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    createGlassSpring(scale, 1.0, 'primary', springStrength, true).start();
    createGlassSpring(highlightAnim, 0.15, 'primary', springStrength, true).start();
  };

  // Variant Styles
  let surfaceBg = 'rgba(28, 28, 36, 0.70)';
  let borderColor = 'rgba(255, 255, 255, 0.16)';
  let textColor = glassTheme.colors.textPrimary;

  if (variant === 'secondary') {
    surfaceBg = 'rgba(18, 18, 22, 0.50)';
    borderColor = 'rgba(255, 255, 255, 0.08)';
    textColor = glassTheme.colors.textSecondary;
  } else if (variant === 'ghost') {
    surfaceBg = 'transparent';
    borderColor = 'rgba(255, 255, 255, 0.06)';
    textColor = glassTheme.colors.textSecondary;
  } else if (variant === 'danger') {
    surfaceBg = 'rgba(229, 9, 20, 0.18)';
    borderColor = 'rgba(229, 9, 20, 0.45)';
    textColor = '#FF6B6B';
  }

  // Size configurations
  let paddingVertical = 12;
  let paddingHorizontal = 20;
  let fontSize = 14;
  let radius = glassTheme.radii.md;

  if (size === 'sm') {
    paddingVertical = 8;
    paddingHorizontal = 14;
    fontSize = 12;
    radius = glassTheme.radii.sm;
  } else if (size === 'lg') {
    paddingVertical = 16;
    paddingHorizontal = 26;
    fontSize = 16;
    radius = glassTheme.radii.lg;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: surfaceBg,
            borderColor,
            borderRadius: radius,
            paddingVertical,
            paddingHorizontal,
            opacity: disabled ? 0.4 : 1,
            transform: [{ scale }],
          },
          style,
        ]}
      >
        {/* Specular top bevel */}
        <Animated.View
          style={[
            styles.specularTop,
            {
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
              opacity: highlightAnim,
            },
          ]}
        />

        <View style={styles.contentRow}>
          {loading ? (
            <ActivityIndicator size="small" color={textColor} style={styles.spinner} />
          ) : (
            <>
              {icon && typeof icon === 'string' ? (
                <Text style={[styles.iconText, { fontSize: fontSize + 2 }]}>{icon}</Text>
              ) : (
                icon
              )}
              <Text style={[styles.title, { fontSize, color: textColor }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  iconText: {
    marginRight: 2,
  },
  spinner: {
    marginHorizontal: 12,
  },
});
