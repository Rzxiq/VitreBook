import React, { useRef } from 'react';
import { StyleSheet, Text, Animated, TouchableOpacity } from 'react-native';
import { GlassIconProps } from '../../types/glass';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

interface ExtendedGlassIconProps extends GlassIconProps {
  onPress?: () => void;
  selected?: boolean;
}

export const GlassIcon: React.FC<ExtendedGlassIconProps> = ({
  name,
  size = 20,
  color = '#FAFAFA',
  style,
  onPress,
  selected = false,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    createGlassSpring(scale, 0.85, 'primary', springStrength, true).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    createGlassSpring(scale, 1.0, 'primary', springStrength, true).start();
  };

  const iconElement = (
    <Animated.View
      style={[
        styles.iconWrap,
        {
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
          backgroundColor: selected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          borderColor: selected ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)',
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={[styles.glyph, { fontSize: size, color }, style]}>{name}</Text>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {iconElement}
      </TouchableOpacity>
    );
  }

  return iconElement;
};

const styles = StyleSheet.create({
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  glyph: {
    textAlign: 'center',
  },
});
