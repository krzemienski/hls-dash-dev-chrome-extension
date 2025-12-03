// src/lib/utils/storage.ts
import type { DetectedManifest, ManifestHistoryItem } from '../../types/manifest';
import type { ExtensionSettings } from '../../types/messages';

/**
 * Storage utilities for Chrome extension
 */

// In-memory storage for detected manifests per tab
const detectedManifestsMap = new Map<number, DetectedManifest[]>();

export function addDetectedManifest(tabId: number, manifest: DetectedManifest) {
  if (!detectedManifestsMap.has(tabId)) {
    detectedManifestsMap.set(tabId, []);
  }

  const manifests = detectedManifestsMap.get(tabId)!;

  // Avoid duplicates
  if (!manifests.some((m) => m.url === manifest.url)) {
    manifests.push(manifest);
  }
}

export function getDetectedManifests(tabId: number): DetectedManifest[] {
  return detectedManifestsMap.get(tabId) || [];
}

export function clearDetectedManifests(tabId: number) {
  detectedManifestsMap.delete(tabId);
}

// Clear when tab is closed (only in extension context)
if (typeof chrome !== 'undefined' && chrome.tabs) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    clearDetectedManifests(tabId);
  });
}

/**
 * Persistent storage using chrome.storage.local
 */

export async function getHistory(): Promise<ManifestHistoryItem[]> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return [];
  }
  const result = await chrome.storage.local.get('history');
  return result.history || [];
}

export async function addToHistory(item: ManifestHistoryItem): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return;
  }
  const history = await getHistory();

  // Avoid duplicates and limit to 50 items
  const filtered = history.filter((h) => h.url !== item.url);
  const updated = [item, ...filtered].slice(0, 50);

  await chrome.storage.local.set({ history: updated });
}

export async function clearHistory(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return;
  }
  await chrome.storage.local.set({ history: [] });
}

export async function getSettings(): Promise<ExtensionSettings> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return getDefaultSettings();
  }
  const result = await chrome.storage.local.get('settings');
  return result.settings || getDefaultSettings();
}

export async function updateSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    return;
  }
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await chrome.storage.local.set({ settings: updated });
}

function getDefaultSettings(): ExtensionSettings {
  return {
    autoInterceptEnabled: true,
    theme: 'auto',
    defaultView: 'structured',
    syntaxTheme: 'prism',
    ignoredUrls: [],
    safelist: []
  };
}
