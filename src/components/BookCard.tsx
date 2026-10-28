import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { ScrapedBook } from '../types/book';

interface BookCardProps {
  book: ScrapedBook;
  onPress: (book: ScrapedBook) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
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
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{book.extension.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.author || 'Unknown Author'}
        </Text>

        <View style={styles.metadataRow}>
          {book.year ? <Text style={styles.metaTag}>{book.year}</Text> : null}
          {book.size ? <Text style={styles.metaTag}>{book.size}</Text> : null}
          {book.language ? <Text style={styles.metaTag}>{book.language}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  coverContainer: {
    position: 'relative',
    width: 75,
    height: 105,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#262626',
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
  placeholderText: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#E50914',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  title: {
    color: '#F0F0F0',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  author: {
    color: '#A0A0A0',
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
    backgroundColor: '#2A2A2A',
    color: '#B0B0B0',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
