import { ViewStyle, TextStyle, StyleProp } from 'react-native';

export type GlassElevation = 'flat' | 'raised' | 'floating' | 'overlay';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  opacity?: number;
  borderWidth?: number;
  borderColor?: string;
  elevation?: GlassElevation;
  showSpecularTop?: boolean;
  showReflection?: boolean;
  blurIntensity?: number;
  animatedStyle?: any;
}

export interface GlassButtonProps {
  title: string;
  onPress: () => void;
  onLongPress?: () => void;
  icon?: string | React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export interface GlassTabItem {
  key: string;
  label: string;
  icon: string;
  badge?: number | string;
}

export interface GlassTabBarProps {
  tabs: GlassTabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: GlassElevation;
  interactive?: boolean;
  onPress?: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export interface GlassSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  dismissOnBackdropPress?: boolean;
}

export interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

export interface GlassToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export interface GlassSliderProps {
  value: number; // 0 to 1 or custom range
  onValueChange: (val: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  valueFormatter?: (val: number) => string;
  style?: StyleProp<ViewStyle>;
}

export interface GlassDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface GlassIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export interface GlassProgressProps {
  progress: number; // 0 to 1
  height?: number;
  showShimmer?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  durationMs?: number;
}

export interface GlassToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export interface GlassRippleProps {
  x: number;
  y: number;
  onFinish?: () => void;
}

export interface GlassEngineState {
  // Real-time controllable parameters
  glassOpacity: number; // 0.1 to 1.0 (default: 0.58)
  blurIntensity: number; // 4 to 40 (default: 16)
  reflectionEnabled: boolean; // boolean (default: true)
  springStrength: number; // 0.5 to 2.0 (default: 1.0)
  activeTab: string; // 'demo' | 'controls' | 'presets' | 'about'

  // Actions
  setGlassOpacity: (val: number) => void;
  setBlurIntensity: (val: number) => void;
  setReflectionEnabled: (val: boolean) => void;
  setSpringStrength: (val: number) => void;
  setActiveTab: (tab: string) => void;
  resetToDefaults: () => void;
}
