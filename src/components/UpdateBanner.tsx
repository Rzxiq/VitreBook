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
        <Text style={styles.title}>Update Available (v{release.version})</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {release.releaseNotes}
        </Text>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.dismissBtn} onPress={() => setDismissed(true)}>
          <Text style={styles.dismissText}>Later</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.updateBtn} onPress={handleDownload}>
          <Text style={styles.updateText}>Update APK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1E293B',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#38BDF8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  dismissText: {
    color: '#64748B',
    fontSize: 12,
  },
  updateBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  updateText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
