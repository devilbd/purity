/**
 * Purity Inspector - Popup UI Controller with Dual-Tab + Reactivity Visualizer & Resizer
 */

// Application state
let currentSnapshot = null;
let selectedComponentName = null;
let selectedServiceName = null;
let selectedReactComponentName = null;
let currentTab = 'components'; // 'components' | 'services' | 'reactivity'
let compSearchQuery = '';
let servSearchQuery = '';
let reactCompSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initResizer();
  initUI();
  refreshInspection();
});

/**
 * ----------------------------------------------------
 * RESIZABLE WINDOW & PERSISTENCE
 * ----------------------------------------------------
 */
function initResizer() {
  const DEFAULT_WIDTH = 660;
  const DEFAULT_HEIGHT = 560;
  const MIN_WIDTH = 500;
  const MAX_WIDTH = 800;
  const MIN_HEIGHT = 400;
  const MAX_HEIGHT = 600;

  // Restore saved size from localStorage
  try {
    const saved = localStorage.getItem('purity_inspector_size');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.width && parsed?.height) {
        const clampedW = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed.width));
        const clampedH = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, parsed.height));
        document.body.style.width = `${clampedW}px`;
        document.body.style.height = `${clampedH}px`;
      }
    }
  } catch (e) {
    console.warn('[Purity Inspector] Failed to read stored size:', e);
  }

  const handle = document.getElementById('window-resize-handle');
  if (!handle) return;

  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startWidth = 0;
  let startHeight = 0;

  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isResizing = true;
    handle.classList.add('resizing');
    handle.setPointerCapture(e.pointerId);

    startX = e.clientX;
    startY = e.clientY;
    startWidth = document.body.offsetWidth;
    startHeight = document.body.offsetHeight;
  });

  handle.addEventListener('pointermove', (e) => {
    if (!isResizing) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + deltaX));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + deltaY));

    document.body.style.width = `${newWidth}px`;
    document.body.style.height = `${newHeight}px`;

    if (currentTab === 'reactivity') {
      requestAnimationFrame(drawCurrentReactivityLines);
    }
  });

  const stopResize = () => {
    if (!isResizing) return;
    isResizing = false;
    handle.classList.remove('resizing');

    const finalWidth = document.body.offsetWidth;
    const finalHeight = document.body.offsetHeight;

    try {
      localStorage.setItem(
        'purity_inspector_size',
        JSON.stringify({ width: finalWidth, height: finalHeight }),
      );
    } catch {}

    if (currentTab === 'reactivity') {
      setTimeout(drawCurrentReactivityLines, 50);
    }
  };

  handle.addEventListener('pointerup', stopResize);
  handle.addEventListener('pointercancel', stopResize);

  // Double-click resets size to default
  handle.addEventListener('dblclick', () => {
    document.body.style.width = `${DEFAULT_WIDTH}px`;
    document.body.style.height = `${DEFAULT_HEIGHT}px`;
    try {
      localStorage.setItem(
        'purity_inspector_size',
        JSON.stringify({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }),
      );
    } catch {}
    if (currentTab === 'reactivity') {
      setTimeout(drawCurrentReactivityLines, 50);
    }
  });
}

/**
 * ----------------------------------------------------
 * UI INITIALIZATION & TAB CONTROLS
 * ----------------------------------------------------
 */
function initUI() {
  const tabBtnComponents = document.getElementById('tab-btn-components');
  const tabBtnServices = document.getElementById('tab-btn-services');
  const tabBtnReactivity = document.getElementById('tab-btn-reactivity');

  tabBtnComponents?.addEventListener('click', () => switchTab('components'));
  tabBtnServices?.addEventListener('click', () => switchTab('services'));
  tabBtnReactivity?.addEventListener('click', () => switchTab('reactivity'));

  document.getElementById('btn-refresh')?.addEventListener('click', () => refreshInspection());
  document.getElementById('btn-retry-detect')?.addEventListener('click', () => refreshInspection());

  // Search Inputs
  document.getElementById('comp-search-input')?.addEventListener('input', (e) => {
    compSearchQuery = (e.target.value || '').trim().toLowerCase();
    renderComponentsList();
  });

  document.getElementById('serv-search-input')?.addEventListener('input', (e) => {
    servSearchQuery = (e.target.value || '').trim().toLowerCase();
    renderServicesList();
  });

  const reactCompSearch = document.getElementById('react-comp-search');
  reactCompSearch?.addEventListener('input', (e) => {
    reactCompSearchQuery = (e.target.value || '').trim().toLowerCase();
    renderReactivityComponentChips();
  });

  reactCompSearch?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const matching = getFilteredComponentsForReactivity();
      if (matching.length > 0) {
        selectReactivityComponent(matching[0].name);
      }
    }
  });

  document.getElementById('btn-react-clear')?.addEventListener('click', () => {
    clearReactivityComponentSelection();
  });

  document.getElementById('btn-comp-view-reactivity')?.addEventListener('click', () => {
    if (selectedComponentName) {
      selectReactivityComponent(selectedComponentName);
      switchTab('reactivity');
    }
  });

  // Re-draw curves on scroll or container resize
  const graphContainer = document.getElementById('reactivity-graph-container');
  graphContainer?.addEventListener('scroll', () => {
    if (currentTab === 'reactivity') {
      requestAnimationFrame(drawCurrentReactivityLines);
    }
  });

  window.addEventListener('resize', () => {
    if (currentTab === 'reactivity') {
      requestAnimationFrame(drawCurrentReactivityLines);
    }
  });
}

