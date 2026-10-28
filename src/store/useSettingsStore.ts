import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { MirrorConfig } from '../types/book';
import { DEFAULT_MIRRORS } from '../api/configService';

const storage = new MMKV({
  id: 'vitrebook-settings-storage',
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

interface SettingsState {
  mirrors: MirrorConfig[];
  activeMirrorId: string;
  defaultNightMode: boolean;
  autoCheckUpdates: boolean;
  setMirrors: (mirrors: MirrorConfig[]) => void;
  setActiveMirror: (mirrorId: string) => void;
  addCustomMirror: (mirror: MirrorConfig) => void;
  getActiveMirror: () => MirrorConfig;
  setDefaultNightMode: (enabled: boolean) => void;
  setAutoCheckUpdates: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      mirrors: DEFAULT_MIRRORS,
      activeMirrorId: DEFAULT_MIRRORS[0].id,
      defaultNightMode: true,
      autoCheckUpdates: true,

      setMirrors: (mirrors: MirrorConfig[]) => {
        set({ mirrors });
      },

      setActiveMirror: (mirrorId: string) => {
        set((state) => ({
          activeMirrorId: mirrorId,
          mirrors: state.mirrors.map((m) => ({
            ...m,
            isActive: m.id === mirrorId,
          })),
        }));
      },

      addCustomMirror: (newMirror: MirrorConfig) => {
        set((state) => ({
          mirrors: [...state.mirrors, newMirror],
          activeMirrorId: newMirror.id,
        }));
      },

      getActiveMirror: () => {
        const { mirrors, activeMirrorId } = get();
        const active = mirrors.find((m) => m.id === activeMirrorId);
        return active || mirrors[0] || DEFAULT_MIRRORS[0];
      },

      setDefaultNightMode: (enabled: boolean) => {
        set({ defaultNightMode: enabled });
      },

      setAutoCheckUpdates: (enabled: boolean) => {
        set({ autoCheckUpdates: enabled });
      },
    }),
    {
      name: 'settings-cache',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
