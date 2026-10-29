import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { GlassSurfaceProps } from '../../types/glass';
import { GlassMaterial } from '../../materials/GlassMaterial';
import { glassTheme } from '../../theme/glassTheme';
import { useGlassStore } from '../../hooks/useGlassStore';

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  radius = glassTheme.radii.lg,
  opacity,
  elevation = 'raised',
  showSpecularTop = true,
  showReflection,
  animatedStyle,
}) => {
  const storeOpacity = useGlassStore((s) => s.glassOpacity);
  const storeReflection = useGlassStore((s) => s.reflectionEnabled);

  const effectiveOpacity = opacity !== undefined ? opacity : storeOpacity;
  const effectiveReflection = showReflection !== undefined ? showReflection : storeReflection;

  // Gentle reflection sheen oscillation
  const sheenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!effectiveReflection) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(sheenAnim, {
          toValue: 1,
          duration: 4500,
          useNativeDriver: true,
        }),
        Animated.timing(sheenAnim, {
          toValue: 0,
          duration: 4500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [effectiveReflection]);

  const sheenTranslateX = sheenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 140],
  });

  const sheenOpacity = sheenAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.03, 0.12, 0.03],
  });

  const surfaceStyle = GlassMaterial.getSurfaceStyle(effectiveOpacity, elevation);
  const borders = GlassMaterial.getBorderTokens(effectiveOpacity);
  const shadow = GlassMaterial.getShadowStyle(elevation);

  return (
    <Animated.View
      style={[
        styles.container,
        { borderRadius: radius },
        surfaceStyle,
        borders,
        shadow,
        style,
        animatedStyle,
      ]}
    >
      {/* Polished Glass Top Specular Rim */}
      {showSpecularTop && (
        <View
          style={[
            styles.specularRim,
            {
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
            },
          ]}
        />
      )}

      {/* Dynamic Specular Sheen Layer */}
      {effectiveReflection && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sheenLayer,
            {
              borderRadius: radius,
              opacity: sheenOpacity,
              transform: [{ translateX: sheenTranslateX }, { rotate: '25deg' }],
            },
          ]}
        />
      )}

      {/* Inner ambient light occlusion */}
      <View
        pointerEvents="none"
        style={[
          styles.innerOcclusion,
          {
            borderRadius: radius,
          },
        ]}
      />

      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  specularRim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    zIndex: 2,
  },
  sheenLayer: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 90,
    height: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    zIndex: 1,
  },
  innerOcclusion: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    zIndex: 1,
  },
});
