import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';

import { GlassSurface } from '../components/glass/GlassSurface';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/controls/GlassButton';
import { GlassSlider } from '../components/controls/GlassSlider';
import { GlassToggle } from '../components/controls/GlassToggle';
import { GlassInput } from '../components/controls/GlassInput';
import { GlassProgress } from '../components/controls/GlassProgress';
import { GlassIcon } from '../components/controls/GlassIcon';
import { GlassTabBar } from '../components/navigation/GlassTabBar';
import { GlassSheet } from '../components/glass/GlassSheet';
import { GlassDialog } from '../components/glass/GlassDialog';
import { GlassToast } from '../components/glass/GlassToast';

import { useGlassStore } from '../hooks/useGlassStore';
import { useGlassPanResponder } from '../gestures/useGlassPanResponder';
import { glassTheme } from '../theme/glassTheme';
import { ToastMessage, GlassTabItem } from '../types/glass';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NAVIGATION_TABS: GlassTabItem[] = [
  { key: 'demo', label: 'Engine', icon: '✦' },
  { key: 'controls', label: 'Materials', icon: '⚙' },
  { key: 'presets', label: 'Cards', icon: '▦' },
  { key: 'about', label: 'Metrics', icon: '◉' },
];

export const LiquidDemoScreen: React.FC = () => {
  const {
    glassOpacity,
    blurIntensity,
    reflectionEnabled,
    springStrength,
    activeTab,
    setGlassOpacity,
    setBlurIntensity,
    setReflectionEnabled,
    setSpringStrength,
    setActiveTab,
    resetToDefaults,
  } = useGlassStore();

  // Dialog, Sheet & Toast States
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [testInput, setTestInput] = useState('');
  const [pressHoldCount, setPressHoldCount] = useState(0);

  // Background Ambient Light Fields drift
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;

  // Header status indicator pulsing
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Gentle pulse for live engine dot
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();

    // Slow ambient light field drift behind the glass
    const drift1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(orb1Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    );
    const drift2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, { toValue: 1, duration: 11000, useNativeDriver: true }),
        Animated.timing(orb2Anim, { toValue: 0, duration: 11000, useNativeDriver: true }),
      ])
    );
    drift1.start();
    drift2.start();

    return () => {
      pulse.stop();
      drift1.stop();
      drift2.stop();
    };
  }, []);

  // Draggable Card Pan Responder with Elastic Resistance & Spring Snapback
  const { pan, panResponder, isDragging } = useGlassPanResponder({
    boundaryLimitX: 160,
    boundaryLimitY: 100,
    onDragStart: () => {
      setToast({
        id: 'drag-start',
        title: 'Elastic Spring Active',
        description: 'Drag panel past boundaries to feel logarithmic resistance.',
        type: 'info',
        durationMs: 2500,
      });
    },
  });

  const orb1X = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 80],
  });
  const orb1Y = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 120],
  });

  const orb2X = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH - 80, SCREEN_WIDTH - 180],
  });
  const orb2Y = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 420],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050506" />

      {/* Cinematic Ambient Light Fields (Visible through translucent glass) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Animated.View
          style={[
            styles.ambientOrb,
            styles.ambientOrbSilver,
            {
              transform: [{ translateX: orb1X }, { translateY: orb1Y }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ambientOrb,
            styles.ambientOrbCyan,
            {
              transform: [{ translateX: orb2X }, { translateY: orb2Y }],
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Minimal Top Status Area & Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Text style={styles.headerTitle}>Liquid</Text>
            {/* Live Status Pulse */}
            <View style={styles.statusIndicator}>
              <Animated.View style={[styles.statusDot, { opacity: pulseAnim }]} />
              <Text style={styles.statusLabel}>REACTIVE 60FPS</Text>
            </View>
          </View>

          {/* Quick Settings Icon Button */}
          <GlassIcon
            name="⚙"
            size={18}
            color="#FAFAFA"
            onPress={() => setSheetOpen(true)}
          />
        </View>

        {/* Floating Glass Hero Panel */}
        <GlassSurface
          elevation="floating"
          radius={glassTheme.radii.xl}
          style={styles.heroPanel}
          showSpecularTop
        >
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>OBSIDIAN ENGINE</Text>
            </View>
            <Text style={styles.heroVersionText}>v2.4 Native</Text>
          </View>

          <Text style={styles.heroHeadline}>Optical Refraction & Spring Dynamics</Text>
          <Text style={styles.heroSubhead}>
            Translucent smoked glass with specular highlights, physical drag resistance, and real-time parameter tuning.
          </Text>

          {/* Live Progress Bar with Specular Shimmer */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Material Density</Text>
              <Text style={styles.progressValue}>{Math.round(glassOpacity * 100)}%</Text>
            </View>
            <GlassProgress progress={glassOpacity} showShimmer={reflectionEnabled} height={6} />
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.heroActionsRow}>
            <GlassButton
              title="Open Sheet"
              icon="↓"
              variant="primary"
              size="sm"
              onPress={() => setSheetOpen(true)}
              style={styles.heroBtn}
            />
            <GlassButton
              title="Trigger Dialog"
              icon="◈"
              variant="secondary"
              size="sm"
              onPress={() => setDialogOpen(true)}
              style={styles.heroBtn}
            />
          </View>
        </GlassSurface>

        {/* Section 1: Draggable Glass Card (Physics Demo) */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeaderTitle}>TACTILE GESTURE & SPRING PHYSICS</Text>
          <Text style={styles.sectionHint}>Drag below</Text>
        </View>

        <Animated.View
          style={[
            styles.dragContainer,
            {
              transform: pan.getTranslateTransform(),
            },
          ]}
          {...panResponder.panHandlers}
        >
          <GlassCard elevation="floating" style={styles.interactiveCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.cardTag}>INTERACTIVE CARD</Text>
                <Text style={styles.cardTitle}>Elastic Momentum Panel</Text>
              </View>
              <View style={styles.handIconWrap}>
                <Text style={styles.handIcon}>✥</Text>
              </View>
            </View>

            <Text style={styles.cardBody}>
              Grab and drag this card in any direction. Notice the smooth logarithmic resistance past the boundary, and instant spring-settling when released.
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.metricPill}>
                <Text style={styles.metricPillLabel}>Spring Stiffness:</Text>
                <Text style={styles.metricPillVal}>{(280 * springStrength).toFixed(0)}</Text>
              </View>
              <View style={styles.metricPill}>
                <Text style={styles.metricPillLabel}>Damping:</Text>
                <Text style={styles.metricPillVal}>{(24 * Math.sqrt(springStrength)).toFixed(1)}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Section 2: Real-Time Glass Controls */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeaderTitle}>REAL-TIME OPTICAL CONTROLS</Text>
          <Text style={styles.sectionHint}>Instant Render</Text>
        </View>

        <GlassSurface
          elevation="raised"
          radius={glassTheme.radii.lg}
          style={styles.controlsSurface}
        >
          {/* Glass Opacity Slider */}
          <GlassSlider
            label="Glass Opacity"
            value={glassOpacity}
            minimumValue={0.15}
            maximumValue={0.95}
            onValueChange={setGlassOpacity}
            valueFormatter={(v) => `${Math.round(v * 100)}%`}
          />

          <View style={styles.divider} />

          {/* Blur Intensity Slider */}
          <GlassSlider
            label="Backdrop Blur Intensity"
            value={blurIntensity}
            minimumValue={4}
            maximumValue={40}
            onValueChange={setBlurIntensity}
            valueFormatter={(v) => `${Math.round(v)}px`}
          />

          <View style={styles.divider} />

          {/* Spring Strength Slider */}
          <GlassSlider
            label="Physics Spring Multiplier"
            value={springStrength}
            minimumValue={0.5}
            maximumValue={2.0}
            onValueChange={setSpringStrength}
            valueFormatter={(v) => `${v.toFixed(2)}x`}
          />

          <View style={styles.divider} />

          {/* Reflection Toggle */}
          <GlassToggle
            label="Specular Sheen Reflection"
            value={reflectionEnabled}
            onValueChange={setReflectionEnabled}
          />
        </GlassSurface>

        {/* Section 3: Tactile Button & Press Micro-Interactions */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeaderTitle}>PRESS & HOLD MICRO-INTERACTIONS</Text>
        </View>

        <GlassSurface
          elevation="raised"
          radius={glassTheme.radii.lg}
          style={styles.buttonShowcaseSurface}
        >
          <Text style={styles.showcaseDesc}>
            Press and hold the button below. The button compresses with spring physics while its specular highlight shifts toward the touch center.
          </Text>

          <GlassButton
            title={`Press & Hold Me (${pressHoldCount})`}
            icon="✦"
            variant="primary"
            size="lg"
            onPress={() => {
              setPressHoldCount((c) => c + 1);
              setToast({
                id: 'tap-btn',
                title: 'Tactile Tap Registered',
                description: `Triggered ${pressHoldCount + 1} times with spring rebound.`,
                type: 'success',
              });
            }}
            onLongPress={() => {
              setPressHoldCount((c) => c + 5);
              setToast({
                id: 'long-press',
                title: 'Long Press Acknowledged',
                description: 'Spring compression held until release.',
                type: 'warning',
              });
            }}
          />

          <View style={{ height: 12 }} />

          <GlassInput
            label="Refractive Glass Input"
            placeholder="Type here to test focus glow..."
            value={testInput}
            onChangeText={setTestInput}
            icon="✎"
          />

          <View style={styles.resetRow}>
            <GlassButton
              title="Reset Scene to Default"
              variant="ghost"
              size="sm"
              onPress={() => {
                resetToDefaults();
                setToast({
                  id: 'reset',
                  title: 'Scene Reset',
                  description: 'All optical parameters restored to baseline.',
                  type: 'info',
                });
              }}
            />
          </View>
        </GlassSurface>

        {/* Row of Smaller Glass Tiles (Bento Grid) */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeaderTitle}>OBSIDIAN TILE MATRIX</Text>
        </View>

        <View style={styles.bentoRow}>
          <GlassCard interactive style={styles.bentoTile}>
            <Text style={styles.bentoTileIcon}>⚡</Text>
            <Text style={styles.bentoTileTitle}>60 FPS</Text>
            <Text style={styles.bentoTileSub}>Native Thread</Text>
          </GlassCard>

          <GlassCard interactive style={styles.bentoTile}>
            <Text style={styles.bentoTileIcon}>◈</Text>
            <Text style={styles.bentoTileTitle}>Low Overhead</Text>
            <Text style={styles.bentoTileSub}>Optimized GPU</Text>
          </GlassCard>

          <GlassCard interactive style={styles.bentoTile}>
            <Text style={styles.bentoTileIcon}>✦</Text>
            <Text style={styles.bentoTileTitle}>Optical</Text>
            <Text style={styles.bentoTileSub}>Dual Borders</Text>
          </GlassCard>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Bottom Glass Navigation Bar */}
      <GlassTabBar
        tabs={NAVIGATION_TABS}
        activeKey={activeTab}
        onTabPress={(key) => {
          setActiveTab(key);
          setToast({
            id: `tab-${key}`,
            title: `Navigated to ${key.toUpperCase()}`,
            description: 'Gliding glass pill transitioned with spring physics.',
            type: 'info',
            durationMs: 2000,
          });
        }}
        style={styles.tabBarPosition}
      />

      {/* Interactive Bottom Glass Sheet */}
      <GlassSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Liquid Glass Preferences"
      >
        <Text style={styles.sheetBodyText}>
          This bottom sheet supports smooth gesture dragging with elastic dismissal resistance. Pull down on the handle to dismiss.
        </Text>

        <GlassSlider
          label="Glass Opacity"
          value={glassOpacity}
          minimumValue={0.15}
          maximumValue={0.95}
          onValueChange={setGlassOpacity}
        />

        <GlassToggle
          label="Sheen Reflection"
          value={reflectionEnabled}
          onValueChange={setReflectionEnabled}
        />

        <View style={{ height: 16 }} />

        <GlassButton
          title="Done"
          variant="primary"
          size="md"
          onPress={() => setSheetOpen(false)}
        />
      </GlassSheet>

      {/* Modal Dialog */}
      <GlassDialog
        visible={dialogOpen}
        title="Obsidian Glass Dialog"
        message="This modal appears with spring physics and layered optical depth. Tap Confirm or Cancel to test dismissal transitions."
        onConfirm={() => {
          setDialogOpen(false);
          setToast({
            id: 'dialog-confirmed',
            title: 'Action Confirmed',
            type: 'success',
          });
        }}
        onCancel={() => setDialogOpen(false)}
      />

      {/* Transient Notification Toast */}
      <GlassToast toast={toast} onDismiss={() => setToast(null)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050506',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  ambientOrb: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.12,
  },
  ambientOrbSilver: {
    backgroundColor: '#FAFAFA',
    top: 50,
  },
  ambientOrbCyan: {
    backgroundColor: '#38BDF8',
    top: 250,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#FAFAFA',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusLabel: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroPanel: {
    padding: 22,
    marginBottom: 22,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  heroBadgeText: {
    color: '#FAFAFA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroVersionText: {
    color: '#71717A',
    fontSize: 12,
    fontWeight: '600',
  },
  heroHeadline: {
    color: '#FAFAFA',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 8,
    lineHeight: 28,
  },
  heroSubhead: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  progressSection: {
    marginBottom: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '600',
  },
  progressValue: {
    color: '#FAFAFA',
    fontSize: 11,
    fontWeight: '700',
  },
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroBtn: {
    flex: 1,
  },
  sectionHeaderWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionHint: {
    color: '#52525B',
    fontSize: 11,
  },
  dragContainer: {
    marginBottom: 16,
  },
  interactiveCard: {
    marginBottom: 0,
    backgroundColor: 'rgba(22, 22, 28, 0.70)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleWrap: {
    flex: 1,
  },
  cardTag: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  cardTitle: {
    color: '#FAFAFA',
    fontSize: 17,
    fontWeight: '700',
  },
  handIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handIcon: {
    color: '#FAFAFA',
    fontSize: 16,
  },
  cardBody: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  metricPill: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metricPillLabel: {
    color: '#71717A',
    fontSize: 10,
  },
  metricPillVal: {
    color: '#FAFAFA',
    fontSize: 10,
    fontWeight: '700',
  },
  controlsSurface: {
    padding: 18,
    marginBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  buttonShowcaseSurface: {
    padding: 18,
    marginBottom: 18,
  },
  showcaseDesc: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  resetRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  bentoTile: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    marginBottom: 0,
  },
  bentoTileIcon: {
    fontSize: 20,
    color: '#FAFAFA',
    marginBottom: 6,
  },
  bentoTileTitle: {
    color: '#FAFAFA',
    fontSize: 12,
    fontWeight: '700',
  },
  bentoTileSub: {
    color: '#71717A',
    fontSize: 10,
    marginTop: 2,
  },
  tabBarPosition: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheetBodyText: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
});
