import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { ScrapedBook } from '../types/book';

interface BookCardProps {
  book: ScrapedBook;
  onPress: (book: ScrapedBook) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
  const getSourceBadgeStyle = (source?: string) => {
    switch (source) {
      case 'Gutenberg':
        return styles.sourceGutenberg;
      case 'Open Library':
        return styles.sourceOpenLibrary;
      case 'Libgen':
        return styles.sourceLibgen;
      default:
        return styles.sourceDefault;
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress(book)}
    >
      <View style={styles.coverContainer}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderText}>📖</Text>
          </View>
        )}
        <View style={styles.formatBadge}>
          <Text style={styles.formatBadgeText}>{book.extension.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        {book.source ? (
          <View style={[styles.sourceBadge, getSourceBadgeStyle(book.source)]}>
            <Text style={styles.sourceBadgeText}>{book.source.toUpperCase()}</Text>
          </View>
        ) : null}

        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author || 'Unknown Author'}
        </Text>

        <View style={styles.metadataRow}>
          {book.year ? <Text style={styles.metaTag}>{book.year}</Text> : null}
          {book.size ? <Text style={styles.metaTag}>{book.size}</Text> : null}
          {book.pages && book.pages !== 'N/A' ? (
            <Text style={styles.metaTag}>{book.pages}p</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#121215',
    borderRadius: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  coverContainer: {
    position: 'relative',
    width: 78,
    height: 112,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#18181B',
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
    backgroundColor: '#18181B',
  },
  placeholderText: {
    fontSize: 28,
  },
  formatBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(229, 9, 20, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formatBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sourceGutenberg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sourceOpenLibrary: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  sourceLibgen: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  sourceDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  title: {
    color: '#FAFAFA',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  author: {
    color: '#A1A1AA',
    fontSize: 13,
    marginTop: 2,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  metaTag: {
    backgroundColor: '#18181B',
    color: '#71717A',
    fontSize: 11,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27272A',
  },
});
