import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Pdf from 'react-native-pdf';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLibraryStore } from '../store/useLibraryStore';

interface RouteParams {
  md5: string;
  filePath: string;
  title: string;
}

type ReaderTheme = 'dark' | 'sepia' | 'light';

export const PdfReaderScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { md5, filePath, title } = (route.params as RouteParams) || {};

  const pdfRef = useRef<any>(null);
  const { getBookByMd5, updateLastReadPage } = useLibraryStore();
  const book = getBookByMd5(md5);

  const initialPage = book?.lastReadPage && book.lastReadPage > 0 ? book.lastReadPage : 1;

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(book?.totalPages || 0);
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Jump to page modal
  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [jumpInput, setJumpInput] = useState('');

  // Auto-save page progress
  const handlePageChanged = useCallback(
    (page: number, numberOfPages: number) => {
      setCurrentPage(page);
      setTotalPages(numberOfPages);
      updateLastReadPage(md5, page, numberOfPages);
    },
    [md5, updateLastReadPage]
  );

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpInput.trim(), 10);
    if (!pageNum || pageNum < 1 || (totalPages > 0 && pageNum > totalPages)) {
      Alert.alert('Invalid Page', `Please enter a valid page number between 1 and ${totalPages || 1000}.`);
      return;
    }
    pdfRef.current?.setPage(pageNum);
    setCurrentPage(pageNum);
    updateLastReadPage(md5, pageNum, totalPages);
    setJumpModalVisible(false);
    setJumpInput('');
  };

  const progressPercent =
    totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

  return (
    <SafeAreaView
      style={[
        styles.container,
        theme === 'dark' && styles.darkContainer,
        theme === 'sepia' && styles.sepiaContainer,
        theme === 'light' && styles.lightContainer,
      ]}
    >
      <StatusBar
        hidden={!showControls}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={theme === 'dark' ? '#121212' : theme === 'sepia' ? '#F4ECD8' : '#FFFFFF'}
      />

      {/* Mobbin-Inspired Top Floating Header */}
      {showControls && (
        <View
          style={[
            styles.floatingHeader,
            theme === 'dark' && styles.darkBar,
            theme === 'sepia' && styles.sepiaBar,
            theme === 'light' && styles.lightBar,
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Text style={[styles.backText, theme === 'light' ? styles.darkText : styles.lightText]}>
              ✕
            </Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text
              numberOfLines={1}
              style={[styles.headerTitle, theme === 'light' ? styles.darkText : styles.lightText]}
            >
              {title || 'Document Reader'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {totalPages > 0 ? `${progressPercent}% completed` : 'Reading'}
            </Text>
          </View>

          {/* Theme Palette Switcher */}
          <View style={styles.themeGroup}>
            <TouchableOpacity
              onPress={() => setTheme('dark')}
              style={[styles.themeChip, theme === 'dark' && styles.activeChip]}
            >
              <Text style={styles.themeIcon}>🌙</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTheme('sepia')}
              style={[styles.themeChip, theme === 'sepia' && styles.activeChip]}
            >
              <Text style={styles.themeIcon}>📜</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTheme('light')}
              style={[styles.themeChip, theme === 'light' && styles.activeChip]}
            >
              <Text style={styles.themeIcon}>☀️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PDF View Container */}
      <View style={styles.pdfWrapper}>
        {isLoading && !loadError && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={[styles.loadingText, theme === 'light' ? styles.darkText : styles.lightText]}>
              Rendering Document...
            </Text>
          </View>
        )}

        {loadError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Could not render PDF</Text>
            <Text style={styles.errorDesc}>{loadError}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setLoadError(null);
                setIsLoading(true);
              }}
            >
              <Text style={styles.retryBtnText}>Retry Loading</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Pdf
            ref={pdfRef}
            source={{ uri: filePath, cache: true }}
            page={initialPage}
            onLoadComplete={(numberOfPages) => {
              setTotalPages(numberOfPages);
              setIsLoading(false);
            }}
            onPageChanged={handlePageChanged}
            onError={(error) => {
              console.warn('PDF Read Error:', error);
              setIsLoading(false);
              setLoadError('The document could not be loaded. Check that the file exists and is a valid PDF.');
            }}
            onPageSingleTap={() => {
              setShowControls((prev) => !prev);
            }}
            style={[
              styles.pdf,
              theme === 'dark' && styles.invertedPdf,
              theme === 'sepia' && styles.sepiaPdf,
            ]}
            enablePaging={true}
            horizontal={false}
            enableRTL={false}
            enableAnnotationRendering={false}
          />
        )}
      </View>

      {/* Mobbin-Inspired Bottom HUD & Scrubber */}
      {showControls && (
        <View
          style={[
            styles.floatingFooter,
            theme === 'dark' && styles.darkBar,
            theme === 'sepia' && styles.sepiaBar,
            theme === 'light' && styles.lightBar,
          ]}
        >
          {/* Progress Track */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
                theme === 'sepia' ? { backgroundColor: '#8B5A2B' } : { backgroundColor: '#E50914' },
              ]}
            />
          </View>

          {/* Stepper Controls */}
          <View style={styles.footerControls}>
            <TouchableOpacity
              disabled={currentPage <= 10}
              onPress={() => pdfRef.current?.setPage(Math.max(1, currentPage - 10))}
              style={[styles.stepBtn, currentPage <= 10 && styles.disabledBtn]}
            >
              <Text style={[styles.stepBtnText, theme === 'light' ? styles.darkText : styles.lightText]}>
                -10
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentPage <= 1}
              onPress={() => pdfRef.current?.setPage(Math.max(1, currentPage - 1))}
              style={[styles.stepBtn, currentPage <= 1 && styles.disabledBtn]}
            >
              <Text style={[styles.stepBtnText, theme === 'light' ? styles.darkText : styles.lightText]}>
                ◀ Prev
              </Text>
            </TouchableOpacity>

            {/* Tap to Jump to Page */}
            <TouchableOpacity
              onPress={() => {
                setJumpInput(String(currentPage));
                setJumpModalVisible(true);
              }}
              style={styles.pagePill}
            >
              <Text style={[styles.pageInfoText, theme === 'light' ? styles.darkText : styles.lightText]}>
                Page {currentPage} of {totalPages || '--'} ✎
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentPage >= totalPages}
              onPress={() => pdfRef.current?.setPage(Math.min(totalPages, currentPage + 1))}
              style={[styles.stepBtn, currentPage >= totalPages && styles.disabledBtn]}
            >
              <Text style={[styles.stepBtnText, theme === 'light' ? styles.darkText : styles.lightText]}>
                Next ▶
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentPage + 10 > totalPages}
              onPress={() => pdfRef.current?.setPage(Math.min(totalPages, currentPage + 10))}
              style={[styles.stepBtn, currentPage + 10 > totalPages && styles.disabledBtn]}
            >
              <Text style={[styles.stepBtnText, theme === 'light' ? styles.darkText : styles.lightText]}>
                +10
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Jump to Page Modal */}
      <Modal visible={jumpModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.jumpModalCard}>
            <Text style={styles.jumpModalTitle}>Jump to Page</Text>
            <Text style={styles.jumpModalSubtitle}>
              Total pages available: {totalPages || 'Unknown'}
            </Text>
            <TextInput
              keyboardType="number-pad"
              value={jumpInput}
              onChangeText={setJumpInput}
              placeholder="e.g. 42"
              placeholderTextColor="#888"
              style={styles.jumpModalInput}
              autoFocus
            />
            <View style={styles.jumpModalButtons}>
              <TouchableOpacity
                onPress={() => setJumpModalVisible(false)}
                style={[styles.jumpBtn, styles.jumpCancelBtn]}
              >
                <Text style={styles.jumpCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleJumpToPage} style={[styles.jumpBtn, styles.jumpConfirmBtn]}>
                <Text style={styles.jumpConfirmText}>Go</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#0F0F0F',
  },
  sepiaContainer: {
    backgroundColor: '#F4ECD8',
  },
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },

  // Floating Bars
  floatingHeader: {
    position: 'absolute',
    top: 10,
    left: 14,
    right: 14,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    zIndex: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  darkBar: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  sepiaBar: {
    backgroundColor: 'rgba(240, 230, 210, 0.96)',
    borderWidth: 1,
    borderColor: '#D4C4A8',
  },
  lightBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  iconBtn: {
    padding: 6,
  },
  backText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  darkText: {
    color: '#1C1C1E',
  },
  lightText: {
    color: '#FFFFFF',
  },

  themeGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  themeChip: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  activeChip: {
    backgroundColor: '#E50914',
  },
  themeIcon: {
    fontSize: 14,
  },

  pdfWrapper: {
    flex: 1,
    width,
    height,
  },
  pdf: {
    flex: 1,
    width,
    height,
    backgroundColor: '#FFFFFF',
  },
  invertedPdf: {
    backgroundColor: '#0F0F0F',
  },
  sepiaPdf: {
    backgroundColor: '#F4ECD8',
  },

  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    backgroundColor: '#0F0F0F',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 13,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  // Footer & Scrubber
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  disabledBtn: {
    opacity: 0.3,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pagePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
  },
  pageInfoText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Jump Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  jumpModalCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  jumpModalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jumpModalSubtitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginBottom: 16,
  },
  jumpModalInput: {
    backgroundColor: '#2A2A2A',
    color: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  jumpModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  jumpBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  jumpCancelBtn: {
    backgroundColor: '#333',
  },
  jumpCancelText: {
    color: '#AAA',
    fontWeight: '600',
  },
  jumpConfirmBtn: {
    backgroundColor: '#E50914',
  },
  jumpConfirmText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