function switchTab(tab) {
  currentTab = tab;

  const tabBtnComponents = document.getElementById('tab-btn-components');
  const tabBtnServices = document.getElementById('tab-btn-services');
  const tabBtnReactivity = document.getElementById('tab-btn-reactivity');

  const viewComponents = document.getElementById('view-components');
  const viewServices = document.getElementById('view-services');
  const viewReactivity = document.getElementById('view-reactivity');

  tabBtnComponents?.classList.toggle('active', tab === 'components');
  tabBtnServices?.classList.toggle('active', tab === 'services');
  tabBtnReactivity?.classList.toggle('active', tab === 'reactivity');

  viewComponents?.classList.toggle('hidden', tab !== 'components');
  viewServices?.classList.toggle('hidden', tab !== 'services');
  viewReactivity?.classList.toggle('hidden', tab !== 'reactivity');

  if (tab === 'reactivity') {
    renderReactivityComponentChips();
    renderReactivityView();
  }
}

/**
 * ----------------------------------------------------
 * INSPECTOR RUNNER & TELEMETRY FETCH
 * ----------------------------------------------------
 */
async function refreshInspection() {
  const badge = document.getElementById('app-badge');
  if (badge) {
    badge.className = 'badge badge-checking';
    badge.textContent = 'Inspecting...';
  }

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || !activeTab.id) {
      showNotDetectedState();
      return;
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      world: 'MAIN',
      func: inspectPurityAppInPage,
    });

    const data = results?.[0]?.result;

    if (!data || !data.detected) {
      showNotDetectedState();
    } else {
      currentSnapshot = data;
      showDetectedState(data);
    }
  } catch (err) {
    console.error('[Purity Inspector] Failed to execute inspector:', err);
    showNotDetectedState();
  }
}

function showNotDetectedState() {
  const badge = document.getElementById('app-badge');
  if (badge) {
    badge.className = 'badge badge-warning';
    badge.textContent = 'Not Detected';
  }

  document.getElementById('nav-tabs')?.classList.add('hidden');
  document.getElementById('view-not-detected')?.classList.remove('hidden');
  document.getElementById('view-components')?.classList.add('hidden');
  document.getElementById('view-services')?.classList.add('hidden');
  document.getElementById('view-reactivity')?.classList.add('hidden');
}

function showDetectedState(data) {
  const badge = document.getElementById('app-badge');
  if (badge) {
    badge.className = 'badge badge-success';
    badge.textContent = `Purity ${data.version || '2.0.2'}`;
  }

  document.getElementById('nav-tabs')?.classList.remove('hidden');
  document.getElementById('view-not-detected')?.classList.add('hidden');

  // Update tab badge counts
  const compCount = document.getElementById('badge-comp-count');
  if (compCount) compCount.textContent = String(data.components.length);

  const servCount = document.getElementById('badge-serv-count');
  if (servCount) servCount.textContent = String(data.services.length);

  const reactCount = document.getElementById('badge-react-count');
  const totalLinks = data.reactivityGraph?.length || 0;
  if (reactCount) reactCount.textContent = String(totalLinks);

  // Populate component quick-filter chips for Reactivity Tab
  renderReactivityComponentChips();

  // Render Components and Services
  renderComponentsList();
  renderServicesList();

  if (!selectedComponentName && data.components.length > 0) {
    selectComponent(data.components[0].name);
  } else if (selectedComponentName) {
    selectComponent(selectedComponentName);
  }

  if (!selectedServiceName && data.services.length > 0) {
    selectService(data.services[0].name);
  } else if (selectedServiceName) {
    selectService(selectedServiceName);
  }

  if (selectedReactComponentName) {
    selectReactivityComponent(selectedReactComponentName);
  }

  switchTab(currentTab);
}

