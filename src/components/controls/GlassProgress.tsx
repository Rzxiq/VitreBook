import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { GlassProgressProps } from '../../types/glass';
import { clamp } from '../../utils/glassMath';

export const GlassProgress: React.FC<GlassProgressProps> = ({
  progress,
  height = 6,
  showShimmer = true,
  style,
}) => {
  const clamped = clamp(progress, 0, 1);
  const widthAnim = useRef(new Animated.Value(clamped)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  useEffect(() => {
    if (!showShimmer) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showShimmer]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 200],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      {/* Top Specular Rim */}
      <View style={styles.specularTop} />

      {/* Progress Fill */}
      <Animated.View
        style={[
          styles.fill,
          {
            width: widthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
            borderRadius: height / 2,
          },
        ]}
      >
        {/* Specular Shimmer Highlight */}
        {showShimmer && (
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerTranslateX }],
              },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FAFAFA',
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    transform: [{ skewX: '-20deg' }],
  },
});
