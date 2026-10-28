import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLibraryStore } from '../store/useLibraryStore';
import { DownloadedBook } from '../types/book';
import { DownloadManager } from '../services/downloadManager';
import { formatBytes } from '../utils/fileHelpers';

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { books } = useLibraryStore();
  const bookList = Object.values(books).sort((a, b) => b.downloadedAt - a.downloadedAt);

  const handleOpenBook = (book: DownloadedBook) => {
    navigation.navigate('PdfReader', {
      md5: book.md5,
      filePath: book.localFilePath,
      title: book.title,
    });
  };

  const handleDeleteBook = (book: DownloadedBook) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}" from local storage?`,
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
        activeOpacity={0.7}
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

          {/* Reading progress bar */}
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
        <Text style={styles.headerTitle}>My Library</Text>
        <Text style={styles.countBadge}>{bookList.length} downloaded</Text>
      </View>

      {bookList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>Your library is empty</Text>
          <Text style={styles.emptySubtitle}>
            Downloaded books will appear here for offline reading.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('SearchTab')}
          >
            <Text style={styles.exploreBtnText}>Explore Books</Text>
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
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  countBadge: {
    color: '#888',
    fontSize: 13,
  },
  gridContent: {
    padding: 12,
  },
  card: {
    flex: 0.5,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    margin: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  coverWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#262626',
    position: 'relative',
    marginBottom: 8,
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
    fontSize: 40,
  },
  progressBarBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00E676',
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  author: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageText: {
    color: '#AAA',
    fontSize: 11,
  },
  percentText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