/**
 * ----------------------------------------------------
 * 1. COMPONENTS TAB VIEW
 * ----------------------------------------------------
 */
function renderComponentsList() {
  const listEl = document.getElementById('comp-items-list');
  if (!listEl || !currentSnapshot) return;

  listEl.innerHTML = '';

  const filtered = currentSnapshot.components.filter((c) => {
    if (!compSearchQuery) return true;
    return (
      c.name.toLowerCase().includes(compSearchQuery) ||
      c.selector.toLowerCase().includes(compSearchQuery)
    );
  });

  if (filtered.length === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.className = 'empty-notice';
    emptyNotice.textContent = 'No matching components.';
    listEl.appendChild(emptyNotice);
    return;
  }

  filtered.forEach((comp) => {
    const row = document.createElement('div');
    row.className = `item-row ${comp.name === selectedComponentName ? 'selected' : ''}`;
    row.addEventListener('click', () => selectComponent(comp.name));

    const header = document.createElement('div');
    header.className = 'item-row-header';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-row-name';
    nameSpan.textContent = comp.name;

    const tagSpan = document.createElement('span');
    tagSpan.className = 'item-row-tag';
    tagSpan.textContent = `<${comp.selector}>`;

    header.appendChild(nameSpan);
    header.appendChild(tagSpan);
    row.appendChild(header);

    const badges = document.createElement('div');
    badges.className = 'item-row-badges';

    if (comp.services.length > 0) {
      const sBadge = document.createElement('span');
      sBadge.className = 'mini-badge';
      sBadge.textContent = `${comp.services.length} ${comp.services.length === 1 ? 'service' : 'services'}`;
      badges.appendChild(sBadge);
    }

    if (comp.signals.length > 0) {
      const sigBadge = document.createElement('span');
      sigBadge.className = 'mini-badge';
      sigBadge.textContent = `${comp.signals.length} ${comp.signals.length === 1 ? 'signal' : 'signals'}`;
      badges.appendChild(sigBadge);
    }

    if (comp.effects.length > 0) {
      const effBadge = document.createElement('span');
      effBadge.className = 'mini-badge';
      effBadge.textContent = `${comp.effects.length} ${comp.effects.length === 1 ? 'effect' : 'effects'}`;
      badges.appendChild(effBadge);
    }

    row.appendChild(badges);
    listEl.appendChild(row);
  });
}

