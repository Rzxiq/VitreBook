import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { DownloadedBook } from '../types/book';

const storage = new MMKV({
  id: 'vitrebook-library-storage',
});

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};

interface LibraryState {
  books: Record<string, DownloadedBook>;
  addBook: (book: DownloadedBook) => void;
  removeBook: (md5: string) => void;
  updateLastReadPage: (md5: string, page: number, totalPages?: number) => void;
  getBookByMd5: (md5: string) => DownloadedBook | undefined;
  clearLibrary: () => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      books: {},

      addBook: (book: DownloadedBook) => {
        set((state) => ({
          books: {
            ...state.books,
            [book.md5]: book,
          },
        }));
      },

      removeBook: (md5: string) => {
        set((state) => {
          const next = { ...state.books };
          delete next[md5];
          return { books: next };
        });
      },

      updateLastReadPage: (md5: string, page: number, totalPages?: number) => {
        set((state) => {
          const current = state.books[md5];
          if (!current) return state;

          return {
            books: {
              ...state.books,
              [md5]: {
                ...current,
                lastReadPage: page,
                totalPages: totalPages ?? current.totalPages,
              },
            },
          };
        });
      },

      getBookByMd5: (md5: string) => {
        return get().books[md5];
      },

      clearLibrary: () => {
        set({ books: {} });
      },
    }),
    {
      name: 'library-cache',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
