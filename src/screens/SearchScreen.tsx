import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScraperManager } from '../api/scrapers';
import { ScrapedBook } from '../types/book';
import { useSettingsStore } from '../store/useSettingsStore';
import { BookCard } from '../components/BookCard';
import { MirrorSelectorModal } from '../components/MirrorSelectorModal';
import { UpdateBanner } from '../components/UpdateBanner';

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { getActiveMirror } = useSettingsStore();
  const activeMirror = getActiveMirror();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'pdf' | 'epub' | undefined>('pdf');
  const [results, setResults] = useState<ScrapedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMirrorModal, setShowMirrorModal] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await ScraperManager.search(activeMirror, query.trim(), filter);
      setResults(data);
      if (data.length === 0) {
        setErrorMsg('No books found matching your query on this mirror.');
      }
    } catch (err: any) {
      console.warn('Search error:', err);
      setErrorMsg(
        err.isCloudflare
          ? 'Cloudflare protection detected. Try switching catalog mirrors.'
          : 'Failed to connect to mirror. Check your connection or switch mirrors.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <UpdateBanner />

      {/* Top Header & Mirror Indicator */}
      <View style={styles.header}>
        <View style={styles.titleWithLogo}>
          <Image source={require('../assets/logo.jpg')} style={styles.appLogo} />
          <Text style={styles.appTitle}>VitreBook</Text>
        </View>
        <TouchableOpacity
          style={styles.mirrorBadge}
          onPress={() => setShowMirrorModal(true)}
        >
          <View style={styles.onlineDot} />
          <Text style={styles.mirrorBadgeText} numberOfLines={1}>
            {activeMirror.name}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchBoxContainer}>
        <TextInput
          placeholder="Search book title, author, or ISBN..."
          placeholderTextColor="#777"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Format Filter Chips */}
      <View style={styles.filterRow}>
        {(['pdf', 'epub'] as const).map((ext) => (
          <TouchableOpacity
            key={ext}
            style={[styles.filterChip, filter === ext && styles.activeChip]}
            onPress={() => setFilter(filter === ext ? undefined : ext)}
          >
            <Text style={[styles.filterText, filter === ext && styles.activeFilterText]}>
              {ext.toUpperCase()} Only
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* State Indicators */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.statusText}>Searching public-domain index...</Text>
        </View>
      )}

      {errorMsg && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity
            style={styles.switchMirrorBtn}
            onPress={() => setShowMirrorModal(true)}
          >
            <Text style={styles.switchMirrorText}>Switch Catalog Mirror</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results List */}
      {!loading && (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.md5}-${index}`}
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
      )}

      <MirrorSelectorModal
        visible={showMirrorModal}
        onClose={() => setShowMirrorModal(false)}
      />
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleWithLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appLogo: {
    width: 30,
    height: 30,
    borderRadius: 8,
  },
  appTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  mirrorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    maxWidth: 180,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  mirrorBadgeText: {
    color: '#AAA',
    fontSize: 12,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  searchBtn: {
    backgroundColor: '#E50914',
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  activeChip: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  filterText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: '#2A1717',
    padding: 16,
    margin: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#FF8A80',
    fontSize: 13,
    textAlign: 'center',
  },
  switchMirrorBtn: {
    marginTop: 10,
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  switchMirrorText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    paddingVertical: 8,
  },
});