function selectComponent(compName) {
  selectedComponentName = compName;
  renderComponentsList();

  const comp = currentSnapshot?.components.find((c) => c.name === compName);
  const placeholder = document.getElementById('comp-detail-empty');
  const content = document.getElementById('comp-detail-content');

  if (!comp) {
    placeholder?.classList.remove('hidden');
    content?.classList.add('hidden');
    return;
  }

  placeholder?.classList.add('hidden');
  content?.classList.remove('hidden');

  const nameEl = document.getElementById('comp-detail-name');
  if (nameEl) nameEl.textContent = comp.name;

  const selectorEl = document.getElementById('comp-detail-selector');
  if (selectorEl) selectorEl.textContent = `<${comp.selector}>`;

  const countEl = document.getElementById('comp-detail-count');
  if (countEl) {
    countEl.textContent = `${comp.elementCount} ${comp.elementCount === 1 ? 'instance' : 'instances'} in DOM`;
  }

  // 1. Injected Services
  const servicesList = document.getElementById('comp-services-list');
  const servicesCount = document.getElementById('comp-services-count');
  if (servicesCount) servicesCount.textContent = String(comp.services.length);

  if (servicesList) {
    servicesList.innerHTML = '';
    if (comp.services.length === 0) {
      servicesList.innerHTML = '<span class="empty-notice">No services injected directly into this component.</span>';
    } else {
      comp.services.forEach((srv) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.title = `Switch to ${srv.name} in Services Tab`;
        card.addEventListener('click', () => {
          selectService(srv.name);
          switchTab('services');
        });

        const info = document.createElement('div');
        info.className = 'service-card-info';

        const srvName = document.createElement('span');
        srvName.className = 'service-card-name';
        srvName.textContent = srv.name;

        info.appendChild(srvName);
        if (srv.propertyKey) {
          const propKey = document.createElement('span');
          propKey.className = 'service-card-prop';
          propKey.textContent = `this.${srv.propertyKey}`;
          info.appendChild(propKey);
        }

        const arrow = document.createElement('span');
        arrow.style.color = 'var(--accent-color)';
        arrow.style.fontSize = '12px';
        arrow.textContent = '→';

        card.appendChild(info);
        card.appendChild(arrow);
        servicesList.appendChild(card);
      });
    }
  }

  // 2. Signals & Computed
  const signalsList = document.getElementById('comp-signals-list');
  const signalsCount = document.getElementById('comp-signals-count');
  if (signalsCount) signalsCount.textContent = String(comp.signals.length);

  if (signalsList) {
    signalsList.innerHTML = '';
    if (comp.signals.length === 0) {
      signalsList.innerHTML = '<span class="empty-notice">No signals defined on this component.</span>';
    } else {
      comp.signals.forEach((sig) => {
        const row = document.createElement('div');
        row.className = 'signal-row';

        const left = document.createElement('div');
        left.className = 'signal-left';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'signal-name';
        nameSpan.textContent = sig.name;

        const typePill = document.createElement('span');
        typePill.className = `sig-type-pill ${sig.type === 'computed' ? 'sig-computed' : 'sig-signal'}`;
        typePill.textContent = sig.type;

        left.appendChild(nameSpan);
        left.appendChild(typePill);

        const valBadge = document.createElement('span');
        valBadge.className = 'signal-val-badge';
        valBadge.textContent = formatValue(sig.value);

        if (typeof sig.value === 'boolean') {
          valBadge.classList.add('val-boolean');
        } else if (typeof sig.value === 'string') {
          valBadge.classList.add('val-string');
        } else if (typeof sig.value === 'number') {
          valBadge.classList.add('val-number');
        }

        row.appendChild(left);
        row.appendChild(valBadge);
        signalsList.appendChild(row);
      });
    }
  }

  // 3. Effects & Directives
  const effectsList = document.getElementById('comp-effects-list');
  const effectsCount = document.getElementById('comp-effects-count');
  if (effectsCount) effectsCount.textContent = String(comp.effects.length);

  if (effectsList) {
    effectsList.innerHTML = '';
    if (comp.effects.length === 0) {
      effectsList.innerHTML = '<span class="empty-notice">No reactive effects or directives attached.</span>';
    } else {
      comp.effects.forEach((eff) => {
        const row = document.createElement('div');
        row.className = 'effect-row';

        const effName = document.createElement('span');
        effName.className = 'effect-name';
        effName.textContent = eff.description;

        const status = document.createElement('span');
        status.className = 'effect-status';
        status.innerHTML = '<span class="status-dot-sm"></span> Active';

        row.appendChild(effName);
        row.appendChild(status);
        effectsList.appendChild(row);
      });
    }
  }
}

/**
 * ----------------------------------------------------
 * 2. SERVICES TAB VIEW
 * ----------------------------------------------------
 */
function renderServicesList() {
  const listEl = document.getElementById('serv-items-list');
  if (!listEl || !currentSnapshot) return;

  listEl.innerHTML = '';

  const filtered = currentSnapshot.services.filter((s) => {
    if (!servSearchQuery) return true;
    return s.name.toLowerCase().includes(servSearchQuery);
  });

  if (filtered.length === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.className = 'empty-notice';
    emptyNotice.textContent = 'No matching services.';
    listEl.appendChild(emptyNotice);
    return;
  }

  filtered.forEach((serv) => {
    const row = document.createElement('div');
    row.className = `item-row ${serv.name === selectedServiceName ? 'selected' : ''}`;
    row.addEventListener('click', () => selectService(serv.name));

    const header = document.createElement('div');
    header.className = 'item-row-header';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'item-row-name';
    nameSpan.textContent = serv.name;

    const tagSpan = document.createElement('span');
    tagSpan.className = 'item-row-tag';
    tagSpan.textContent = '@Injectable';

    header.appendChild(nameSpan);
    header.appendChild(tagSpan);
    row.appendChild(header);

    const badges = document.createElement('div');
    badges.className = 'item-row-badges';

    const depBadge = document.createElement('span');
    depBadge.className = 'mini-badge';
    depBadge.textContent = `${serv.dependencies.length} deps`;
    badges.appendChild(depBadge);

    const usedBadge = document.createElement('span');
    usedBadge.className = 'mini-badge';
    usedBadge.textContent = `${serv.dependents.length} used by`;
    badges.appendChild(usedBadge);

    if (serv.signals.length > 0) {
      const sigBadge = document.createElement('span');
      sigBadge.className = 'mini-badge';
      sigBadge.textContent = `${serv.signals.length} signals`;
      badges.appendChild(sigBadge);
    }

    row.appendChild(badges);
    listEl.appendChild(row);
  });
}

