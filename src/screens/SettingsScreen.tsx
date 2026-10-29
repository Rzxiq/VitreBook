import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { checkForAppUpdates } from '../services/updateService';
import packageJson from '../../package.json';

export const SettingsScreen: React.FC = () => {
  const {
    defaultNightMode,
    setDefaultNightMode,
    autoCheckUpdates,
    setAutoCheckUpdates,
  } = useSettingsStore();

  const { clearLibrary, books } = useLibraryStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const release = await checkForAppUpdates();
      if (release.hasUpdate) {
        Alert.alert(
          'Update Available',
          `Version ${release.version} is available on GitHub.\n\n${release.releaseNotes}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Download APK',
              onPress: () => {
                if (release.apkDownloadUrl) {
                  Linking.openURL(release.apkDownloadUrl);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Up to Date', `You are running the latest version (v${packageJson.version}).`);
      }
    } catch {
      Alert.alert('Network Error', 'Unable to reach GitHub Releases API.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Local Library',
      'This will reset your library state and bookmark history. Downloaded files can be re-indexed or removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearLibrary();
            Alert.alert('Reset', 'Library records and reading history cleared.');
          },
        },
      ]
    );
  };

  const bookCount = Object.keys(books).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>App configuration & storage</Text>
        </View>

        {/* Multi-Source Engine Status */}
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeader}>MULTI-SOURCE INDEXING ENGINE</Text>
          <View style={styles.badgeLive}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AUTO-AGGREGATING</Text>
          </View>
        </View>

        <View style={styles.bentoCard}>
          <View style={styles.engineRow}>
            <View style={styles.engineIconWrap}>
              <Text style={styles.engineIcon}>🏛️</Text>
            </View>
            <View style={styles.engineMeta}>
              <Text style={styles.engineName}>Open Library</Text>
              <Text style={styles.engineDesc}>Millions of editions, high-res covers & archive records</Text>
            </View>
            <View style={[styles.sourceBadge, styles.sourceBadgeSky]}>
              <Text style={styles.sourceBadgeSkyText}>Online</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.engineRow}>
            <View style={styles.engineIconWrap}>
              <Text style={styles.engineIcon}>📖</Text>
            </View>
            <View style={styles.engineMeta}>
              <Text style={styles.engineName}>Project Gutenberg</Text>
              <Text style={styles.engineDesc}>70,000+ public-domain classics, direct verified PDF links</Text>
            </View>
            <View style={[styles.sourceBadge, styles.sourceBadgeEmerald]}>
              <Text style={styles.sourceBadgeEmeraldText}>Online</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.engineRow}>
            <View style={styles.engineIconWrap}>
              <Text style={styles.engineIcon}>🌐</Text>
            </View>
            <View style={styles.engineMeta}>
              <Text style={styles.engineName}>Decentralized Mirrors</Text>
              <Text style={styles.engineDesc}>Automatic fallback across mirror clusters</Text>
            </View>
            <View style={[styles.sourceBadge, styles.sourceBadgePurple]}>
              <Text style={styles.sourceBadgePurpleText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Reader Preferences */}
        <Text style={styles.sectionHeader}>READER PREFERENCES</Text>
        <View style={styles.bentoCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Default Night Mode</Text>
              <Text style={styles.settingSubtitle}>Invert colors to black background on reader launch</Text>
            </View>
            <Switch
              value={defaultNightMode}
              onValueChange={setDefaultNightMode}
              thumbColor={defaultNightMode ? '#E50914' : '#71717A'}
              trackColor={{ false: '#27272A', true: '#77181C' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>PDF Render Engine</Text>
              <Text style={styles.settingSubtitle}>Native Android Pdfium with fast memory cache</Text>
            </View>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>v6.7.5</Text>
            </View>
          </View>
        </View>

        {/* App Updates & Storage */}
        <Text style={styles.sectionHeader}>UPDATES & STORAGE</Text>
        <View style={styles.bentoCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingTitle}>Auto Check Updates</Text>
              <Text style={styles.settingSubtitle}>Check GitHub Releases when the app launches</Text>
            </View>
            <Switch
              value={autoCheckUpdates}
              onValueChange={setAutoCheckUpdates}
              thumbColor={autoCheckUpdates ? '#E50914' : '#71717A'}
              trackColor={{ false: '#27272A', true: '#77181C' }}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleCheckUpdate}
            disabled={checkingUpdate}
          >
            <View style={styles.settingTextWrap}>
              <Text style={styles.actionTitle}>Check for Updates</Text>
              <Text style={styles.settingSubtitle}>GitHub: Rzxiq/VitreBook</Text>
            </View>
            {checkingUpdate ? (
              <ActivityIndicator size="small" color="#E50914" />
            ) : (
              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>v{packageJson.version}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.dangerTitle}>Clear Library Cache</Text>
              <Text style={styles.settingSubtitle}>{bookCount} registered items in memory</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 21st.dev Style About Bento Card */}
        <View style={styles.aboutCard}>
          <Image source={require('../assets/logo.jpg')} style={styles.aboutLogo} />
          <Text style={styles.aboutTitle}>VitreBook</Text>
          <Text style={styles.aboutTagline}>Sideloaded Open-Source E-Book Reader</Text>

          <View style={styles.aboutChips}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Zero Backend</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Client-Side DOM</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>arm64-v8a</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.githubLink}
            onPress={() => Linking.openURL('https://github.com/Rzxiq/VitreBook')}
          >
            <Text style={styles.githubLinkText}>github.com/Rzxiq/VitreBook ↗</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  headerTitle: {
    color: '#FAFAFA',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#71717A',
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeaderWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 12,
  },
  sectionHeader: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
    marginLeft: 2,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B33',
    borderColor: '#064E3B',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  bentoCard: {
    backgroundColor: '#121215',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
    marginBottom: 8,
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  engineIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  engineIcon: {
    fontSize: 18,
  },
  engineMeta: {
    flex: 1,
  },
  engineName: {
    color: '#FAFAFA',
    fontSize: 14,
    fontWeight: '600',
  },
  engineDesc: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  sourceBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  sourceBadgeSky: {
    backgroundColor: '#0C4A6E33',
    borderColor: '#0284C7',
  },
  sourceBadgeSkyText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  sourceBadgeEmerald: {
    backgroundColor: '#064E3B33',
    borderColor: '#059669',
  },
  sourceBadgeEmeraldText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  sourceBadgePurple: {
    backgroundColor: '#3B076433',
    borderColor: '#7C3AED',
  },
  sourceBadgePurpleText: {
    color: '#A855F7',
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E1E24',
    marginHorizontal: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    color: '#FAFAFA',
    fontSize: 14,
    fontWeight: '500',
  },
  settingSubtitle: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionTitle: {
    color: '#FAFAFA',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
  },
  infoPill: {
    backgroundColor: '#18181B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  infoPillText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '600',
  },
  versionBadge: {
    backgroundColor: '#18181B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  versionBadgeText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    color: '#71717A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  aboutCard: {
    backgroundColor: '#121215',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  aboutLogo: {
    width: 68,
    height: 68,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  aboutTitle: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  aboutTagline: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 4,
  },
  aboutChips: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '600',
  },
  githubLink: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  githubLinkText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
});
