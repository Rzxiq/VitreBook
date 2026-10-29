import { create } from 'zustand';
import { GlassEngineState } from '../types/glass';

export const useGlassStore = create<GlassEngineState>((set) => ({
  glassOpacity: 0.58,
  blurIntensity: 16,
  reflectionEnabled: true,
  springStrength: 1.0,
  activeTab: 'demo',

  setGlassOpacity: (val: number) =>
    set({ glassOpacity: Math.max(0.15, Math.min(0.95, Number(val.toFixed(2)))) }),

  setBlurIntensity: (val: number) =>
    set({ blurIntensity: Math.max(4, Math.min(40, Math.round(val))) }),

  setReflectionEnabled: (val: boolean) =>
    set({ reflectionEnabled: val }),

  setSpringStrength: (val: number) =>
    set({ springStrength: Math.max(0.5, Math.min(2.0, Number(val.toFixed(2)))) }),

  setActiveTab: (tab: string) =>
    set({ activeTab: tab }),

  resetToDefaults: () =>
    set({
      glassOpacity: 0.58,
      blurIntensity: 16,
      reflectionEnabled: true,
      springStrength: 1.0,
      activeTab: 'demo',
    }),
}));
