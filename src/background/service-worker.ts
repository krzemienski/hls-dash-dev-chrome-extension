// Service worker for Chrome Extension Manifest V3
console.log('Service worker loaded');

// Keep service worker alive
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
});

// Message handler placeholder
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  sendResponse({ success: true });
  return true; // Required for async response
});
