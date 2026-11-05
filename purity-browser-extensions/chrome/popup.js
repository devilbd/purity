/**
 * Purity DevTools - Quick Launcher Popup
 * Directs users to the dedicated "Purity" tab in Chrome Developer Tools (F12).
 */

document.addEventListener('DOMContentLoaded', () => {
  const openTabBtn = document.getElementById('btn-open-browser-tab');
  openTabBtn?.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.create === 'function') {
      chrome.tabs.create({ url: chrome.runtime.getURL('panel.html') });
    }
  });

  checkPurityStatus();
});

async function checkPurityStatus() {
  const badge = document.getElementById('app-badge');
  const statusText = document.getElementById('launcher-status');
  const appInfo = document.getElementById('launcher-app-info');
  const actionsBox = document.getElementById('launcher-actions');
  const instructionsBox = document.getElementById('launcher-instructions');
  const prodNoticeBox = document.getElementById('launcher-prod-notice');

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (
      !activeTab ||
      !activeTab.id ||
      !activeTab.url ||
      activeTab.url.startsWith('chrome://') ||
      activeTab.url.startsWith('chrome-extension://') ||
      activeTab.url.startsWith('edge://') ||
      activeTab.url.startsWith('about:')
    ) {
      if (badge) {
        badge.className = 'badge badge-warning';
        badge.textContent = 'Ready';
      }
      if (statusText) {
        statusText.textContent = 'Open your Purity application tab, then press F12 to inspect with Purity DevTools.';
      }
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      world: 'MAIN',
      func: inspectPurityAppInPage,
    });

    const data = results?.[0]?.result;

    if (!data || !data.detected) {
      if (badge) {
        badge.className = 'badge badge-warning';
        badge.textContent = 'Not Detected';
      }
      if (statusText) {
        statusText.textContent = 'No Purity application detected on active tab. Open a Purity app to inspect.';
      }
      prodNoticeBox?.classList.add('hidden');
      appInfo?.classList.add('hidden');
    } else if (data.productionMode) {
      if (badge) {
        badge.className = 'badge badge-danger';
        badge.textContent = `Purity ${data.version || '2.1.0'} • Prod Mode`;
      }
      if (statusText) {
        statusText.textContent = 'Production mode detected. Purity DevTools cannot be used in production mode — the tool is viable only in Development Mode.';
      }
      actionsBox?.classList.add('hidden');
      instructionsBox?.classList.add('hidden');
      appInfo?.classList.add('hidden');
      prodNoticeBox?.classList.remove('hidden');
    } else {
      if (badge) {
        badge.className = 'badge badge-success';
        badge.textContent = `Purity ${data.version || '2.1.0'} • Dev Mode`;
      }
      if (statusText) {
        statusText.textContent = `Purity is active in Development Mode! Open Developer Tools to inspect components, services, and reactivity.`;
      }
      prodNoticeBox?.classList.add('hidden');
      actionsBox?.classList.remove('hidden');
      instructionsBox?.classList.remove('hidden');

      if (appInfo) {
        appInfo.classList.remove('hidden');
        const compsEl = document.getElementById('meta-comps-count');
        if (compsEl) compsEl.textContent = String(data.components.length);

        const servsEl = document.getElementById('meta-servs-count');
        if (servsEl) servsEl.textContent = String(data.services.length);

        const reactEl = document.getElementById('meta-react-count');
        if (reactEl) reactEl.textContent = String(data.reactivityGraph?.length || 0);
      }
    }
  } catch (err) {
    console.warn('[Purity DevTools Launcher] Error checking page:', err);
    if (badge) {
      badge.className = 'badge badge-warning';
      badge.textContent = 'Not Detected';
    }
  }
}
