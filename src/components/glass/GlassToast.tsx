import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { GlassToastProps } from '../../types/glass';
import { GlassSurface } from './GlassSurface';
import { glassTheme } from '../../theme/glassTheme';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

export const GlassToast: React.FC<GlassToastProps> = ({ toast, onDismiss }) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      translateX.setValue(0);
      Animated.parallel([
        createGlassSpring(translateY, 0, 'modalEntrance', springStrength, true),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.durationMs || 3500);

      return () => clearTimeout(timer);
    }
  }, [toast, springStrength]);

  const handleDismiss = () => {
    Animated.parallel([
      createGlassSpring(translateY, -100, 'primary', springStrength, true),
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onDismiss());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > 100 || Math.abs(gesture.vx) > 0.8) {
          Animated.timing(translateX, {
            toValue: gesture.dx > 0 ? 400 : -400,
            duration: 150,
            useNativeDriver: true,
          }).start(() => onDismiss());
        } else {
          createGlassSpring(translateX, 0, 'elasticRelease', springStrength, true).start();
        }
      },
    })
  ).current;

  if (!toast) return null;

  let accentColor = '#38BDF8';
  let icon = 'ℹ️';

  if (toast.type === 'success') {
    accentColor = '#10B981';
    icon = '✓';
  } else if (toast.type === 'warning') {
    accentColor = '#F59E0B';
    icon = '⚠️';
  } else if (toast.type === 'error') {
    accentColor = '#EF4444';
    icon = '✕';
  }

  return (
    <Animated.View
      style={[
        styles.toastWrap,
        {
          opacity,
          transform: [{ translateY }, { translateX }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={handleDismiss}>
        <GlassSurface
          elevation="floating"
          radius={glassTheme.radii.lg}
          style={[styles.surface, { borderColor: `${accentColor}44` }]}
          showSpecularTop
        >
          <View style={[styles.indicatorDot, { backgroundColor: accentColor }]} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{toast.title}</Text>
            {toast.description && <Text style={styles.description}>{toast.description}</Text>}
          </View>
          <Text style={styles.dismissHint}>✕</Text>
        </GlassSurface>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(18, 18, 24, 0.92)',
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  dismissHint: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