function selectService(servName) {
  selectedServiceName = servName;
  renderServicesList();

  const serv = currentSnapshot?.services.find((s) => s.name === servName);
  const placeholder = document.getElementById('serv-detail-empty');
  const content = document.getElementById('serv-detail-content');

  if (!serv) {
    placeholder?.classList.remove('hidden');
    content?.classList.add('hidden');
    return;
  }

  placeholder?.classList.add('hidden');
  content?.classList.remove('hidden');

  const nameEl = document.getElementById('serv-detail-name');
  if (nameEl) nameEl.textContent = serv.name;

  // 1. Service Dependencies (Depends On)
  const depsList = document.getElementById('serv-deps-list');
  const depsCount = document.getElementById('serv-deps-count');
  if (depsCount) depsCount.textContent = String(serv.dependencies.length);

  if (depsList) {
    depsList.innerHTML = '';
    if (serv.dependencies.length === 0) {
      depsList.innerHTML = '<span class="empty-notice">No service dependencies (root service).</span>';
    } else {
      serv.dependencies.forEach((depName) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.title = `Inspect ${depName}`;
        card.addEventListener('click', () => selectService(depName));

        const info = document.createElement('div');
        info.className = 'service-card-info';

        const srvName = document.createElement('span');
        srvName.className = 'service-card-name';
        srvName.textContent = depName;

        info.appendChild(srvName);

        const arrow = document.createElement('span');
        arrow.style.color = 'var(--accent-color)';
        arrow.style.fontSize = '12px';
        arrow.textContent = '→';

        card.appendChild(info);
        card.appendChild(arrow);
        depsList.appendChild(card);
      });
    }
  }

  // 2. Depended On By (Used By)
  const dependentsList = document.getElementById('serv-dependents-list');
  const dependentsCount = document.getElementById('serv-dependents-count');
  if (dependentsCount) dependentsCount.textContent = String(serv.dependents.length);

  if (dependentsList) {
    dependentsList.innerHTML = '';
    if (serv.dependents.length === 0) {
      dependentsList.innerHTML = '<span class="empty-notice">Not currently injected by any component or service.</span>';
    } else {
      serv.dependents.forEach((depName) => {
        const card = document.createElement('div');
        card.className = 'service-card';

        const isComponent = currentSnapshot?.components.some((c) => c.name === depName);
        card.title = isComponent ? `Go to Component ${depName}` : `Go to Service ${depName}`;
        card.addEventListener('click', () => {
          if (isComponent) {
            selectComponent(depName);
            switchTab('components');
          } else {
            selectService(depName);
          }
        });

        const info = document.createElement('div');
        info.className = 'service-card-info';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'service-card-name';
        nameSpan.textContent = depName;

        const tagSpan = document.createElement('span');
        tagSpan.className = 'service-card-prop';
        tagSpan.textContent = isComponent ? 'Component' : 'Service';

        info.appendChild(nameSpan);
        info.appendChild(tagSpan);

        const arrow = document.createElement('span');
        arrow.style.color = 'var(--accent-color)';
        arrow.style.fontSize = '12px';
        arrow.textContent = '↗';

        card.appendChild(info);
        card.appendChild(arrow);
        dependentsList.appendChild(card);
      });
    }
  }

  // 3. Service Signals
  const signalsList = document.getElementById('serv-signals-list');
  const signalsCount = document.getElementById('serv-signals-count');
  if (signalsCount) signalsCount.textContent = String(serv.signals.length);

  if (signalsList) {
    signalsList.innerHTML = '';
    if (serv.signals.length === 0) {
      signalsList.innerHTML = '<span class="empty-notice">No signals owned by this service.</span>';
    } else {
      serv.signals.forEach((sig) => {
        const row = document.createElement('div');
        row.className = 'signal-row';

        const left = document.createElement('div');
        left.className = 'signal-left';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'signal-name';
        nameSpan.textContent = sig.name;

        const typePill = document.createElement('span');
        typePill.className = `sig-type-pill ${sig.type === 'computed' ? 'sig-computed' : 'sig-signal'}`;
        typePill.textContent = sig.type;

        left.appendChild(nameSpan);
        left.appendChild(typePill);

        const valBadge = document.createElement('span');
        valBadge.className = 'signal-val-badge';
        valBadge.textContent = formatValue(sig.value);

        if (typeof sig.value === 'boolean') {
          valBadge.classList.add('val-boolean');
        } else if (typeof sig.value === 'string') {
          valBadge.classList.add('val-string');
        } else if (typeof sig.value === 'number') {
          valBadge.classList.add('val-number');
        }

        row.appendChild(left);
        row.appendChild(valBadge);
        signalsList.appendChild(row);
      });
    }
  }
}

