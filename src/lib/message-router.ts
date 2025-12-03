// src/lib/message-router.ts
import type { ExtensionMessage, ExtensionResponse } from '../types/messages';
import { fetchManifestContent } from './fetchers/manifest-fetcher';
import {
  getDetectedManifests,
  updateSettings,
  clearHistory,
  getSettings
} from './utils/storage';

export async function handleMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<ExtensionResponse> {
  try {
    switch (message.action) {
      case 'fetch-manifest':
        return await handleFetchManifest(message.url);

      case 'update-ignore-list':
        return await handleUpdateIgnoreList(message.url, message.ignore);

      case 'get-detected':
        return await handleGetDetected(message.tabId);

      case 'update-settings':
        return await handleUpdateSettings(message.settings);

      case 'clear-history':
        return await handleClearHistory();

      default:
        return {
          success: false,
          error: `Unknown action: ${(message as any).action}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Placeholder handlers (will implement in next tasks)
async function handleFetchManifest(url: string): Promise<ExtensionResponse<string>> {
  try {
    const content = await fetchManifestContent(url);
    return {
      success: true,
      data: content
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch manifest'
    };
  }
}

async function handleUpdateIgnoreList(url: string, ignore: boolean): Promise<ExtensionResponse> {
  try {
    const settings = await getSettings();
    if (ignore) {
      if (!settings.ignoredUrls.includes(url)) {
        settings.ignoredUrls.push(url);
      }
    } else {
      settings.ignoredUrls = settings.ignoredUrls.filter((u: string) => u !== url);
    }
    await updateSettings({ ignoredUrls: settings.ignoredUrls });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update ignore list'
    };
  }
}

async function handleGetDetected(tabId: number): Promise<ExtensionResponse> {
  try {
    const manifests = getDetectedManifests(tabId);
    return {
      success: true,
      data: manifests
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get detected manifests'
    };
  }
}

async function handleUpdateSettings(settings: any): Promise<ExtensionResponse> {
  try {
    await updateSettings(settings);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings'
    };
  }
}

async function handleClearHistory(): Promise<ExtensionResponse> {
  try {
    await clearHistory();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear history'
    };
  }
}
