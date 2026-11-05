/**
 * Purity DevTools Launcher Script (Mozilla Firefox)
 * Creates the dedicated "Purity" panel tab in Firefox Developer Tools (F12).
 */

try {
  if (typeof browser !== 'undefined' && browser.devtools?.panels?.create) {
    browser.devtools.panels
      .create('Purity', 'icons/icon-16.png', 'panel.html')
      .then(() => {
        console.log('[Purity DevTools] Panel created successfully');
      })
      .catch((err) => {
        console.error('[Purity DevTools] Failed to create panel:', err);
      });
  } else if (typeof chrome !== 'undefined' && chrome.devtools?.panels?.create) {
    chrome.devtools.panels.create(
      'Purity',
      'icons/icon-16.png',
      'panel.html',
      function () {
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
