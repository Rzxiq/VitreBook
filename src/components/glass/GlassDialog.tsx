import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { GlassDialogProps } from '../../types/glass';
import { GlassSurface } from './GlassSurface';
import { GlassButton } from '../controls/GlassButton';
import { glassTheme } from '../../theme/glassTheme';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

export const GlassDialog: React.FC<GlassDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        createGlassSpring(scale, 1, 'modalEntrance', springStrength, true),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        createGlassSpring(scale, 0.85, 'modalEntrance', springStrength, true),
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, springStrength]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={onCancel}
          />
        </Animated.View>

        <Animated.View style={[styles.dialogWrap, { opacity, transform: [{ scale }] }]}>
          <GlassSurface
            elevation="overlay"
            radius={glassTheme.radii.xl}
            style={styles.surface}
            showSpecularTop
          >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <View style={styles.actionsRow}>
              {onCancel && (
                <GlassButton
                  title={cancelText}
                  variant="secondary"
                  size="sm"
                  onPress={onCancel}
                  style={styles.actionBtn}
                />
              )}
              <GlassButton
                title={confirmText}
                variant={danger ? 'danger' : 'primary'}
                size="sm"
                onPress={onConfirm}
                style={styles.actionBtn}
              />
            </View>
          </GlassSurface>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  dialogWrap: {
    width: '100%',
    maxWidth: 380,
  },
  surface: {
    padding: 22,
    backgroundColor: 'rgba(16, 16, 22, 0.92)',
  },
  title: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionBtn: {
    minWidth: 84,
  },
});
