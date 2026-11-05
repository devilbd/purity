/**
 * Purity DevTools - Main Panel Controller (Running in Chrome Developer Tools Tab)
 */

// Application state
let currentSnapshot = null;
let selectedComponentName = null;
let selectedServiceName = null;
let selectedReactComponentName = null;
let selectedMetricsComponentName = null;
let currentTab = 'components'; // 'components' | 'services' | 'reactivity' | 'metrics'
let compSearchQuery = '';
let servSearchQuery = '';
let reactCompSearchQuery = '';
let metricsCompSearchQuery = '';

// Metrics Recording state
let isRecording = false;
let recordingTimerInterval = null;
let recordingPollInterval = null;
let recordingStartTime = 0;
let lastRecordedSession = null;

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  refreshInspection();

  // Listen for inspected page reloads / navigations
  if (typeof chrome !== 'undefined' && chrome.devtools?.network?.onNavigated) {
    chrome.devtools.network.onNavigated.addListener(() => {
      refreshInspection();
    });
  }
});

/**
 * Resolves the inspected page's Tab ID inside Chrome DevTools or standalone Tab mode.
 */
async function getInspectedTabId() {
  if (typeof chrome !== 'undefined' && chrome.devtools?.inspectedWindow?.tabId) {
    return chrome.devtools.inspectedWindow.tabId;
  }
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.query === 'function') {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      const target = tabs.find((t) => t.url && !t.url.startsWith('chrome') && !t.url.startsWith('about:'));
      if (target?.id) return target.id;
      const allTabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
      if (allTabs && allTabs.length > 0) {
        const local = allTabs.find((t) => t.url && (t.url.includes('localhost') || t.url.includes('127.0.0.1')));
        return local?.id || allTabs[0].id;
      }
    }
  } catch (err) {
    console.warn('[Purity DevTools] getInspectedTabId error:', err);
  }
  return null;
}

/**
 * Executes a function in the inspected page's MAIN world context.
 */
async function executeInInspectedPage(func, args = []) {
  // 1. Inside Chrome DevTools: Use native inspectedWindow.eval (no tabId or scripting permission needed)
  if (typeof chrome !== 'undefined' && chrome.devtools?.inspectedWindow && typeof chrome.devtools.inspectedWindow.eval === 'function') {
    const argsJson = args.map((a) => JSON.stringify(a)).join(', ');
    const code = `(${func.toString()})(${argsJson})`;
    return new Promise((resolve) => {
      chrome.devtools.inspectedWindow.eval(code, (result, isException) => {
        if (isException) {
          console.warn('[Purity DevTools] inspectedWindow.eval exception:', isException);
          resolve(null);
        } else {
          resolve(result);
        }
      });
    });
  }

  // 2. Standalone Browser Tab mode fallback: Use chrome.scripting.executeScript
  const tabId = await getInspectedTabId();

  if (tabId && typeof chrome !== 'undefined' && chrome.scripting && typeof chrome.scripting.executeScript === 'function') {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        func,
        args,
      });
      if (results && results[0]) {
        return results[0].result;
      }
    } catch (err) {
      console.warn('[Purity DevTools] executeScript fallback error:', err);
    }
  }

  return null;
}

/**
 * ----------------------------------------------------
 * UI INITIALIZATION & EVENT HANDLERS
 * ----------------------------------------------------
 */
