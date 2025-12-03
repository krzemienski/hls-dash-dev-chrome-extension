// src/lib/message-router.ts
import type { ExtensionMessage, ExtensionResponse } from '../types/messages';
import { fetchManifestContent } from './fetchers/manifest-fetcher';

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

async function handleUpdateIgnoreList(_url: string, _ignore: boolean): Promise<ExtensionResponse> {
  return { success: false, error: 'Not implemented' };
}

async function handleGetDetected(_tabId: number): Promise<ExtensionResponse> {
  return { success: false, error: 'Not implemented' };
}

async function handleUpdateSettings(_settings: any): Promise<ExtensionResponse> {
  return { success: false, error: 'Not implemented' };
}

async function handleClearHistory(): Promise<ExtensionResponse> {
  return { success: false, error: 'Not implemented' };
}
