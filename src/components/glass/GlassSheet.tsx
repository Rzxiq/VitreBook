import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { GlassSheetProps } from '../../types/glass';
import { GlassSurface } from './GlassSurface';
import { glassTheme } from '../../theme/glassTheme';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const GlassSheet: React.FC<GlassSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  dismissOnBackdropPress = true,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Spring entrance
      createGlassSpring(translateY, 0, 'modalEntrance', springStrength, true).start();
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      // Dismiss
      Animated.parallel([
        createGlassSpring(translateY, SCREEN_HEIGHT, 'modalEntrance', springStrength, true),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, springStrength]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120 || gesture.vy > 0.8) {
          // Dragged past threshold, dismiss sheet
          Animated.parallel([
            createGlassSpring(translateY, SCREEN_HEIGHT, 'modalEntrance', springStrength, true),
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(() => onClose());
        } else {
          // Snap back to top
          createGlassSpring(translateY, 0, 'elasticRelease', springStrength, true).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Animated Dimming Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="auto"
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={dismissOnBackdropPress ? onClose : undefined}
          />
        </Animated.View>

        {/* Drag-to-Dismiss Liquid Glass Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <GlassSurface
            radius={glassTheme.radii.xl}
            elevation="overlay"
            style={styles.sheetSurface}
            showSpecularTop
          >
            {/* Grab Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.grabHandle} />
            </View>

            {/* Title */}
            {title && (
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Content */}
            <View style={styles.contentWrap}>{children}</View>
          </GlassSurface>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
  },
  sheetContainer: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  sheetSurface: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    backgroundColor: 'rgba(14, 14, 18, 0.94)',
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  grabHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  titleText: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentWrap: {
    paddingVertical: 8,
  },
});
