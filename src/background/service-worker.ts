// Service worker for Chrome Extension Manifest V3
import { handleMessage } from '../lib/message-router';

console.log('Service worker loaded');

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(response => sendResponse(response))
    .catch(error => sendResponse({
      success: false,
      error: error.message
    }));

  return true; // Required for async response
});
