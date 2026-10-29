import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { DownloadProgress } from '../types/book';
import { formatBytes, formatSpeed } from '../utils/fileHelpers';

interface DownloadProgressModalProps {
  visible: boolean;
  bookTitle: string;
  progress: DownloadProgress | null;
  onCancel: () => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  visible,
  bookTitle,
  progress,
  onCancel,
}) => {
  const percentage = Math.min(100, Math.max(0, progress?.percentage || 0));
  const written = formatBytes(progress?.bytesWritten || 0);
  const total = formatBytes(progress?.contentLength || 0);
  const speed = formatSpeed(progress?.speedBytesPerSec || 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.badgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.badgeText}>DOWNLOADING</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {bookTitle}
          </Text>

          {/* Progress Bar Track */}
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percentage}%` }]} />
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.percentText}>{percentage}%</Text>
            <Text style={styles.sizeText}>
              {written} <Text style={styles.slash}>/</Text> {total}
            </Text>
          </View>

          <View style={styles.speedRow}>
            <Text style={styles.speedLabel}>Transfer Rate:</Text>
            <Text style={styles.speedVal}>{speed}</Text>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#121215',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  badgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FAFAFA',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 18,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  track: {
    height: 6,
    backgroundColor: '#1E1E24',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  percentText: {
    color: '#FAFAFA',
    fontSize: 14,
    fontWeight: '700',
  },
  sizeText: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  slash: {
    color: '#52525B',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  speedLabel: {
    color: '#71717A',
    fontSize: 12,
  },
  speedVal: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#18181B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  cancelText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
});
