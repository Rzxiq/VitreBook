import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { GlassTabBarProps } from '../../types/glass';
import { glassTheme } from '../../theme/glassTheme';
import { createGlassSpring } from '../../animations/springPhysics';
import { useGlassStore } from '../../hooks/useGlassStore';

export const GlassTabBar: React.FC<GlassTabBarProps> = ({
  tabs,
  activeKey,
  onTabPress,
  style,
}) => {
  const springStrength = useGlassStore((s) => s.springStrength);
  const [containerWidth, setContainerWidth] = useState(0);

  // Animated sliding pill position and scale
  const indicatorLeft = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const pillScale = useRef(new Animated.Value(1)).current;

  // Track layout of each tab
  const tabLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});

  const handleTabLayout = (key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts.current[key] = { x, width };

    if (key === activeKey) {
      indicatorLeft.setValue(x);
      indicatorWidth.setValue(width);
    }
  };

  useEffect(() => {
    const layout = tabLayouts.current[activeKey];
    if (layout) {
      // Spring squeeze & glide effect
      createGlassSpring(pillScale, 0.94, 'primary', springStrength, true).start(() => {
        createGlassSpring(pillScale, 1.0, 'primary', springStrength, true).start();
      });

      createGlassSpring(indicatorLeft, layout.x, 'primary', springStrength, false).start();
      createGlassSpring(indicatorWidth, layout.width, 'primary', springStrength, false).start();
    }
  }, [activeKey, springStrength]);

  return (
    <View
      style={[styles.floatingContainer, style]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Liquid Obsidian Glass Bar Surface */}
      <View style={styles.glassBar}>
        {/* Fine Specular Top Rim */}
        <View style={styles.topRim} />

        {/* Gliding Active Glass Pill Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              left: indicatorLeft,
              width: indicatorWidth,
              transform: [{ scale: pillScale }],
            },
          ]}
        >
          {/* Specular highlight on active pill */}
          <View style={styles.pillHighlight} />
        </Animated.View>

        {/* Tab Items */}
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeKey;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onLayout={(e) => handleTabLayout(tab.key, e)}
                onPress={() => onTabPress(tab.key)}
                style={styles.tabButton}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                  {tab.icon}
                </Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {tab.badge !== undefined && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  glassBar: {
    width: '100%',
    maxWidth: 440,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 16, 22, 0.75)',
    borderWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.22)',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderLeftColor: 'rgba(255, 255, 255, 0.12)',
    borderRightColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  topRim: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: 26,
    backgroundColor: 'rgba(40, 40, 52, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  pillHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  tabsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.55,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#FAFAFA',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: '25%',
    backgroundColor: '#E50914',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
