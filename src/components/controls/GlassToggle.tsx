import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { GlassToggleProps } from '../../types/glass';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

export const GlassToggle: React.FC<GlassToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  label,
  style,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const thumbAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    createGlassSpring(thumbAnim, value ? 1 : 0, 'primary', springStrength, true).start();
  }, [value, springStrength]);

  const thumbTranslateX = thumbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      >
        <View
          style={[
            styles.track,
            {
              backgroundColor: value ? 'rgba(40, 50, 45, 0.75)' : 'rgba(20, 20, 26, 0.65)',
              borderColor: value ? 'rgba(16, 185, 129, 0.45)' : 'rgba(255, 255, 255, 0.12)',
            },
          ]}
        >
          {/* Top specular edge */}
          <View style={styles.specularTop} />

          {/* Liquid Glass Thumb */}
          <Animated.View
            style={[
              styles.thumb,
              {
                backgroundColor: value ? '#10B981' : 'rgba(255, 255, 255, 0.85)',
                transform: [{ translateX: thumbTranslateX }],
              },
            ]}
          >
            {/* Thumb highlight */}
            <View style={styles.thumbHighlight} />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: '#FAFAFA',
    fontSize: 14,
    fontWeight: '500',
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 4,
    right: 4,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  thumbHighlight: {
    position: 'absolute',
    top: 2,
    left: 4,
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
});