/**
 * ----------------------------------------------------
 * 3. REACTIVITY GRAPH TAB VIEW (FILTERED BY COMPONENT FOR PERFORMANCE)
 * ----------------------------------------------------
 */

function getFilteredComponentsForReactivity() {
  if (!currentSnapshot || !currentSnapshot.components) return [];
  return currentSnapshot.components.filter((c) => {
    if (!reactCompSearchQuery) return true;
    return (
      c.name.toLowerCase().includes(reactCompSearchQuery) ||
      c.selector.toLowerCase().includes(reactCompSearchQuery)
    );
  });
}

function renderReactivityComponentChips() {
  const container = document.getElementById('react-comp-chips');
  if (!container || !currentSnapshot) return;

  container.innerHTML = '';
  const components = getFilteredComponentsForReactivity();

  if (components.length === 0) {
    const emptyNotice = document.createElement('span');
    emptyNotice.className = 'empty-notice';
    emptyNotice.style.padding = '2px 8px';
    emptyNotice.textContent = 'No matching components.';
    container.appendChild(emptyNotice);
    return;
  }

  components.forEach((comp) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    const isSelected = comp.name === selectedReactComponentName;
    chip.className = `chip-btn ${isSelected ? 'active' : ''}`;
    chip.dataset.compName = comp.name;

    const count = (comp.signals?.length || 0) + (comp.effects?.length || 0);
    chip.innerHTML = `${comp.name} <span class="chip-badge">${count}</span>`;
    chip.title = `${comp.name} (${comp.signals?.length || 0} signals, ${comp.effects?.length || 0} effects)`;

    chip.addEventListener('click', () => {
      selectReactivityComponent(comp.name);
    });

    container.appendChild(chip);
  });
}

function selectReactivityComponent(compName) {
  selectedReactComponentName = compName;
  renderReactivityComponentChips();

  const activeChip = document.querySelector(`#react-comp-chips .chip-btn[data-comp-name="${compName}"]`);
  activeChip?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });

  renderReactivityView();
}

function clearReactivityComponentSelection() {
  selectedReactComponentName = null;
  renderReactivityComponentChips();
  renderReactivityView();
}

