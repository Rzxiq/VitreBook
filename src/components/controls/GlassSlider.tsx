import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { GlassSliderProps } from '../../types/glass';
import { clamp } from '../../utils/glassMath';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

export const GlassSlider: React.FC<GlassSliderProps> = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 1,
  label,
  valueFormatter,
  style,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const [trackWidth, setTrackWidth] = useState(200);

  const thumbScale = useRef(new Animated.Value(1)).current;

  // Compute normalized fraction (0 to 1)
  const fraction = clamp((value - minimumValue) / (maximumValue - minimumValue), 0, 1);

  const handleTouch = (pageX: number, locationX: number) => {
    if (trackWidth <= 0) return;
    const newFraction = clamp(locationX / trackWidth, 0, 1);
    const newValue = minimumValue + newFraction * (maximumValue - minimumValue);
    onValueChange(newValue);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        createGlassSpring(thumbScale, 1.25, 'primary', springStrength, true).start();
        handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.pageX, evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        createGlassSpring(thumbScale, 1.0, 'primary', springStrength, true).start();
      },
      onPanResponderTerminate: () => {
        createGlassSpring(thumbScale, 1.0, 'primary', springStrength, true).start();
      },
    })
  ).current;

  const displayVal = valueFormatter
    ? valueFormatter(value)
    : maximumValue <= 2
    ? `${Math.round(fraction * 100)}%`
    : `${Math.round(value)}`;

  return (
    <View style={[styles.container, style]}>
      {(label || valueFormatter) && (
        <View style={styles.headerRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={styles.valueText}>{displayVal}</Text>
        </View>
      )}

      <View
        style={styles.touchArea}
        onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        {/* Background Track */}
        <View style={styles.track}>
          {/* Active Liquid Fill */}
          <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
        </View>

        {/* Spring Assisted Glass Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              left: Math.max(0, fraction * trackWidth - 12),
              transform: [{ scale: thumbScale }],
            },
          ]}
        >
          <View style={styles.thumbCore} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#D4D4D8',
    fontSize: 13,
    fontWeight: '500',
  },
  valueText: {
    color: '#FAFAFA',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  touchArea: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  thumbCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#050506',
  },
});