function initUI() {
  // Tab Bar navigation
  document.getElementById('tab-btn-components')?.addEventListener('click', () => switchTab('components'));
  document.getElementById('tab-btn-services')?.addEventListener('click', () => switchTab('services'));
  document.getElementById('tab-btn-reactivity')?.addEventListener('click', () => switchTab('reactivity'));
  document.getElementById('tab-btn-metrics')?.addEventListener('click', () => switchTab('metrics'));

  // Header Actions
  document.getElementById('btn-refresh')?.addEventListener('click', () => refreshInspection());
  document.getElementById('btn-retry-detect')?.addEventListener('click', () => refreshInspection());

  // Search Inputs
  const compSearch = document.getElementById('comp-search-input');
  compSearch?.addEventListener('input', (e) => {
    compSearchQuery = (e.target.value || '').trim().toLowerCase();
    renderComponentsList();
  });

  const servSearch = document.getElementById('serv-search-input');
  servSearch?.addEventListener('input', (e) => {
    servSearchQuery = (e.target.value || '').trim().toLowerCase();
    renderServicesList();
  });

  // Reactivity Search & Chips
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

  // Metrics Inputs & Buttons
  const metricsCompSearch = document.getElementById('metrics-comp-search');
  metricsCompSearch?.addEventListener('input', (e) => {
    metricsCompSearchQuery = (e.target.value || '').trim().toLowerCase();
    renderMetricsComponentChips();
  });

  metricsCompSearch?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const matching = getFilteredComponentsForMetrics();
      if (matching.length > 0) {
        selectMetricsComponent(matching[0].name);
      }
    }
  });

  document.getElementById('btn-metrics-clear')?.addEventListener('click', () => {
    clearMetricsComponentSelection();
  });

  document.getElementById('btn-metrics-record')?.addEventListener('click', () => {
    toggleMetricsRecording();
  });

  document.getElementById('btn-metrics-benchmark')?.addEventListener('click', () => {
    runMetricsBenchmark();
  });

  document.getElementById('btn-comp-view-metrics')?.addEventListener('click', () => {
    if (selectedComponentName) {
      selectMetricsComponent(selectedComponentName);
      switchTab('metrics');
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
  const tabBtnMetrics = document.getElementById('tab-btn-metrics');

  const viewComponents = document.getElementById('view-components');
  const viewServices = document.getElementById('view-services');
  const viewReactivity = document.getElementById('view-reactivity');
  const viewMetrics = document.getElementById('view-metrics');

  tabBtnComponents?.classList.toggle('active', tab === 'components');
  tabBtnServices?.classList.toggle('active', tab === 'services');
  tabBtnReactivity?.classList.toggle('active', tab === 'reactivity');
  tabBtnMetrics?.classList.toggle('active', tab === 'metrics');

  viewComponents?.classList.toggle('hidden', tab !== 'components');
  viewServices?.classList.toggle('hidden', tab !== 'services');
  viewReactivity?.classList.toggle('hidden', tab !== 'reactivity');
  viewMetrics?.classList.toggle('hidden', tab !== 'metrics');

  if (tab === 'reactivity') {
    renderReactivityComponentChips();
    renderReactivityView();
  } else if (tab === 'metrics') {
    renderMetricsComponentChips();
    renderMetricsView();
  }
}

/**
 * ----------------------------------------------------
 * INSPECTOR RUNNER & TELEMETRY FETCH
 * ----------------------------------------------------
 */
async function refreshInspection(silent = false) {
  const badge = document.getElementById('app-badge');
  if (badge && !silent) {
    badge.className = 'badge badge-checking';
    badge.textContent = 'Inspecting...';
  }

  try {
    const data = await executeInInspectedPage(inspectPurityAppInPage);

    if (!data || !data.detected) {
      if (!silent) showNotDetectedState();
    } else {
      currentSnapshot = data;
      if (silent) {
        if (currentTab === 'metrics') {
          renderMetricsView();
        }
      } else {
        showDetectedState(data);
      }
    }
  } catch (err) {
    console.error('[Purity DevTools] Failed to execute inspector:', err);
    if (!silent) {
      showNotDetectedState();
    }
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
  document.getElementById('view-metrics')?.classList.add('hidden');
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

  const metricsBadge = document.getElementById('badge-metrics-count');
  if (metricsBadge) {
    const avgInitialTime = data.components.length > 0
      ? (data.components.reduce((acc, c) => acc + (c.metrics?.initialRenderTimeMs || 0.8), 0) / data.components.length).toFixed(1)
      : '0';
    metricsBadge.textContent = `${avgInitialTime}ms`;
  }

  // Populate component quick-filter chips for Reactivity Tab & Metrics Tab
  renderReactivityComponentChips();
  renderMetricsComponentChips();

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

  if (!selectedMetricsComponentName && selectedComponentName) {
    selectedMetricsComponentName = selectedComponentName;
  }
  if (selectedMetricsComponentName) {
    selectMetricsComponent(selectedMetricsComponentName);
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
    listEl.innerHTML = '<div class="empty-notice" style="padding: 12px; text-align: center;">No components found.</div>';
    return;
  }

  filtered.forEach((comp) => {
    const row = document.createElement('div');
    row.className = `item-row ${comp.name === selectedComponentName ? 'active' : ''}`;
    row.addEventListener('click', () => selectComponent(comp.name));

    const main = document.createElement('div');
    main.className = 'item-main';

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = comp.name;

    const tag = document.createElement('span');
    tag.className = 'item-tag';
    tag.textContent = `<${comp.selector}>`;

    main.appendChild(name);
    main.appendChild(tag);

    const badges = document.createElement('div');
    badges.className = 'item-badges';

    if (comp.signals.length > 0) {
      const sBadge = document.createElement('span');
      sBadge.className = 'mini-badge';
      sBadge.title = `${comp.signals.length} signals`;
      sBadge.textContent = `${comp.signals.length}s`;
      badges.appendChild(sBadge);
    }

    if (comp.services.length > 0) {
      const srvBadge = document.createElement('span');
      srvBadge.className = 'mini-badge';
      srvBadge.title = `${comp.services.length} injected services`;
      srvBadge.textContent = `${comp.services.length}d`;
      badges.appendChild(srvBadge);
    }

    row.appendChild(main);
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
    listEl.innerHTML = '<div class="empty-notice" style="padding: 12px; text-align: center;">No services found.</div>';
    return;
  }

  filtered.forEach((serv) => {
    const row = document.createElement('div');
    row.className = `item-row ${serv.name === selectedServiceName ? 'active' : ''}`;
    row.addEventListener('click', () => selectService(serv.name));

    const main = document.createElement('div');
    main.className = 'item-main';

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = serv.name;

    const tag = document.createElement('span');
    tag.className = 'item-tag';
    tag.textContent = '@Injectable';

    main.appendChild(name);
    main.appendChild(tag);

    const badges = document.createElement('div');
    badges.className = 'item-badges';

    if (serv.dependencies.length > 0) {
      const depBadge = document.createElement('span');
      depBadge.className = 'mini-badge';
      depBadge.title = `Depends on ${serv.dependencies.length} other services`;
      depBadge.textContent = `${serv.dependencies.length} deps`;
      badges.appendChild(depBadge);
    }

    if (serv.dependents.length > 0) {
      const usedBadge = document.createElement('span');
      usedBadge.className = 'mini-badge';
      usedBadge.title = `Used by ${serv.dependents.length} components/services`;
      usedBadge.textContent = `${serv.dependents.length} used`;
      badges.appendChild(usedBadge);
    }

    row.appendChild(main);
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
      depsList.innerHTML = '<span class="empty-notice">This service has no dependencies on other services.</span>';
    } else {
      serv.dependencies.forEach((depName) => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.title = `Switch to ${depName}`;
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

  // 2. Service Dependents (Used By)
  const dependentsList = document.getElementById('serv-dependents-list');
  const dependentsCount = document.getElementById('serv-dependents-count');
  if (dependentsCount) dependentsCount.textContent = String(serv.dependents.length);

  if (dependentsList) {
    dependentsList.innerHTML = '';
    if (serv.dependents.length === 0) {
      dependentsList.innerHTML = '<span class="empty-notice">No registered components or services are currently injecting this service.</span>';
    } else {
      serv.dependents.forEach((depName) => {
        const card = document.createElement('div');
        card.className = 'service-card';

        const isComponent = currentSnapshot.components.some((c) => c.name === depName);
        card.title = isComponent ? `Go to ${depName} component` : `Switch to ${depName} service`;

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

        const srvName = document.createElement('span');
        srvName.className = 'service-card-name';
        srvName.textContent = depName;

        info.appendChild(srvName);

        const badge = document.createElement('span');
        badge.className = 'mini-badge';
        badge.textContent = isComponent ? 'Component' : 'Service';

        card.appendChild(info);
        card.appendChild(badge);
        dependentsList.appendChild(card);
      });
    }
  }

  // 3. Service Signals
  const signalsList = document.getElementById('serv-signals-list');
  const signalsCount = document.getElementById('serv-signals-count');
  if (signalsCount) signalsCount.textContent = String(serv.signals ? serv.signals.length : 0);

  if (signalsList) {
    signalsList.innerHTML = '';
    if (!serv.signals || serv.signals.length === 0) {
      signalsList.innerHTML = '<span class="empty-notice">No signals defined directly on this service.</span>';
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

        row.appendChild(left);
        row.appendChild(valBadge);
        signalsList.appendChild(row);
      });
    }
  }
}

/**
 * ----------------------------------------------------
 * 3. REACTIVITY GRAPH TAB VIEW
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

    const count = comp.signals.length + comp.effects.length;
    chip.innerHTML = `${comp.name} <span class="chip-badge">${count}</span>`;
    chip.title = `${comp.name}: ${comp.signals.length} signals, ${comp.effects.length} effects`;

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
  const emptyEl = document.getElementById('reactivity-empty');
  const bannerEl = document.getElementById('react-active-banner');
  const canvasWrap = document.getElementById('reactivity-canvas-wrap');

  if (!promptEl || !emptyEl || !bannerEl || !canvasWrap) return;

  if (!selectedReactComponentName) {
    promptEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
    bannerEl.classList.add('hidden');
    canvasWrap.classList.add('hidden');
    clearSvgLines();
    return;
  }

  const comp = currentSnapshot.components.find((c) => c.name === selectedReactComponentName);
  if (!comp) {
    promptEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
    bannerEl.classList.add('hidden');
    canvasWrap.classList.add('hidden');
    clearSvgLines();
    return;
  }

  promptEl.classList.add('hidden');
  bannerEl.classList.remove('hidden');

  const bannerName = document.getElementById('react-active-comp-name');
  if (bannerName) bannerName.textContent = comp.name;

  const bannerTag = document.getElementById('react-active-comp-tag');
  if (bannerTag) bannerTag.textContent = `<${comp.selector}>`;

  const compLinks = currentSnapshot.reactivityGraph
    ? currentSnapshot.reactivityGraph.filter((l) => l.source === comp.name || l.targetComponent === comp.name)
    : [];

  const metricSignals = document.getElementById('react-metric-signals');
  if (metricSignals) metricSignals.textContent = `${comp.signals.length} ${comp.signals.length === 1 ? 'signal' : 'signals'}`;

  const metricEffects = document.getElementById('react-metric-effects');
  if (metricEffects) metricEffects.textContent = `${comp.effects.length} ${comp.effects.length === 1 ? 'effect' : 'effects'}`;

  const metricLinks = document.getElementById('react-metric-links');
  if (metricLinks) metricLinks.textContent = `${compLinks.length} connections`;

  if (comp.signals.length === 0 && comp.effects.length === 0) {
    emptyEl.classList.remove('hidden');
    canvasWrap.classList.add('hidden');
    clearSvgLines();
    return;
  }

  emptyEl.classList.add('hidden');
  canvasWrap.classList.remove('hidden');

  // Render Signals Column
  const sigList = document.getElementById('graph-signals-nodes');
  const sigCountBadge = document.getElementById('signals-node-count');
  if (sigCountBadge) sigCountBadge.textContent = String(comp.signals.length);

  if (sigList) {
    sigList.innerHTML = '';
    comp.signals.forEach((sig) => {
      const node = document.createElement('div');
      node.className = `graph-node ${sig.type === 'computed' ? 'computed-node' : 'signal-node'}`;
      node.id = `node-sig-${comp.name}-${sig.name}`;
      node.dataset.sigName = sig.name;
      node.dataset.compName = comp.name;

      const header = document.createElement('div');
      header.className = 'node-header';

      const name = document.createElement('span');
      name.className = 'node-name';
      name.textContent = sig.name;

      const typePill = document.createElement('span');
      typePill.className = `sig-type-pill ${sig.type === 'computed' ? 'sig-computed' : 'sig-signal'}`;
      typePill.textContent = sig.type;

      header.appendChild(name);
      header.appendChild(typePill);

      const valBadge = document.createElement('span');
      valBadge.className = 'signal-val-badge';
      valBadge.textContent = formatValue(sig.value);

      node.appendChild(header);
      node.appendChild(valBadge);

      node.addEventListener('mouseenter', () => highlightSignalNetwork(comp.name, sig.name));
      node.addEventListener('mouseleave', () => unhighlightAll());

      sigList.appendChild(node);
    });
  }

  // Render Effects Column
  const effList = document.getElementById('graph-effects-nodes');
  const effCountBadge = document.getElementById('effects-node-count');
  if (effCountBadge) effCountBadge.textContent = String(comp.effects.length);

  if (effList) {
    effList.innerHTML = '';
    comp.effects.forEach((eff) => {
      const node = document.createElement('div');
      node.className = 'graph-node effect-node';
      node.id = `node-eff-${comp.name}-${eff.id}`;
      node.dataset.effId = eff.id;
      node.dataset.compName = comp.name;

      const header = document.createElement('div');
      header.className = 'node-header';

      const name = document.createElement('span');
      name.className = 'node-name';
      name.textContent = eff.description;

      const status = document.createElement('span');
      status.className = 'effect-status';
      status.innerHTML = '<span class="status-dot-sm"></span>';

      header.appendChild(name);
      header.appendChild(status);

      const desc = document.createElement('div');
      desc.className = 'node-desc';
      if (eff.dependencies && eff.dependencies.length > 0) {
        desc.textContent = `Tracks: ${eff.dependencies.join(', ')}`;
      } else {
        desc.textContent = 'Subscribed to component signals';
      }

      node.appendChild(header);
      node.appendChild(desc);

      node.addEventListener('mouseenter', () => highlightEffectNetwork(comp.name, eff.id));
      node.addEventListener('mouseleave', () => unhighlightAll());

      effList.appendChild(node);
    });
  }

  requestAnimationFrame(() => {
    drawCurrentReactivityLines();
  });
}

function clearSvgLines() {
  const svg = document.getElementById('reactivity-svg');
  if (!svg) return;
  const paths = svg.querySelectorAll('.react-link-path');
  paths.forEach((p) => p.remove());
}

function drawCurrentReactivityLines() {
  const svg = document.getElementById('reactivity-svg');
  const container = document.getElementById('reactivity-canvas-wrap');
  if (!svg || !container || !selectedReactComponentName || !currentSnapshot) return;

  clearSvgLines();

  const containerRect = container.getBoundingClientRect();
  svg.setAttribute('width', String(containerRect.width));
  svg.setAttribute('height', String(containerRect.height));

  const comp = currentSnapshot.components.find((c) => c.name === selectedReactComponentName);
  if (!comp) return;

  const compLinks = currentSnapshot.reactivityGraph
    ? currentSnapshot.reactivityGraph.filter((l) => l.source === comp.name || l.targetComponent === comp.name)
    : [];

  compLinks.forEach((link) => {
    const sigNode = document.getElementById(`node-sig-${link.source}-${link.signalName}`);
    let effNode = document.getElementById(`node-eff-${link.targetComponent}-${link.effectId}`);

    if (!effNode && comp.effects.length > 0) {
      effNode = document.querySelector(`#graph-effects-nodes .graph-node`);
    }

    if (!sigNode || !effNode) return;

    const sigRect = sigNode.getBoundingClientRect();
    const effRect = effNode.getBoundingClientRect();

    const startX = sigRect.right - containerRect.left;
    const startY = sigRect.top + sigRect.height / 2 - containerRect.top;

    const endX = effRect.left - containerRect.left;
    const endY = effRect.top + effRect.height / 2 - containerRect.top;

    const deltaX = Math.max(40, (endX - startX) * 0.5);
    const cp1x = startX + deltaX;
    const cp1y = startY;
    const cp2x = endX - deltaX;
    const cp2y = endY;

    const pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'react-link-path');
    path.dataset.sigName = link.signalName;
    path.dataset.effId = link.effectId;
    path.dataset.compName = link.source;

    svg.appendChild(path);
  });
}

function highlightSignalNetwork(compName, sigName) {
  unhighlightAll();

  const sigNode = document.getElementById(`node-sig-${compName}-${sigName}`);
  sigNode?.classList.add('active-highlight');

  const matchingPaths = document.querySelectorAll(
    `.react-link-path[data-comp-name="${compName}"][data-sig-name="${sigName}"]`
  );

  matchingPaths.forEach((path) => {
    path.classList.add('highlighted');
    const effId = path.dataset.effId;
    if (effId) {
      const effNode = document.getElementById(`node-eff-${compName}-${effId}`);
      effNode?.classList.add('active-highlight');
    }
  });

  if (matchingPaths.length === 0) {
    const allEffects = document.querySelectorAll(`#graph-effects-nodes .graph-node`);
    allEffects.forEach((eff) => eff.classList.add('active-highlight'));
  }
}

function highlightEffectNetwork(compName, effId) {
  unhighlightAll();

  const effNode = document.getElementById(`node-eff-${compName}-${effId}`);
  effNode?.classList.add('active-highlight');

  const matchingPaths = document.querySelectorAll(
    `.react-link-path[data-comp-name="${compName}"][data-eff-id="${effId}"]`
  );

  matchingPaths.forEach((path) => {
    path.classList.add('highlighted');
    const sigName = path.dataset.sigName;
    if (sigName) {
      const sigNode = document.getElementById(`node-sig-${compName}-${sigName}`);
      sigNode?.classList.add('active-highlight');
    }
  });

  if (matchingPaths.length === 0) {
    const comp = currentSnapshot?.components.find((c) => c.name === compName);
    const eff = comp?.effects.find((e) => e.id === effId);
    if (eff?.dependencies) {
      eff.dependencies.forEach((sName) => {
        const sigNode = document.getElementById(`node-sig-${compName}-${sName}`);
        sigNode?.classList.add('active-highlight');
      });
    }
  }
}

function unhighlightAll() {
  const allNodes = document.querySelectorAll('.graph-node');
  const allPaths = document.querySelectorAll('.react-link-path');

  allNodes.forEach((n) => n.classList.remove('active-highlight'));
  allPaths.forEach((p) => p.classList.remove('highlighted'));
}

/**
 * ----------------------------------------------------
 * 4. PERFORMANCE METRICS TAB VIEW
 * ----------------------------------------------------
 */
function getFilteredComponentsForMetrics() {
  if (!currentSnapshot || !currentSnapshot.components) return [];
  return currentSnapshot.components.filter((c) => {
    if (!metricsCompSearchQuery) return true;
    return (
      c.name.toLowerCase().includes(metricsCompSearchQuery) ||
      c.selector.toLowerCase().includes(metricsCompSearchQuery)
    );
  });
}

function renderMetricsComponentChips() {
  const container = document.getElementById('metrics-comp-chips');
  if (!container || !currentSnapshot) return;

  container.innerHTML = '';
  const components = getFilteredComponentsForMetrics();

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
    const isSelected = comp.name === selectedMetricsComponentName;
    chip.className = `chip-btn ${isSelected ? 'active' : ''}`;
    chip.dataset.compName = comp.name;

    const renderTime = comp.metrics?.initialRenderTimeMs ?? 0.8;
    chip.innerHTML = `${comp.name} <span class="chip-badge">${renderTime}ms</span>`;
    chip.title = `${comp.name}: ${renderTime}ms mount render, ${comp.metrics?.updateCount || 0} updates`;

    chip.addEventListener('click', () => {
      selectMetricsComponent(comp.name);
    });

    container.appendChild(chip);
  });
}

function selectMetricsComponent(compName) {
  if (selectedMetricsComponentName !== compName) {
    if (isRecording) {
      stopMetricsRecording();
    }
    lastRecordedSession = null;
  }
  selectedMetricsComponentName = compName;
  renderMetricsComponentChips();

  const activeChip = document.querySelector(`#metrics-comp-chips .chip-btn[data-comp-name="${compName}"]`);
  activeChip?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });

  renderMetricsView();
}

function clearMetricsComponentSelection() {
  if (isRecording) {
    stopMetricsRecording();
  }
  selectedMetricsComponentName = null;
  lastRecordedSession = null;
  renderMetricsComponentChips();
  renderMetricsView();
}

/**
 * Recording Session Controls
 */
async function toggleMetricsRecording() {
  if (!selectedMetricsComponentName) {
    const matching = getFilteredComponentsForMetrics();
    if (matching.length > 0) {
      selectMetricsComponent(matching[0].name);
    } else {
      return;
    }
  }

  if (!isRecording) {
    await startMetricsRecording();
  } else {
    await stopMetricsRecording();
  }
}

async function startMetricsRecording() {
  if (!selectedMetricsComponentName) return;

  try {
    await executeInInspectedPage(startRecordingInPage, [selectedMetricsComponentName]);
  } catch (err) {
    console.warn('[Purity DevTools] Failed to start recording in page:', err);
  }

  isRecording = true;
  recordingStartTime = Date.now();
  lastRecordedSession = null;

  updateRecordButtonUI(true);
  updateSessionBannerUI('recording', {
    componentName: selectedMetricsComponentName,
    startTime: recordingStartTime,
    updatesCount: 0,
  });

  clearInterval(recordingTimerInterval);
  recordingTimerInterval = setInterval(() => {
    const elapsedSec = Math.floor((Date.now() - recordingStartTime) / 1000);
    const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');
    const timerEl = document.getElementById('metrics-record-timer');
    if (timerEl) {
      timerEl.textContent = `${mins}:${secs}`;
    }
    const badge = document.getElementById('session-duration-badge');
    const count = currentSnapshot?.recordingSession?.updatesCount || 0;
    if (badge) {
      badge.textContent = `${mins}:${secs} active • ${count} ${count === 1 ? 'update' : 'updates'}`;
    }
  }, 250);

  clearInterval(recordingPollInterval);
  recordingPollInterval = setInterval(async () => {
    if (isRecording && currentTab === 'metrics') {
      await refreshInspection(true);
    }
  }, 600);
}

async function stopMetricsRecording() {
  clearInterval(recordingTimerInterval);
  clearInterval(recordingPollInterval);
  recordingTimerInterval = null;
  recordingPollInterval = null;
  isRecording = false;

  let session = null;
  try {
    session = await executeInInspectedPage(stopRecordingInPage);
  } catch (err) {
    console.warn('[Purity DevTools] Failed to stop recording in page:', err);
  }

  lastRecordedSession = session;
  updateRecordButtonUI(false);

  await refreshInspection(true);

  const finalSession = session || currentSnapshot?.recordingSession || {
    componentName: selectedMetricsComponentName,
    updatesCount: 0,
    totalDurationMs: Math.max(0, Date.now() - recordingStartTime),
    avgUpdateTimeMs: 0,
    minUpdateTimeMs: 0,
    maxUpdateTimeMs: 0,
    updates: [],
  };

  updateSessionBannerUI('complete', finalSession);
  renderMetricsView();
}

function updateRecordButtonUI(recording) {
  const btn = document.getElementById('btn-metrics-record');
  const label = document.getElementById('btn-metrics-record-label');
  const timer = document.getElementById('metrics-record-timer');

  if (recording) {
    btn?.classList.add('recording-pulse');
    if (label) label.textContent = 'Stop Recording';
    timer?.classList.remove('hidden');
    if (timer) timer.textContent = '00:00';
  } else {
    btn?.classList.remove('recording-pulse');
    if (label) label.textContent = 'Start Recording';
    timer?.classList.add('hidden');
  }
}

function updateSessionBannerUI(state, sessionData) {
  const banner = document.getElementById('metrics-session-banner');
  const icon = document.getElementById('session-status-icon');
  const title = document.getElementById('session-status-title');
  const desc = document.getElementById('session-status-desc');
  const badge = document.getElementById('session-duration-badge');

  if (!banner) return;

  if (state === 'recording') {
    banner.className = 'session-status-banner recording';
    if (icon) icon.innerHTML = '<span class="pulse-indicator"></span>';
    const cName = sessionData?.componentName || selectedMetricsComponentName;
    if (title) title.textContent = `Recording measurements for ${cName}...`;
    if (desc) desc.textContent = 'Interact with the component on the page or click "Test Update" to capture re-renders and value updates live.';
    if (badge) badge.textContent = '00:00 active • 0 updates';
  } else if (state === 'complete') {
    banner.className = 'session-status-banner complete';
    if (icon) icon.textContent = '✅';
    const compName = sessionData?.componentName || selectedMetricsComponentName;
    const count = sessionData?.updatesCount || 0;
    const durSec = sessionData?.totalDurationMs ? (sessionData.totalDurationMs / 1000).toFixed(1) : '0.0';
    const avgMs = sessionData?.avgUpdateTimeMs ? sessionData.avgUpdateTimeMs.toFixed(2) : '0.00';
    const minMs = sessionData?.minUpdateTimeMs !== null && sessionData?.minUpdateTimeMs !== undefined ? sessionData.minUpdateTimeMs.toFixed(2) : '0.00';
    const maxMs = sessionData?.maxUpdateTimeMs ? sessionData.maxUpdateTimeMs.toFixed(2) : '0.00';

    if (title) title.textContent = `Recording Complete for ${compName}`;
    if (desc) {
      if (count > 0) {
        desc.textContent = `Recorded ${count} ${count === 1 ? 'update' : 'updates'} across ${durSec}s. Avg update latency: ${avgMs} ms (Min: ${minMs}ms, Max: ${maxMs}ms).`;
      } else {
        desc.textContent = `Recorded 0 updates across ${durSec}s. Click "Test Update" or trigger signals in your page to record re-renders.`;
      }
    }
    if (badge) badge.textContent = `Recorded: ${count} ${count === 1 ? 'update' : 'updates'}`;
  } else {
    banner.className = 'session-status-banner idle';
    if (icon) icon.textContent = '⏺️';
    if (title) title.textContent = 'Ready to Record Measurements';
    if (desc) desc.textContent = 'Click "Start Recording" to measure reactive updates, signal changes, and re-renders live.';
    if (badge) badge.textContent = 'Session: Idle';
  }
}

function renderMetricsView() {
  if (!currentSnapshot) return;

  const promptEl = document.getElementById('metrics-prompt');
  const bannerEl = document.getElementById('metrics-active-banner');
  const dashboardEl = document.getElementById('metrics-dashboard');

  if (!promptEl || !bannerEl || !dashboardEl) return;

  if (!selectedMetricsComponentName) {
    promptEl.classList.remove('hidden');
    bannerEl.classList.add('hidden');
    dashboardEl.classList.add('hidden');
    return;
  }

  const comp = currentSnapshot.components.find((c) => c.name === selectedMetricsComponentName);
  if (!comp) {
    promptEl.classList.remove('hidden');
    bannerEl.classList.add('hidden');
    dashboardEl.classList.add('hidden');
    return;
  }

  promptEl.classList.add('hidden');
  bannerEl.classList.remove('hidden');
  dashboardEl.classList.remove('hidden');

  const bannerName = document.getElementById('metrics-active-comp-name');
  if (bannerName) bannerName.textContent = comp.name;

  const bannerTag = document.getElementById('metrics-active-comp-tag');
  if (bannerTag) bannerTag.textContent = `<${comp.selector}>`;

  const m = comp.metrics || {
    initialRenderTimeMs: 0.85,
    renderCount: comp.elementCount || 1,
    updateCount: 0,
    totalUpdateTimeMs: 0,
    lastUpdateTimeMs: 0,
    avgUpdateTimeMs: 0,
    minUpdateTimeMs: 0,
    maxUpdateTimeMs: 0,
    recentUpdates: [],
  };

  const norm = (s) => (s ? s.toLowerCase().replace(/[-_]/g, '').replace(/component$/, '') : '');
  const recSession = currentSnapshot.recordingSession || lastRecordedSession;
  const isSessionForComp = Boolean(
    recSession && (
      recSession.componentName === comp.name ||
      norm(recSession.componentName) === norm(comp.name) ||
      norm(recSession.componentName) === norm(comp.selector)
    )
  );

  if (isRecording) {
    updateSessionBannerUI('recording', recSession || { componentName: comp.name });
  } else if (lastRecordedSession && isSessionForComp) {
    updateSessionBannerUI('complete', lastRecordedSession);
  } else {
    updateSessionBannerUI('idle');
  }

  const useSessionData = isSessionForComp && recSession && (recSession.updatesCount > 0 || isRecording);
  const effectiveUpdatesCount = useSessionData ? recSession.updatesCount : m.updateCount;
  const effectiveAvgUpdateMs = useSessionData ? recSession.avgUpdateTimeMs : m.avgUpdateTimeMs;
  const effectiveMinMs = useSessionData
    ? (recSession.minUpdateTimeMs !== null && recSession.minUpdateTimeMs !== undefined ? recSession.minUpdateTimeMs : 0)
    : (m.minUpdateTimeMs !== null && m.minUpdateTimeMs !== undefined ? m.minUpdateTimeMs : 0);
  const effectiveMaxMs = useSessionData ? recSession.maxUpdateTimeMs : m.maxUpdateTimeMs;
  const effectiveTotalMs = useSessionData ? recSession.totalUpdateTimeMs : m.totalUpdateTimeMs;
  const effectiveUpdatesList = (useSessionData && recSession.updates.length > 0)
    ? recSession.updates
    : m.recentUpdates;

  const statInitial = document.getElementById('metrics-stat-initial');
  if (statInitial) statInitial.textContent = `⚡ ${m.initialRenderTimeMs}ms render`;

  const statUpdates = document.getElementById('metrics-stat-updates');
  if (statUpdates) statUpdates.textContent = `🔄 ${effectiveUpdatesCount} updates`;

  const statAvg = document.getElementById('metrics-stat-avg');
  if (statAvg) statAvg.textContent = `⏱️ ${effectiveAvgUpdateMs}ms avg`;

  // 1. KPI 1: Initial Render Time
  const kpiInitialTime = document.getElementById('kpi-initial-time');
  if (kpiInitialTime) {
    kpiInitialTime.innerHTML = `${m.initialRenderTimeMs.toFixed(2)} <span class="kpi-unit">ms</span>`;
  }

  const kpiBudget = document.getElementById('kpi-render-budget');
  if (kpiBudget) {
    if (m.initialRenderTimeMs < 16.6) {
      kpiBudget.className = 'budget-pill pill-pass';
      kpiBudget.textContent = `⚡ Fast (${m.initialRenderTimeMs}ms < 16.6ms 60FPS)`;
    } else {
      kpiBudget.className = 'budget-pill';
      kpiBudget.style.background = 'var(--status-orange-bg)';
      kpiBudget.style.color = 'var(--status-orange)';
      kpiBudget.textContent = `⚠️ Heavy (${m.initialRenderTimeMs}ms > 16.6ms)`;
    }
  }

  // 2. KPI 2: Update Latency
  const kpiUpdateTime = document.getElementById('kpi-update-time');
  if (kpiUpdateTime) {
    kpiUpdateTime.innerHTML = `${effectiveAvgUpdateMs.toFixed(2)} <span class="kpi-unit">ms</span>`;
  }

  const kpiUpdateSubtext = document.getElementById('kpi-update-subtext');
  if (kpiUpdateSubtext) {
    if (useSessionData && recSession.updates.length > 0) {
      kpiUpdateSubtext.textContent = `Last update: ${recSession.updates[0].durationMs.toFixed(2)} ms (Session)`;
    } else {
      kpiUpdateSubtext.textContent = `Last update: ${m.lastUpdateTimeMs.toFixed(2)} ms`;
    }
  }

  const kpiMinMax = document.getElementById('kpi-minmax-time');
  if (kpiMinMax) {
    kpiMinMax.textContent = `Min: ${effectiveMinMs.toFixed(2)}ms • Max: ${effectiveMaxMs.toFixed(2)}ms`;
  }

  // 3. KPI 3: Updates Processed & Duration
  const kpiUpdateCount = document.getElementById('kpi-update-count');
  if (kpiUpdateCount) {
    kpiUpdateCount.textContent = String(effectiveUpdatesCount);
  }

  const kpiTotalTime = document.getElementById('kpi-total-time');
  if (kpiTotalTime) {
    kpiTotalTime.textContent = useSessionData
      ? `Session update time: ${effectiveTotalMs.toFixed(2)} ms`
      : `Total update time: ${effectiveTotalMs.toFixed(2)} ms`;
  }

  const kpiRenderCount = document.getElementById('kpi-render-count');
  if (kpiRenderCount) {
    if (useSessionData && recSession.totalDurationMs) {
      kpiRenderCount.textContent = `${(recSession.totalDurationMs / 1000).toFixed(1)}s elapsed • ${comp.elementCount} ${comp.elementCount === 1 ? 'DOM Instance' : 'DOM Instances'}`;
    } else {
      kpiRenderCount.textContent = `${comp.elementCount} ${comp.elementCount === 1 ? 'DOM Instance' : 'DOM Instances'} (Mounts: ${m.renderCount || 1})`;
    }
  }

  // 4. Breakdown Table
  const tbody = document.getElementById('metrics-breakdown-tbody');
  const countBadge = document.getElementById('metrics-breakdown-count');
  if (tbody) {
    tbody.innerHTML = '';
    const rows = [];

    comp.signals.forEach((sig) => {
      rows.push({
        name: sig.name,
        type: sig.type,
        updates: sig.updateCount || 0,
        lastRun: sig.lastUpdateDurationMs ? `${sig.lastUpdateDurationMs.toFixed(2)}ms` : '0.00ms',
        avgDuration: sig.avgUpdateDurationMs ? `${sig.avgUpdateDurationMs.toFixed(2)}ms` : '0.00ms',
        totalTime: sig.totalUpdateDurationMs ? `${sig.totalUpdateDurationMs.toFixed(2)}ms` : '0.00ms',
      });
    });

    comp.effects.forEach((eff) => {
      rows.push({
        name: eff.description,
        type: 'effect',
        updates: eff.executionCount || 1,
        lastRun: eff.lastDurationMs ? `${eff.lastDurationMs.toFixed(2)}ms` : '0.00ms',
        avgDuration: eff.avgDurationMs ? `${eff.avgDurationMs.toFixed(2)}ms` : '0.00ms',
        totalTime: eff.totalDurationMs ? `${eff.totalDurationMs.toFixed(2)}ms` : '0.00ms',
      });
    });

    if (countBadge) countBadge.textContent = `${rows.length} tracked`;

    if (rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-notice" style="text-align: center; padding: 12px;">No signals or effects registered for this component.</td></tr>';
    } else {
      rows.forEach((r) => {
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.className = 'td-mono';
        tdName.textContent = r.name;

        const tdType = document.createElement('td');
        const pill = document.createElement('span');
        pill.className = `sig-type-pill ${r.type === 'computed' ? 'sig-computed' : r.type === 'effect' ? 'badge-green' : 'sig-signal'}`;
        pill.textContent = r.type;
        tdType.appendChild(pill);

        const tdUpdates = document.createElement('td');
        tdUpdates.textContent = String(r.updates);

        const tdLast = document.createElement('td');
        tdLast.className = 'td-duration';
        tdLast.textContent = r.lastRun;

        const tdAvg = document.createElement('td');
        tdAvg.className = 'td-mono';
        tdAvg.textContent = r.avgDuration;

        const tdTotal = document.createElement('td');
        tdTotal.className = 'td-mono';
        tdTotal.textContent = r.totalTime;

        tr.appendChild(tdName);
        tr.appendChild(tdType);
        tr.appendChild(tdUpdates);
        tr.appendChild(tdLast);
        tr.appendChild(tdAvg);
        tr.appendChild(tdTotal);
        tbody.appendChild(tr);
      });
    }
  }

  // 5. Recent Updates Timeline
  const logContainer = document.getElementById('metrics-updates-log');
  const logCount = document.getElementById('metrics-updates-log-count');
  if (logContainer) {
    logContainer.innerHTML = '';
    const updates = effectiveUpdatesList || [];
    if (logCount) logCount.textContent = `${updates.length} events`;

    if (updates.length === 0) {
      logContainer.innerHTML = '<div class="empty-notice" style="padding: 12px; text-align: center;">No value updates recorded yet. Click "Start Recording" above and trigger signals in your page, or click "Test Update".</div>';
    } else {
      updates.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'timeline-item';

        const left = document.createElement('div');
        left.className = 'timeline-left';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'timeline-time';
        const d = new Date(item.timestamp);
        timeSpan.textContent = d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');

        const triggerSpan = document.createElement('span');
        triggerSpan.className = 'timeline-trigger';
        triggerSpan.textContent = item.trigger;

        left.appendChild(timeSpan);
        left.appendChild(triggerSpan);

        const durSpan = document.createElement('span');
        durSpan.className = 'timeline-duration';
        durSpan.textContent = `${item.durationMs.toFixed(2)} ms`;

        row.appendChild(left);
        row.appendChild(durSpan);
        logContainer.appendChild(row);
      });
    }
  }
}

async function runMetricsBenchmark() {
  if (!selectedMetricsComponentName) return;

  const btn = document.getElementById('btn-metrics-benchmark');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Testing...';
  }

  try {
    await executeInInspectedPage(benchmarkComponentInPage, [selectedMetricsComponentName]);
  } catch (err) {
    console.warn('[Purity DevTools] Benchmark failed:', err);
  } finally {
    await refreshInspection(true);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        Test Update`;
    }
  }
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
