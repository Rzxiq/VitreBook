import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { checkForAppUpdates } from '../services/updateService';
import { MirrorSelectorModal } from '../components/MirrorSelectorModal';
import packageJson from '../../package.json';

export const SettingsScreen: React.FC = () => {
  const {
    defaultNightMode,
    setDefaultNightMode,
    autoCheckUpdates,
    setAutoCheckUpdates,
    getActiveMirror,
  } = useSettingsStore();

  const { clearLibrary, books } = useLibraryStore();
  const activeMirror = getActiveMirror();

  const [showMirrorModal, setShowMirrorModal] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    try {
      const release = await checkForAppUpdates();
      if (release.hasUpdate) {
        Alert.alert(
          'Update Found!',
          `Version ${release.version} is now available on GitHub.\n\nNotes: ${release.releaseNotes}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Up to Date', `You are running the latest version (v${packageJson.version}).`);
      }
    } catch {
      Alert.alert('Error', 'Unable to check GitHub Releases API.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Local Library',
      'This will reset your library state and bookmark history. Stored PDFs will be unregistered.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearLibrary();
            Alert.alert('Cleared', 'Local library records have been reset.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Settings</Text>

        {/* Catalog Mirrors Section */}
        <Text style={styles.sectionHeader}>CATALOG & MIRRORS</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowMirrorModal(true)}
          >
            <View>
              <Text style={styles.rowTitle}>Active Mirror</Text>
              <Text style={styles.rowSubtitle}>{activeMirror.name} ({activeMirror.baseUrl})</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Reader Preferences */}
        <Text style={styles.sectionHeader}>READER PREFERENCES</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Default Night Mode</Text>
              <Text style={styles.rowSubtitle}>Invert colors for night reading</Text>
            </View>
            <Switch
              value={defaultNightMode}
              onValueChange={setDefaultNightMode}
              thumbColor={defaultNightMode ? '#E50914' : '#666'}
              trackColor={{ false: '#333', true: '#77181C' }}
            />
          </View>
        </View>

        {/* App Updates Section */}
        <Text style={styles.sectionHeader}>UPDATES & SYSTEM</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowTitle}>Auto Check Updates</Text>
              <Text style={styles.rowSubtitle}>Check GitHub Releases on launch</Text>
            </View>
            <Switch
              value={autoCheckUpdates}
              onValueChange={setAutoCheckUpdates}
              thumbColor={autoCheckUpdates ? '#E50914' : '#666'}
              trackColor={{ false: '#333', true: '#77181C' }}
            />
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleCheckUpdate}
            disabled={checkingUpdate}
          >
            <Text style={styles.actionText}>Check for Updates</Text>
            {checkingUpdate ? (
              <ActivityIndicator size="small" color="#E50914" />
            ) : (
              <Text style={styles.versionTag}>v{packageJson.version}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Storage Management */}
        <Text style={styles.sectionHeader}>STORAGE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
            <Text style={[styles.actionText, { color: '#FF5252' }]}>
              Clear Library Cache ({Object.keys(books).length} books)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutContainer}>
          <Text style={styles.aboutTitle}>VitreBook</Text>
          <Text style={styles.aboutVersion}>Open-Source Sideloaded E-Book Reader</Text>
          <Text style={styles.aboutSub}>Zero-Backend Client-Side Parsing Engine</Text>
        </View>
      </ScrollView>

      <MirrorSelectorModal
        visible={showMirrorModal}
        onClose={() => setShowMirrorModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    padding: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowTitle: {
    color: '#F0F0F0',
    fontSize: 15,
    fontWeight: '500',
  },
  rowSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  versionTag: {
    color: '#888',
    fontSize: 13,
  },
  aboutContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  aboutTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aboutVersion: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  aboutSub: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
});
