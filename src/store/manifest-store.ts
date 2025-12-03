// src/store/manifest-store.ts
import { create } from 'zustand';
import type { ParsedManifest } from '../types/manifest';

interface ManifestState {
  // Current manifest
  manifest: ParsedManifest | null;

  // UI state
  loading: boolean;
  error: string | null;

  // View preferences
  selectedView: 'raw' | 'structured' | 'timeline';
  selectedVariantId: string | null;

  // NEW v1.1.0: Dual-mode system
  viewMode: 'spec' | 'analysis';
  entryPoint: 'interception' | 'manual';

  // Actions
  setManifest: (manifest: ParsedManifest) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedView: (view: 'raw' | 'structured' | 'timeline') => void;
  setSelectedVariant: (variantId: string | null) => void;
  clearManifest: () => void;

  // NEW v1.1.0 actions
  setViewMode: (mode: 'spec' | 'analysis') => void;
  setEntryPoint: (entry: 'interception' | 'manual') => void;
}

export const useManifestStore = create<ManifestState>((set) => ({
  // Initial state
  manifest: null,
  loading: false,
  error: null,
  selectedView: 'structured',
  selectedVariantId: null,

  // NEW v1.1.0 initial state
  viewMode: 'analysis',
  entryPoint: 'manual',

  // Actions
  setManifest: (manifest) => set({ manifest, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setSelectedView: (selectedView) => set({ selectedView }),
  setSelectedVariant: (selectedVariantId) => set({ selectedVariantId }),
  clearManifest: () => set({
    manifest: null,
    error: null,
    loading: false,
    selectedVariantId: null
  }),

  // NEW v1.1.0 actions
  setViewMode: (viewMode) => set({ viewMode }),
  setEntryPoint: (entryPoint) => set({ entryPoint }),
}));