function renderReactivityView() {
  if (!currentSnapshot) return;

  const promptEl = document.getElementById('reactivity-prompt');
  const bannerEl = document.getElementById('react-active-banner');
  const emptyEl = document.getElementById('reactivity-empty');
  const canvasWrap = document.getElementById('reactivity-canvas-wrap');
  const signalsCol = document.getElementById('graph-signals-nodes');
  const effectsCol = document.getElementById('graph-effects-nodes');

  if (!promptEl || !bannerEl || !emptyEl || !canvasWrap || !signalsCol || !effectsCol) return;

  signalsCol.innerHTML = '';
  effectsCol.innerHTML = '';
  clearReactivityLines();

  // Case 1: No component chosen yet -> show prompt, keep DOM lightweight & fast
  if (!selectedReactComponentName) {
    promptEl.classList.remove('hidden');
    bannerEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    canvasWrap.classList.add('hidden');
    return;
  }

  // Case 2: Component selected
  const comp = currentSnapshot.components.find((c) => c.name === selectedReactComponentName);
  if (!comp) {
    promptEl.classList.remove('hidden');
    bannerEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    canvasWrap.classList.add('hidden');
    return;
  }

  // Hide prompt, show banner
  promptEl.classList.add('hidden');
  bannerEl.classList.remove('hidden');

  // Update banner text
  const bannerName = document.getElementById('react-active-comp-name');
  if (bannerName) bannerName.textContent = comp.name;

  const bannerTag = document.getElementById('react-active-comp-tag');
  if (bannerTag) bannerTag.textContent = `<${comp.selector}>`;

  // Filter links for this component
  const rawLinks = currentSnapshot.reactivityGraph || [];
  const compLinks = rawLinks.filter((link) => {
    return link.source === comp.name || link.targetComponent === comp.name;
  });

  // Update banner metrics
  const metricSig = document.getElementById('react-metric-signals');
  if (metricSig) metricSig.textContent = `${comp.signals.length} ${comp.signals.length === 1 ? 'signal' : 'signals'}`;

  const metricEff = document.getElementById('react-metric-effects');
  if (metricEff) metricEff.textContent = `${comp.effects.length} ${comp.effects.length === 1 ? 'effect' : 'effects'}`;

  const metricLinks = document.getElementById('react-metric-links');
  if (metricLinks) metricLinks.textContent = `${compLinks.length} ${compLinks.length === 1 ? 'connection' : 'connections'}`;

  // If component has neither signals nor effects
  if (comp.signals.length === 0 && comp.effects.length === 0) {
    emptyEl.classList.remove('hidden');
    const emptySpan = emptyEl.querySelector('span');
    if (emptySpan) emptySpan.textContent = `No reactive signals or effects found on <${comp.selector}>.`;
    canvasWrap.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  canvasWrap.classList.remove('hidden');

  // Update node counts
  const sigCountEl = document.getElementById('signals-node-count');
  if (sigCountEl) sigCountEl.textContent = String(comp.signals.length);

  // 1. Render Signal Nodes for this chosen component
  comp.signals.forEach((sig) => {
    const sigKey = `${comp.name}.${sig.name}`;
    const node = document.createElement('div');
    node.className = 'graph-node';
    node.setAttribute('data-node-type', 'signal');
    node.setAttribute('data-sig-key', sigKey);
    node.setAttribute('data-sig-name', sig.name);

    const header = document.createElement('div');
    header.className = 'node-header';

    const title = document.createElement('span');
    title.className = 'node-title';
    title.textContent = sig.name;

    const pill = document.createElement('span');
    pill.className = `sig-type-pill ${sig.type === 'computed' ? 'sig-computed' : 'sig-signal'}`;
    pill.textContent = sig.type;

    header.appendChild(title);
    header.appendChild(pill);
    node.appendChild(header);

    const source = document.createElement('span');
    source.className = 'node-source';
    source.textContent = `component: <${comp.selector}>`;
    node.appendChild(source);

    if (sig.value !== undefined && sig.value !== null) {
      const valBadge = document.createElement('span');
      valBadge.className = 'signal-val-badge';
      valBadge.textContent = formatValue(sig.value);
      node.appendChild(valBadge);
    }

    // Right port anchor
    const port = document.createElement('div');
    port.className = 'port-anchor port-right';
    node.appendChild(port);

    // Hover highlight
    node.addEventListener('mouseenter', () => highlightReactiveGroup(sigKey, null));
    node.addEventListener('mouseleave', () => unhighlightAll());

    signalsCol.appendChild(node);
  });

  // 2. Render Effect Nodes for this chosen component
  const effectMap = new Map();
  comp.effects.forEach((eff) => {
    effectMap.set(eff.id, {
      id: eff.id,
      description: eff.description,
      targetComponent: comp.name,
    });
  });

  compLinks.forEach((link) => {
    if (link.targetComponent === comp.name && !effectMap.has(link.effectId)) {
      let alreadyHasDesc = false;
      for (const existing of effectMap.values()) {
        if (existing.description === link.effectDescription) {
          alreadyHasDesc = true;
          break;
        }
      }
      if (!alreadyHasDesc) {
        effectMap.set(link.effectId, {
          id: link.effectId,
          description: link.effectDescription,
          targetComponent: comp.name,
        });
      }
    }
  });

  const effCountEl = document.getElementById('effects-node-count');
  if (effCountEl) effCountEl.textContent = String(effectMap.size);

  effectMap.forEach((eff) => {
    const effKey = `${comp.name}.${eff.id}`;
    const node = document.createElement('div');
    node.className = 'graph-node';
    node.setAttribute('data-node-type', 'effect');
    node.setAttribute('data-eff-key', effKey);
    node.setAttribute('data-eff-id', eff.id);
    node.setAttribute('data-eff-desc', eff.description);

    // Left port anchor
    const port = document.createElement('div');
    port.className = 'port-anchor port-left';
    node.appendChild(port);

    const header = document.createElement('div');
    header.className = 'node-header';

    const title = document.createElement('span');
    title.className = 'node-subtext';
    title.textContent = eff.description;

    header.appendChild(title);
    node.appendChild(header);

    const target = document.createElement('span');
    target.className = 'node-source';
    target.textContent = `target: <${comp.selector}>`;
    node.appendChild(target);

    // Hover highlight
    node.addEventListener('mouseenter', () => highlightReactiveGroup(null, effKey));
    node.addEventListener('mouseleave', () => unhighlightAll());

    effectsCol.appendChild(node);
  });

  // Schedule drawing SVG connection lines after nodes mount
  setTimeout(drawCurrentReactivityLines, 40);
}

function clearReactivityLines() {
  const svg = document.getElementById('reactivity-svg');
  if (!svg) return;
  const paths = svg.querySelectorAll('.react-link-path');
  paths.forEach((p) => p.remove());
}

function drawCurrentReactivityLines() {
  const svg = document.getElementById('reactivity-svg');
  const canvasWrap = document.getElementById('reactivity-canvas-wrap');
  if (!svg || !canvasWrap || currentTab !== 'reactivity' || !selectedReactComponentName || !currentSnapshot) return;

  clearReactivityLines();

  const wrapRect = canvasWrap.getBoundingClientRect();
  if (wrapRect.width === 0 || wrapRect.height === 0) return;

  svg.setAttribute('width', String(wrapRect.width));
  svg.setAttribute('height', String(wrapRect.height));

  const comp = currentSnapshot.components.find((c) => c.name === selectedReactComponentName);
  if (!comp) return;

  const rawLinks = currentSnapshot.reactivityGraph || [];
  const compLinks = rawLinks.filter((link) => {
    return link.source === comp.name || link.targetComponent === comp.name;
  });

  compLinks.forEach((link) => {
    const sigKey = `${link.source}.${link.signalName}`;
    const effKey = `${link.targetComponent}.${link.effectId}`;

    const sigNode = document.querySelector(`[data-sig-key="${sigKey}"]`) ||
                    document.querySelector(`[data-sig-name="${link.signalName}"]`);

    let effNode = document.querySelector(`[data-eff-key="${effKey}"]`) ||
                  document.querySelector(`[data-eff-id="${link.effectId}"]`);

    if (!effNode && link.effectDescription) {
      effNode = document.querySelector(`[data-eff-desc="${CSS.escape(link.effectDescription)}"]`);
    }

    if (!sigNode || !effNode) return;

    const sigPort = sigNode.querySelector('.port-right');
    const effPort = effNode.querySelector('.port-left');

    if (!sigPort || !effPort) return;

    const sigRect = sigPort.getBoundingClientRect();
    const effRect = effPort.getBoundingClientRect();

    const x1 = sigRect.left + sigRect.width / 2 - wrapRect.left;
    const y1 = sigRect.top + sigRect.height / 2 - wrapRect.top;

    const x2 = effRect.left + effRect.width / 2 - wrapRect.left;
    const y2 = effRect.top + effRect.height / 2 - wrapRect.top;

    // Cubic Bézier curve
    const dx = Math.abs(x2 - x1) * 0.55;
    const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'react-link-path');
    path.setAttribute('data-link-sig', sigNode.getAttribute('data-sig-key') || sigKey);
    path.setAttribute('data-link-eff', effNode.getAttribute('data-eff-key') || effKey);

    svg.appendChild(path);
  });
}

