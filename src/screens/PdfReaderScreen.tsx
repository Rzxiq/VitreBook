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
} from 'react-native';
import Pdf from 'react-native-pdf';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLibraryStore } from '../store/useLibraryStore';

interface RouteParams {
  md5: string;
  filePath: string;
  title: string;
}

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
  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-save page progress
  const handlePageChanged = useCallback(
    (page: number, numberOfPages: number) => {
      setCurrentPage(page);
      setTotalPages(numberOfPages);
      updateLastReadPage(md5, page, numberOfPages);
    },
    [md5, updateLastReadPage]
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        isNightMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar
        hidden={!showControls}
        barStyle={isNightMode ? 'light-content' : 'dark-content'}
        backgroundColor={isNightMode ? '#121212' : '#FFFFFF'}
      />

      {/* Top Header Overlay */}
      {showControls && (
        <View
          style={[
            styles.header,
            isNightMode ? styles.darkHeader : styles.lightHeader,
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
            <Text style={[styles.navButtonText, isNightMode && styles.darkText]}>← Back</Text>
          </TouchableOpacity>

          <Text numberOfLines={1} style={[styles.headerTitle, isNightMode && styles.darkText]}>
            {title || 'Document Reader'}
          </Text>

          <TouchableOpacity
            onPress={() => setIsNightMode((prev) => !prev)}
            style={styles.modeButton}
          >
            <Text style={styles.modeIcon}>{isNightMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PDF View Container */}
      <View style={styles.pdfWrapper}>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={[styles.loadingText, isNightMode && styles.darkText]}>
              Loading Document...
            </Text>
          </View>
        )}

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
          }}
          onPageSingleTap={() => {
            setShowControls((prev) => !prev);
          }}
          style={[
            styles.pdf,
            isNightMode && styles.invertedPdf,
          ]}
          enablePaging={true}
          horizontal={false}
          enableRTL={false}
          enableAnnotationRendering={false}
        />
      </View>

      {/* Bottom Page Indicator Overlay */}
      {showControls && (
        <View
          style={[
            styles.footer,
            isNightMode ? styles.darkFooter : styles.lightFooter,
          ]}
        >
          <TouchableOpacity
            disabled={currentPage <= 1}
            onPress={() => {
              if (currentPage > 1) {
                pdfRef.current?.setPage(currentPage - 1);
              }
            }}
            style={[styles.pageNavBtn, currentPage <= 1 && styles.disabledBtn]}
          >
            <Text style={styles.pageNavText}>◀ Prev</Text>
          </TouchableOpacity>

          <Text style={[styles.pageInfoText, isNightMode && styles.darkText]}>
            Page {currentPage} of {totalPages || '--'}
          </Text>

          <TouchableOpacity
            disabled={currentPage >= totalPages}
            onPress={() => {
              if (currentPage < totalPages) {
                pdfRef.current?.setPage(currentPage + 1);
              }
            }}
            style={[styles.pageNavBtn, currentPage >= totalPages && styles.disabledBtn]}
          >
            <Text style={styles.pageNavText}>Next ▶</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  lightContainer: {
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  darkHeader: {
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderBottomColor: '#282828',
  },
  lightHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomColor: '#E0E0E0',
  },
  navButton: {
    padding: 6,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 10,
    color: '#000',
  },
  darkText: {
    color: '#FFF',
  },
  modeButton: {
    padding: 6,
  },
  modeIcon: {
    fontSize: 18,
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
    // Android hardware layer color invert simulation
    backgroundColor: '#121212',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  darkFooter: {
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderTopColor: '#282828',
  },
  lightFooter: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopColor: '#E0E0E0',
  },
  pageNavBtn: {
    backgroundColor: '#E50914',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disabledBtn: {
    backgroundColor: '#444',
    opacity: 0.5,
  },
  pageNavText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pageInfoText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
