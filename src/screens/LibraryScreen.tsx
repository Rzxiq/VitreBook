import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useLibraryStore } from '../store/useLibraryStore';
import { DownloadedBook } from '../types/book';
import { DownloadManager } from '../services/downloadManager';

const SAMPLE_PDF_URL =
  'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { books, addBook } = useLibraryStore();
  const bookList = Object.values(books).sort((a, b) => b.downloadedAt - a.downloadedAt);

  const [loadingSample, setLoadingSample] = useState(false);

  const handleOpenBook = (book: DownloadedBook) => {
    navigation.navigate('PdfReader', {
      md5: book.md5,
      filePath: book.localFilePath,
      title: book.title,
    });
  };

  const handleLoadSampleBook = async () => {
    setLoadingSample(true);
    try {
      const { dirs } = ReactNativeBlobUtil.fs;
      const targetPath = `${dirs.DocumentDir}/VitreBook_Starter_Guide.pdf`;

      // Download verified sample PDF
      const res = await ReactNativeBlobUtil.config({
        path: targetPath,
        fileCache: true,
      }).fetch('GET', SAMPLE_PDF_URL);

      const filePath = res.path();
      const stat = await ReactNativeBlobUtil.fs.stat(filePath);
      const cleanUri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;

      const sampleBook: DownloadedBook = {
        id: 'sample-book-001',
        md5: '7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
        title: 'VitreBook Starter Guide (Sample PDF)',
        author: 'VitreBook Project',
        localFilePath: cleanUri,
        fileSize: Number(stat.size) || 13264,
        extension: 'pdf',
        downloadedAt: Date.now(),
        totalPages: 1,
        lastReadPage: 1,
        source: 'Curated',
      };

      addBook(sampleBook);
      setLoadingSample(false);

      // Open immediately in reader
      handleOpenBook(sampleBook);
    } catch (err: any) {
      setLoadingSample(false);
      Alert.alert(
        'Sample Download Failed',
        'Could not load sample PDF. Please check your internet connection.'
      );
    }
  };

  const handleDeleteBook = (book: DownloadedBook) => {
    Alert.alert(
      'Delete Book',
      `Remove "${book.title}" from local device storage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => DownloadManager.deleteBook(book),
        },
      ]
    );
  };

  const renderBookItem = ({ item }: { item: DownloadedBook }) => {
    const progressPercent =
      item.totalPages > 0
        ? Math.min(100, Math.round((item.lastReadPage / item.totalPages) * 100))
        : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => handleOpenBook(item)}
        onLongPress={() => handleDeleteBook(item)}
      >
        <View style={styles.coverWrapper}>
          {item.coverUrl ? (
            <Image source={{ uri: item.coverUrl }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderCover}>
              <Text style={styles.placeholderIcon}>📖</Text>
            </View>
          )}

          {/* Reading progress indicator */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.author}
        </Text>

        <View style={styles.progressRow}>
          <Text style={styles.pageText}>
            Page {item.lastReadPage}
            {item.totalPages ? ` / ${item.totalPages}` : ''}
          </Text>
          <Text style={styles.percentText}>{progressPercent}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.countBadge}>{bookList.length} downloaded for offline reading</Text>
        </View>

        {/* 21st.dev Test Reader Pill */}
        <TouchableOpacity
          style={styles.sampleHeaderBtn}
          onPress={handleLoadSampleBook}
          disabled={loadingSample}
        >
          {loadingSample ? (
            <ActivityIndicator size="small" color="#FAFAFA" />
          ) : (
            <Text style={styles.sampleHeaderBtnText}>⚡ Test Reader</Text>
          )}
        </TouchableOpacity>
      </View>

      {bookList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
          </View>
          <Text style={styles.emptyTitle}>Your Library is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Download books from the Explore tab for offline reading, or test the built-in reader instantly with a verified sample.
          </Text>

          <TouchableOpacity
            style={styles.sampleActionBtn}
            onPress={handleLoadSampleBook}
            disabled={loadingSample}
          >
            {loadingSample ? (
              <ActivityIndicator color="#09090B" />
            ) : (
              <Text style={styles.sampleActionText}>⚡ Load Sample Book (Test Reader)</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('SearchTab')}
          >
            <Text style={styles.exploreBtnText}>🔍 Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookList}
          keyExtractor={(item) => item.md5}
          numColumns={2}
          renderItem={renderBookItem}
          contentContainerStyle={styles.gridContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  headerTitle: {
    color: '#FAFAFA',
    fontSize: 22,
    fontWeight: '800',
  },
  countBadge: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 2,
  },
  sampleHeaderBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sampleHeaderBtnText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
  },
  gridContent: {
    padding: 12,
  },
  card: {
    flex: 0.5,
    backgroundColor: '#121215',
    borderRadius: 16,
    margin: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  coverWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#18181B',
    position: 'relative',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#27272A',
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
    fontSize: 36,
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  title: {
    color: '#FAFAFA',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 2,
  },
  author: {
    color: '#A1A1AA',
    fontSize: 11,
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageText: {
    color: '#71717A',
    fontSize: 10,
  },
  percentText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#121215',
    borderWidth: 1,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#71717A',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  sampleActionBtn: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  sampleActionText: {
    color: '#09090B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  exploreBtn: {
    backgroundColor: '#121215',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  exploreBtnText: {
    color: '#A1A1AA',
    fontWeight: '600',
    fontSize: 13,
  },
});