function highlightReactiveGroup(activeSigKey, activeEffKey) {
  const allNodes = document.querySelectorAll('.graph-node');
  const allPaths = document.querySelectorAll('.react-link-path');

  allNodes.forEach((n) => n.classList.remove('active-highlight'));
  allPaths.forEach((p) => p.classList.remove('highlighted'));

  if (activeSigKey) {
    const sigNode = document.querySelector(`[data-sig-key="${activeSigKey}"]`);
    sigNode?.classList.add('active-highlight');

    allPaths.forEach((path) => {
      if (path.getAttribute('data-link-sig') === activeSigKey) {
        path.classList.add('highlighted');
        const effKey = path.getAttribute('data-link-eff');
        if (effKey) {
          const effNode = document.querySelector(`[data-eff-key="${effKey}"]`);
          effNode?.classList.add('active-highlight');
        }
      }
    });
  } else if (activeEffKey) {
    const effNode = document.querySelector(`[data-eff-key="${activeEffKey}"]`);
    effNode?.classList.add('active-highlight');

    allPaths.forEach((path) => {
      if (path.getAttribute('data-link-eff') === activeEffKey) {
        path.classList.add('highlighted');
        const sigKey = path.getAttribute('data-link-sig');
        if (sigKey) {
          const sigNode = document.querySelector(`[data-sig-key="${sigKey}"]`);
          sigNode?.classList.add('active-highlight');
        }
      }
    });
  }
}

function unhighlightAll() {
  const allNodes = document.querySelectorAll('.graph-node');
  const allPaths = document.querySelectorAll('.react-link-path');

  allNodes.forEach((n) => n.classList.remove('active-highlight'));
  allPaths.forEach((p) => p.classList.remove('highlighted'));
}

function formatValue(val) {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return `"${val}"`;
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '[Object]';
    }
  }
  return String(val);
}
