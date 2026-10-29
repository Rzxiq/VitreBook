import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { GlassCardProps } from '../../types/glass';
import { GlassSurface } from './GlassSurface';
import { glassTheme } from '../../theme/glassTheme';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  elevation = 'raised',
  interactive = false,
  onPress,
  expanded = false,
  onToggleExpand,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!interactive && !onPress && !onToggleExpand) return;
    createGlassSpring(scale, 0.98, 'primary', springStrength, true).start();
  };

  const handlePressOut = () => {
    if (!interactive && !onPress && !onToggleExpand) return;
    createGlassSpring(scale, 1.0, 'primary', springStrength, true).start();
  };

  const handlePress = () => {
    if (onToggleExpand) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onToggleExpand();
    } else if (onPress) {
      onPress();
    }
  };

  const content = (
    <GlassSurface
      elevation={elevation}
      radius={glassTheme.radii.lg}
      style={[styles.cardSurface, style]}
    >
      {children}
    </GlassSurface>
  );

  if (interactive || onPress || onToggleExpand) {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View style={{ transform: [{ scale }] }}>{content}</Animated.View>
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  cardSurface: {
    padding: 18,
    marginBottom: 14,
  },
});
