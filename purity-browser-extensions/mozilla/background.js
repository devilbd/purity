// Background script for Purity Inspector (Mozilla WebExtension Manifest V3)

const ext = typeof browser !== 'undefined' ? browser : chrome;

ext.runtime.onInstalled.addListener((details) => {
  console.log('[Purity Inspector] Installed / initialized:', details.reason);
});

ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'PING') {
    sendResponse({ status: 'PONG', timestamp: Date.now() });
  }
  return true;
});
