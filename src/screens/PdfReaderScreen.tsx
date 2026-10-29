import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Linking,
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
  const [totalPages, setTotalPages] = useState<number>(book?.totalPages || 1);
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Jump to page modal
  const [jumpModalVisible, setJumpModalVisible] = useState(false);
  const [jumpInput, setJumpInput] = useState('');

  // Format URI properly for Android native PdfView
  const cleanUri = React.useMemo(() => {
    if (!filePath) return '';
    if (filePath.startsWith('file://') || filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    return `file://${filePath}`;
  }, [filePath]);

  // Watchdog timer: Automatically dismiss loading overlay after 3.5s to prevent infinite spinner
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-save page progress & dismiss loading when page renders
  const handlePageChanged = useCallback(
    (page: number, numberOfPages: number) => {
      setCurrentPage(page);
      if (numberOfPages > 0) {
        setTotalPages(numberOfPages);
      }
      setIsLoading(false);
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
    setIsLoading(false);
    updateLastReadPage(md5, pageNum, totalPages);
    setJumpModalVisible(false);
    setJumpInput('');
  };

  const handleOpenExternal = async () => {
    try {
      const canOpen = await Linking.canOpenURL(cleanUri);
      if (canOpen) {
        await Linking.openURL(cleanUri);
      } else {
        Alert.alert('Open Failed', 'No external PDF reader found to open this document.');
      }
    } catch {
      Alert.alert('External Viewer', `File is stored at: ${cleanUri}`);
    }
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
        backgroundColor={theme === 'dark' ? '#09090B' : theme === 'sepia' ? '#F4ECD8' : '#FFFFFF'}
      />

      {/* 21st.dev-Inspired Top Floating Glass Header */}
      {showControls && (
        <View
          style={[
            styles.floatingHeader,
            theme === 'dark' && styles.darkBar,
            theme === 'sepia' && styles.sepiaBar,
            theme === 'light' && styles.lightBar,
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={[styles.closeIcon, theme === 'light' ? styles.darkText : styles.lightText]}>✕</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text
              numberOfLines={1}
              style={[styles.headerTitle, theme === 'light' ? styles.darkText : styles.lightText]}
            >
              {title || 'Document Reader'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {totalPages > 0 ? `Page ${currentPage} of ${totalPages} • ${progressPercent}%` : 'Reading'}
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

      {/* PDF View Canvas */}
      <View style={styles.pdfWrapper}>
        {isLoading && !loadError && (
          <View style={styles.translucentLoading}>
            <ActivityIndicator size="small" color="#E50914" />
            <Text style={[styles.loadingText, theme === 'light' ? styles.darkText : styles.lightText]}>
              Loading pages...
            </Text>
          </View>
        )}

        {loadError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTitle}>Could not render with built-in viewer</Text>
            <Text style={styles.errorDesc}>{loadError}</Text>
            <View style={styles.errorBtnRow}>
              <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.goBack()}>
                <Text style={styles.actionBtnTextSec}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleOpenExternal}>
                <Text style={styles.actionBtnTextPri}>Open in External App</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Pdf
            ref={pdfRef}
            source={{
              uri: cleanUri,
              cache: cleanUri.startsWith('http'),
            }}
            page={initialPage}
            onLoadComplete={(numberOfPages) => {
              setTotalPages(numberOfPages || 1);
              setIsLoading(false);
            }}
            onPageChanged={handlePageChanged}
            onError={(error) => {
              console.warn('PDF Read Error:', error);
              setIsLoading(false);
              setLoadError('Unable to parse document. You can open it using an external PDF viewer.');
            }}
            onPageSingleTap={() => {
              setShowControls((prev) => !prev);
            }}
            style={styles.pdf}
            enablePaging={true}
            horizontal={false}
            enableRTL={false}
            enableAnnotationRendering={false}
          />
        )}
      </View>

      {/* 21st.dev-Inspired Bottom Glass Scrubber HUD */}
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
              onPress={() => {
                const nextP = Math.max(1, currentPage - 10);
                pdfRef.current?.setPage(nextP);
                setCurrentPage(nextP);
              }}
              style={[styles.stepBtn, currentPage <= 10 && styles.disabledBtn]}
            >
              <Text style={[styles.stepBtnText, theme === 'light' ? styles.darkText : styles.lightText]}>
                -10
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentPage <= 1}
              onPress={() => {
                const nextP = Math.max(1, currentPage - 1);
                pdfRef.current?.setPage(nextP);
                setCurrentPage(nextP);
              }}
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
              onPress={() => {
                const nextP = Math.min(totalPages, currentPage + 1);
                pdfRef.current?.setPage(nextP);
                setCurrentPage(nextP);
              }}
              style={[styles.stepBtn, currentPage >= totalPages && styles.disabledBtn]}
            >
              <Text style={[styles.stepBtnText, theme === 'light' ? styles.darkText : styles.lightText]}>
                Next ▶
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={currentPage + 10 > totalPages}
              onPress={() => {
                const nextP = Math.min(totalPages, currentPage + 10);
                pdfRef.current?.setPage(nextP);
                setCurrentPage(nextP);
              }}
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
              placeholderTextColor="#71717A"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#09090B',
  },
  sepiaContainer: {
    backgroundColor: '#F4ECD8',
  },
  lightContainer: {
    backgroundColor: '#FAFAFA',
  },

  // 21st.dev Glass Bars
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
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    zIndex: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  darkBar: {
    backgroundColor: 'rgba(18, 18, 21, 0.92)',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  sepiaBar: {
    backgroundColor: 'rgba(244, 236, 216, 0.94)',
    borderWidth: 1,
    borderColor: '#D4C4A8',
  },
  lightBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },

  closeBtn: {
    padding: 6,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  darkText: {
    color: '#18181B',
  },
  lightText: {
    color: '#FAFAFA',
  },

  themeGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  themeChip: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeChip: {
    backgroundColor: '#E50914',
  },
  themeIcon: {
    fontSize: 13,
  },

  pdfWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#09090B',
  },

  translucentLoading: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(18, 18, 21, 0.85)',
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FAFAFA',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtnSecondary: {
    backgroundColor: '#27272A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnTextSec: {
    color: '#FAFAFA',
    fontWeight: '600',
    fontSize: 13,
  },
  actionBtnPrimary: {
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnTextPri: {
    color: '#FAFAFA',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Footer & Scrubber
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  disabledBtn: {
    opacity: 0.25,
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pagePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  pageInfoText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Jump Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  jumpModalCard: {
    width: '100%',
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  jumpModalTitle: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jumpModalSubtitle: {
    color: '#71717A',
    fontSize: 13,
    marginBottom: 16,
  },
  jumpModalInput: {
    backgroundColor: '#09090B',
    color: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  jumpModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  jumpBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  jumpCancelBtn: {
    backgroundColor: '#27272A',
  },
  jumpCancelText: {
    color: '#A1A1AA',
    fontWeight: '600',
  },
  jumpConfirmBtn: {
    backgroundColor: '#E50914',
  },
  jumpConfirmText: {
    color: '#FAFAFA',
    fontWeight: 'bold',
  },
});
