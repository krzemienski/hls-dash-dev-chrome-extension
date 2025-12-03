// Content script injected on all pages
import { scanDOMForManifests, getFormatFromUrl } from '../lib/utils/manifest-detector';
import type { DetectedManifest } from '../types/manifest';

console.log('Content script loaded on:', window.location.href);

// Store detected manifests for this tab
const detectedManifests: DetectedManifest[] = [];

/**
 * Scan page for manifest links
 */
function detectManifestsOnPage() {
  const urls = scanDOMForManifests();

  urls.forEach((url) => {
    const format = getFormatFromUrl(url);
    if (format && !detectedManifests.some((m) => m.url === url)) {
      detectedManifests.push({
        url,
        format,
        source: 'link',
        pageUrl: window.location.href
      });
      console.log('Detected manifest:', format.toUpperCase(), url);
    }
  });

  // Notify background script
  if (detectedManifests.length > 0) {
    chrome.runtime.sendMessage({
      action: 'manifests-detected',
      manifests: detectedManifests,
      tabId: chrome.devtools?.inspectedWindow?.tabId
    });
  }
}

// Run detection on page load
detectManifestsOnPage();

// Re-scan when DOM changes (for SPAs)
const observer = new MutationObserver(() => {
  detectManifestsOnPage();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for messages from popup/devtools
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'get-detected-manifests') {
    sendResponse({ success: true, data: detectedManifests });
  }
  return true;
});
