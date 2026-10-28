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
  const percentage = progress?.percentage || 0;
  const written = formatBytes(progress?.bytesWritten || 0);
  const total = formatBytes(progress?.contentLength || 0);
  const speed = formatSpeed(progress?.speedBytesPerSec || 0);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.header}>Downloading Book</Text>
          <Text style={styles.title} numberOfLines={2}>
            {bookTitle}
          </Text>

          {/* Progress Bar Container */}
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percentage}%` }]} />
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>{percentage}%</Text>
            <Text style={styles.statsText}>
              {written} / {total}
            </Text>
          </View>

          <Text style={styles.speedText}>Speed: {speed}</Text>

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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  header: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  track: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  fill: {
    height: '100%',
    backgroundColor: '#E50914',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statsText: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  speedText: {
    color: '#707070',
    fontSize: 12,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '600',
  },
});
