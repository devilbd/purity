// Background service worker for Purity Inspector (Manifest V3)

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Purity Inspector] Installed / initialized:', details.reason);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'PING') {
    sendResponse({ status: 'PONG', timestamp: Date.now() });
  }
  return true;
});
