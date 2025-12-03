// Service worker for Chrome Extension Manifest V3
import { handleMessage } from '../lib/message-router';
import { addDetectedManifest } from '../lib/utils/storage';
import type { DetectedManifest } from '../types/manifest';

console.log('Service worker loaded');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle manifests-detected from content script
  if (message.action === 'manifests-detected') {
    const tabId = sender.tab?.id;
    if (tabId && message.manifests) {
      message.manifests.forEach((manifest: DetectedManifest) => {
        addDetectedManifest(tabId, manifest);
      });
    }
    sendResponse({ success: true });
    return true;
  }

  // Handle standard messages
  handleMessage(message, sender)
    .then(response => sendResponse(response))
    .catch(error => sendResponse({
      success: false,
      error: error.message
    }));

  return true; // Required for async response
});
