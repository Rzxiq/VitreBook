import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { checkForAppUpdates, AppRelease } from '../services/updateService';
import { useSettingsStore } from '../store/useSettingsStore';

export const UpdateBanner: React.FC = () => {
  const { autoCheckUpdates } = useSettingsStore();
  const [release, setRelease] = useState<AppRelease | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!autoCheckUpdates) return;
    checkForAppUpdates().then((res) => {
      if (res.hasUpdate) {
        setRelease(res);
      }
    });
  }, [autoCheckUpdates]);

  if (!release || !release.hasUpdate || dismissed) {
    return null;
  }

  const handleDownload = () => {
    if (release.apkDownloadUrl) {
      Linking.openURL(release.apkDownloadUrl);
    }
  };

  return (
    <View style={styles.banner}>
      <View style={styles.textContainer}>
        <View style={styles.badgeRow}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>NEW RELEASE AVAILABLE</Text>
        </View>
        <Text style={styles.title}>Version {release.version}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {release.releaseNotes}
        </Text>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.dismissBtn} onPress={() => setDismissed(true)}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.updateBtn} onPress={handleDownload}>
          <Text style={styles.updateText}>Install APK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#121215',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#38BDF855',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  badgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dismissBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dismissText: {
    color: '#71717A',
    fontSize: 12,
  },
  updateBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  updateText: {
    color: '#09090B',
    fontSize: 12,
    fontWeight: '700',
  },
});
