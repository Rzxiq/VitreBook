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
import { DownloadManager } from '../services/downloadManager';
import { DownloadProgressModal } from '../components/DownloadProgressModal';

export const BookDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { book } = (route.params as { book: ScrapedBook }) || {};

  const { getBookByMd5 } = useLibraryStore();
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
      // Direct stream download with verification and auto-fallback
      const directUrl =
        book.directDownloadUrl ||
        'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';

      const savedBook = await DownloadManager.startDownload(
        book,
        directUrl,
        (p) => setProgress(p)
      );

      setDownloading(false);
      Alert.alert('Download Complete', 'The book is now ready in your offline library.', [
        {
          text: 'Read Now',
          onPress: () =>
            navigation.navigate('PdfReader', {
              md5: savedBook.md5,
              filePath: savedBook.localFilePath,
              title: savedBook.title,
            }),
        },
        { text: 'Done' },
      ]);
    } catch (err: any) {
      setDownloading(false);
      Alert.alert(
        'Download Error',
        err.message || 'Could not complete file download. Please check your internet connection.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover Art Hero */}
        <View style={styles.coverWrapper}>
          {book.coverUrl ? (
            <Image source={{ uri: book.coverUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderCover}>
              <Text style={styles.placeholderIcon}>📚</Text>
            </View>
          )}

          {book.source ? (
            <View style={styles.sourceTag}>
              <Text style={styles.sourceTagText}>{book.source.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>

        {/* Title & Author */}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author || 'Unknown Author'}</Text>

        {/* Synopsis / Description if available */}
        {book.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descHeading}>About this Work</Text>
            <Text style={styles.descText}>{book.description}</Text>
          </View>
        ) : null}

        {/* 21st.dev Bento Metadata Card */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Source Engine</Text>
            <Text style={[styles.metaValue, styles.emeraldText]}>{book.source || 'Open Access'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Format</Text>
            <Text style={styles.metaValue}>{book.extension.toUpperCase()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>File Size</Text>
            <Text style={styles.metaValue}>{book.size || '1.8 MB'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Publish Year</Text>
            <Text style={styles.metaValue}>{book.year || 'Public Domain'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Language</Text>
            <Text style={styles.metaValue}>{book.language || 'English'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Publisher</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {book.publisher || 'Public Domain'}
            </Text>
          </View>
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={[styles.primaryBtn, downloadedBook && styles.readNowBtn]}
          onPress={handleDownloadOrRead}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryBtnText, downloadedBook && styles.readNowBtnText]}>
            {downloadedBook ? '📖 Read Offline Now' : '⬇ Download Book to Library'}
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
    backgroundColor: '#09090B',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  coverWrapper: {
    width: 165,
    height: 235,
    borderRadius: 16,
    backgroundColor: '#121215',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272A',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
    position: 'relative',
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
  sourceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(9, 9, 11, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  sourceTagText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: 'bold',
  },
  title: {
    color: '#FAFAFA',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 26,
  },
  author: {
    color: '#A1A1AA',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  descCard: {
    width: '100%',
    backgroundColor: '#121215',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 16,
  },
  descHeading: {
    color: '#FAFAFA',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  descText: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
  },
  metaContainer: {
    width: '100%',
    backgroundColor: '#121215',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#18181B',
  },
  metaLabel: {
    color: '#71717A',
    fontSize: 13,
    fontWeight: '500',
  },
  metaValue: {
    color: '#FAFAFA',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  emeraldText: {
    color: '#10B981',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#E50914',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FAFAFA',
    fontSize: 15,
    fontWeight: 'bold',
  },
  readNowBtn: {
    backgroundColor: '#FAFAFA',
  },
  readNowBtnText: {
    color: '#09090B',
  },
});
