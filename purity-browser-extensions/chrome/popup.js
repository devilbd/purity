/**
 * Purity Inspector - Popup UI Controller
 */

// Application state
let currentSnapshot = null;
let selectedComponentName = null;
let selectedServiceName = null;
let currentTab = 'components'; // 'components' | 'services'
let compSearchQuery = '';
let servSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  refreshInspection();
});

function initUI() {
  // Tab Buttons
  const tabBtnComponents = document.getElementById('tab-btn-components');
  const tabBtnServices = document.getElementById('tab-btn-services');

  tabBtnComponents?.addEventListener('click', () => switchTab('components'));
  tabBtnServices?.addEventListener('click', () => switchTab('services'));

  // Refresh and Retry Buttons
  document.getElementById('btn-refresh')?.addEventListener('click', () => refreshInspection());
  document.getElementById('btn-retry-detect')?.addEventListener('click', () => refreshInspection());

  // Search Inputs
  const compSearchInput = document.getElementById('comp-search-input');
  compSearchInput?.addEventListener('input', (e) => {
    compSearchQuery = (e.target.value || '').trim().toLowerCase();
    renderComponentsList();
  });

  const servSearchInput = document.getElementById('serv-search-input');
  servSearchInput?.addEventListener('input', (e) => {
    servSearchQuery = (e.target.value || '').trim().toLowerCase();
    renderServicesList();
  });
}

function switchTab(tab) {
  currentTab = tab;

  const tabBtnComponents = document.getElementById('tab-btn-components');
  const tabBtnServices = document.getElementById('tab-btn-services');
  const viewComponents = document.getElementById('view-components');
  const viewServices = document.getElementById('view-services');

  if (tab === 'components') {
    tabBtnComponents?.classList.add('active');
    tabBtnServices?.classList.remove('active');
    viewComponents?.classList.remove('hidden');
    viewServices?.classList.add('hidden');
  } else {
    tabBtnServices?.classList.add('active');
    tabBtnComponents?.classList.remove('active');
    viewServices?.classList.remove('hidden');
    viewComponents?.classList.add('hidden');
  }
}

/**
 * Executes the inspector in the active tab's MAIN world context.
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
      showNotDetectedState('No active tab found.');
      return;
    }

    // Execute inspector function in MAIN world
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

function showNotDetectedState(reason) {
  const badge = document.getElementById('app-badge');
  if (badge) {
    badge.className = 'badge badge-warning';
    badge.textContent = 'Not Detected';
  }

  document.getElementById('nav-tabs')?.classList.add('hidden');
  document.getElementById('view-not-detected')?.classList.remove('hidden');
  document.getElementById('view-components')?.classList.add('hidden');
  document.getElementById('view-services')?.classList.add('hidden');
}

function showDetectedState(data) {
  const badge = document.getElementById('app-badge');
  if (badge) {
    badge.className = 'badge badge-success';
    badge.textContent = `Purity ${data.version || '2.0.2'}`;
  }

  document.getElementById('nav-tabs')?.classList.remove('hidden');
  document.getElementById('view-not-detected')?.classList.add('hidden');

  // Update badge counts
  const compCount = document.getElementById('badge-comp-count');
  if (compCount) compCount.textContent = String(data.components.length);

  const servCount = document.getElementById('badge-serv-count');
  if (servCount) servCount.textContent = String(data.services.length);

  // Render lists
  renderComponentsList();
  renderServicesList();

  // If nothing is selected, select the first component by default
  if (!selectedComponentName && data.components.length > 0) {
    selectComponent(data.components[0].name);
  } else if (selectedComponentName) {
    selectComponent(selectedComponentName);
  }

  // If nothing is selected for services, select first service
  if (!selectedServiceName && data.services.length > 0) {
    selectService(data.services[0].name);
  } else if (selectedServiceName) {
    selectService(selectedServiceName);
  }

  switchTab(currentTab);
}

/**
 * ----------------------------------------------------
 * COMPONENTS VIEW
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

    // Badges summary
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

  // Set Header
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
 * SERVICES VIEW
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

    // Badges summary
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

  // Header
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

        // Check if dependent is a component in the snapshot
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
