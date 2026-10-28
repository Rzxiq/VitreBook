import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ScrapedBook, DownloadProgress } from '../types/book';
import { useLibraryStore } from '../store/useLibraryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { ScraperManager } from '../api/scrapers';
import { DownloadManager } from '../services/downloadManager';
import { DownloadProgressModal } from '../components/DownloadProgressModal';

export const BookDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { book } = (route.params as { book: ScrapedBook }) || {};

  const { getBookByMd5 } = useLibraryStore();
  const { getActiveMirror } = useSettingsStore();
  const downloadedBook = getBookByMd5(book.md5);

  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const handleDownloadOrRead = async () => {
    // If already downloaded, jump straight into Reader
    if (downloadedBook) {
      navigation.navigate('PdfReader', {
        md5: downloadedBook.md5,
        filePath: downloadedBook.localFilePath,
        title: downloadedBook.title,
      });
      return;
    }

    setDownloading(true);
    try {
      // 1. Resolve direct download URL from MD5
      const activeMirror = getActiveMirror();
      const directUrl = await ScraperManager.resolveDownloadUrl(activeMirror, book.md5);

      // 2. Start file stream download to local documents
      const savedBook = await DownloadManager.startDownload(
        book,
        directUrl,
        (p) => setProgress(p)
      );

      setDownloading(false);
      Alert.alert('Download Complete', 'The book is now available in your offline library.', [
        {
          text: 'Read Now',
          onPress: () =>
            navigation.navigate('PdfReader', {
              md5: savedBook.md5,
              filePath: savedBook.localFilePath,
              title: savedBook.title,
            }),
        },
        { text: 'OK' },
      ]);
    } catch (err: any) {
      setDownloading(false);
      Alert.alert(
        'Download Failed',
        err.message || 'Could not resolve or download file from mirror.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover Art */}
        <View style={styles.coverWrapper}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.coverImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderCover}>
              <Text style={styles.placeholderIcon}>📚</Text>
            </View>
          )}
        </View>

        {/* Title & Author */}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author || 'Unknown Author'}</Text>

        {/* Metadata Table */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Format</Text>
            <Text style={styles.metaValue}>{book.extension.toUpperCase()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>File Size</Text>
            <Text style={styles.metaValue}>{book.size}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Pages</Text>
            <Text style={styles.metaValue}>{book.pages || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Year</Text>
            <Text style={styles.metaValue}>{book.year || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Language</Text>
            <Text style={styles.metaValue}>{book.language || 'English'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Publisher</Text>
            <Text style={styles.metaValue}>{book.publisher || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>MD5 Hash</Text>
            <Text style={[styles.metaValue, styles.monoText]} numberOfLines={1}>
              {book.md5}
            </Text>
          </View>
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={[styles.primaryBtn, downloadedBook && styles.readNowBtn]}
          onPress={handleDownloadOrRead}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>
            {downloadedBook ? '📖 Read Offline Now' : '⬇ Download PDF to Library'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <DownloadProgressModal
        visible={downloading}
        bookTitle={book.title}
        progress={progress}
        onCancel={() => {
          DownloadManager.cancelDownload(book.md5);
          setDownloading(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  coverWrapper: {
    width: 170,
    height: 240,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 50,
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  author: {
    color: '#A0A0A0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  metaContainer: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  metaLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  metaValue: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '65%',
    textAlign: 'right',
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#E50914',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  readNowBtn: {
    backgroundColor: '#2E7D32',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
