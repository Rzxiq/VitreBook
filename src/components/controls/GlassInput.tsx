import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Animated,
} from 'react-native';
import { GlassInputProps } from '../../types/glass';
import { glassTheme } from '../../theme/glassTheme';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  icon,
  style,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const [isFocused, setIsFocused] = useState(false);

  // Focus glow & border animation
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    createGlassSpring(focusAnim, 1, 'primary', springStrength, false).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    createGlassSpring(focusAnim, 0, 'primary', springStrength, false).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255, 255, 255, 0.12)',
      error ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.38)',
    ],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(16, 16, 20, 0.65)', 'rgba(24, 24, 32, 0.85)'],
  });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        {/* Fine Top Rim */}
        <View style={styles.topRim} />

        {icon && <Text style={styles.icon}>{icon}</Text>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#71717A"
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.textInput}
          selectionColor="#FAFAFA"
        />
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 14,
  },
  label: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: glassTheme.radii.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  topRim: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    color: '#FAFAFA',
    fontSize: 14,
    padding: 0,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 2,
  },
});
