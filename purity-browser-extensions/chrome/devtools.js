/**
 * Purity DevTools Launcher Script
 * Creates the dedicated "Purity" panel tab in Chrome Developer Tools (F12).
 */

try {
  if (typeof chrome !== 'undefined' && chrome.devtools?.panels?.create) {
    chrome.devtools.panels.create(
      'Purity',
      'icons/icon-16.png',
      'panel.html',
      function (panel) {
        if (chrome.runtime?.lastError) {
          console.error('[Purity DevTools] Failed to create panel:', chrome.runtime.lastError);
        } else {
          console.log('[Purity DevTools] Panel created successfully');
        }
      }
    );
  }
} catch (err) {
  console.error('[Purity DevTools] Error initializing devtools panel:', err);
}
