import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchAllSources, FEATURED_CLASSICS } from '../api/unifiedSearch';
import { ScrapedBook } from '../types/book';
import { BookCard } from '../components/BookCard';
import { UpdateBanner } from '../components/UpdateBanner';

const CATEGORIES = [
  'All',
  'Classics',
  'Fiction',
  'Sci-Fi',
  'Philosophy',
  'Mystery',
  'Technology',
];

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [results, setResults] = useState<ScrapedBook[]>(FEATURED_CLASSICS);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    if (!q.trim() && activeCategory === 'All') {
      setResults(FEATURED_CLASSICS);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await searchAllSources(q.trim());
      setResults(data);
      if (data.length === 0) {
        setErrorMsg('No books found. Try searching another title, author, or keyword.');
      }
    } catch (err: any) {
      console.warn('Unified search error:', err);
      // Fallback to featured classics if all network calls fail
      setResults(FEATURED_CLASSICS);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      setQuery('');
      setResults(FEATURED_CLASSICS);
    } else {
      setQuery(category);
      handleSearch(category);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <UpdateBanner />

      {/* 21st.dev-Inspired Minimalist Hero Header */}
      <View style={styles.header}>
        <View style={styles.brandingRow}>
          <Image source={require('../assets/logo.jpg')} style={styles.appLogo} />
          <View>
            <Text style={styles.appTitle}>VitreBook</Text>
            <Text style={styles.appSubtitle}>Open-Access E-Book Indexer</Text>
          </View>
        </View>

        {/* Live Multi-Source Badge */}
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusPillText}>Multi-Source Active</Text>
        </View>
      </View>

      {/* 21st.dev Glass Search Input */}
      <View style={styles.searchBoxContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search millions of books, authors, classics..."
          placeholderTextColor="#71717A"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          style={styles.input}
        />
        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setQuery('');
              setActiveCategory('All');
              setResults(FEATURED_CLASSICS);
            }}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => handleSearch()}
          disabled={loading}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Category Filter Pills */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => handleCategoryPress(cat)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 1-Tap Quick Reader Test Bento Card */}
      <TouchableOpacity
        style={styles.quickTestCard}
        onPress={() => navigation.navigate('LibraryTab')}
        activeOpacity={0.8}
      >
        <View style={styles.quickTestLeft}>
          <View style={styles.lightningIconContainer}>
            <Text style={styles.lightningIcon}>⚡</Text>
          </View>
          <View style={styles.quickTestTexts}>
            <Text style={styles.quickTestTitle}>Test Built-in PDF Reader</Text>
            <Text style={styles.quickTestDesc}>
              Instant offline public domain reader with dark & sepia themes
            </Text>
          </View>
        </View>
        <Text style={styles.quickTestArrow}>→</Text>
      </TouchableOpacity>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.statusText}>Searching Open Library, Gutenberg & Repositories...</Text>
        </View>
      )}

      {/* Error Message */}
      {errorMsg && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Results Header & FlatList */}
      {!loading && (
        <>
          <View style={styles.resultsHeaderRow}>
            <Text style={styles.sectionHeading}>
              {!query.trim()
                ? '🌟 Featured Public Domain Classics'
                : `Found ${results.length} Books`}
            </Text>
            <Text style={styles.resultsSourceCount}>Live Multi-Source</Text>
          </View>

          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onPress={(selected) =>
                  navigation.navigate('BookDetail', { book: selected })
                }
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        </>
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
    paddingTop: 12,
    paddingBottom: 10,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  appTitle: {
    color: '#FAFAFA',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  appSubtitle: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121215',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusPillText: {
    color: '#A1A1AA',
    fontSize: 11,
    fontWeight: '500',
  },

  // Search Box
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121215',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: '#FAFAFA',
    paddingVertical: 12,
    fontSize: 14,
  },
  clearBtn: {
    padding: 6,
    marginRight: 4,
  },
  clearBtnText: {
    color: '#71717A',
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchBtnText: {
    color: '#FAFAFA',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Category Pills
  categoryContainer: {
    marginTop: 10,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: '#121215',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  categoryPillActive: {
    backgroundColor: '#FAFAFA',
    borderColor: '#FAFAFA',
  },
  categoryText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#09090B',
  },

  // 21st.dev Bento Card
  quickTestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121215',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  quickTestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lightningIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  lightningIcon: {
    fontSize: 16,
  },
  quickTestTexts: {
    flex: 1,
  },
  quickTestTitle: {
    color: '#FAFAFA',
    fontSize: 13,
    fontWeight: 'bold',
  },
  quickTestDesc: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  quickTestArrow: {
    color: '#E50914',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Results Section
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  sectionHeading: {
    color: '#FAFAFA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultsSourceCount: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 6,
    paddingBottom: 20,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  statusText: {
    color: '#A1A1AA',
    marginTop: 12,
    fontSize: 13,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 14,
    margin: 16,
    borderRadius: 12,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    textAlign: 'center',
  },
});
