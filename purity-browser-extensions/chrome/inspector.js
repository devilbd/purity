/**
 * Purity Inspector - In-Page Inspection Script
 * Executes in the target webpage's MAIN world context to extract telemetry.
 */

function inspectPurityAppInPage() {
  function serializeValue(val, depth = 0) {
    if (val === null || val === undefined) return val;
    if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'string') {
      return val;
    }
    if (typeof val === 'symbol') {
      return val.toString();
    }
    if (typeof val === 'function') {
      return `[Function: ${val.name || 'anonymous'}]`;
    }
    if (val instanceof Date) {
      return val.toISOString();
    }
    if (typeof HTMLElement !== 'undefined' && val instanceof HTMLElement) {
      return `<${val.tagName.toLowerCase()}${val.id ? '#' + val.id : ''}>`;
    }
    if (depth > 2) {
      return Array.isArray(val) ? `[Array(${val.length})]` : '[Object]';
    }
    if (Array.isArray(val)) {
      return val.slice(0, 20).map((item) => serializeValue(item, depth + 1));
    }
    if (typeof val === 'object') {
      const out = {};
      const keys = Object.keys(val).slice(0, 25);
      for (const k of keys) {
        try {
          out[k] = serializeValue(val[k], depth + 1);
        } catch {
          out[k] = '[Unserializable]';
        }
      }
      return out;
    }
    return String(val);
  }

  // 1. Check if first-class __PURITY_DEVTOOLS__ is available
  if (typeof window !== 'undefined' && window.__PURITY_DEVTOOLS__ && typeof window.__PURITY_DEVTOOLS__.inspect === 'function') {
    try {
      const snapshot = window.__PURITY_DEVTOOLS__.inspect();
      if (snapshot && snapshot.detected) {
        return snapshot;
      }
    } catch (err) {
      console.warn('[Purity Inspector] Error executing __PURITY_DEVTOOLS__.inspect():', err);
    }
  }

  // 2. Standalone Fallback: scan DOM and window
  const appRef = typeof window !== 'undefined' ? window.__PURITY_APP__ : null;
  const elements = typeof document !== 'undefined' ? Array.from(document.querySelectorAll('*')) : [];

  const componentElements = elements.filter((el) => {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    return tag.includes('-') || el.__purity_component_name || typeof el.connectedCallback === 'function' || Boolean(el.templateUrl);
  });

  const isPurityDetected = Boolean(appRef || componentElements.length > 0 || (typeof window !== 'undefined' && window.__PURITY_DEVTOOLS__));

  if (!isPurityDetected) {
    return {
      detected: false,
      framework: 'Purity',
      version: 'Unknown',
      components: [],
      services: [],
    };
  }

  // Map components
  const componentMap = new Map();
  const discoveredServices = new Map(); // name -> { instance, dependencies: Set, dependents: Set, signals: [] }

  for (const el of componentElements) {
    const tag = el.tagName.toLowerCase();
    const compName =
      el.__purity_component_name ||
      (el.constructor.name !== 'HTMLElement' && el.constructor.name !== 'ComponentElement' ? el.constructor.name : null) ||
      tag;

    if (!componentMap.has(compName)) {
      componentMap.set(compName, {
        id: tag,
        name: compName,
        selector: tag,
        elementCount: 0,
        sampleEl: el,
        services: new Map(), // name -> { name, propertyKey }
        signals: [],
        effects: [],
      });
    }

    const compEntry = componentMap.get(compName);
    compEntry.elementCount += 1;

    // Scan properties on first instance
    if (compEntry.elementCount === 1) {
      const propNames = new Set([
        ...Object.getOwnPropertyNames(el),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(el) || {}),
      ]);

      for (const key of propNames) {
        if (key.startsWith('__purity_effects') || key === 'constructor') continue;

        let val;
        try {
          val = el[key];
        } catch {
          continue;
        }

        // Check for Signals
        if (typeof val === 'function') {
          const isSignal = Boolean(val.__purity_signal || (typeof val.set === 'function' && typeof val.update === 'function'));
          const isComputed = Boolean(val.__purity_computed || val.__purity_type === 'computed');

          if (isSignal || isComputed) {
            let currentVal = undefined;
            try {
              currentVal = serializeValue(val());
            } catch (e) {
              currentVal = `[Error: ${String(e)}]`;
            }
            compEntry.signals.push({
              name: key,
              type: isComputed ? 'computed' : 'signal',
              value: currentVal,
              isWritable: isSignal && !isComputed,
            });
          }
        }

        // Check for Injected Services
        if (val && typeof val === 'object' && val.constructor) {
          const constrName = val.constructor.name;
          if (constrName && constrName !== 'Object' && (constrName.endsWith('Service') || key.toLowerCase().endsWith('service'))) {
            compEntry.services.set(constrName, {
              name: constrName,
              propertyKey: key,
            });

            if (!discoveredServices.has(constrName)) {
              discoveredServices.set(constrName, {
                name: constrName,
                instance: val,
                dependencies: new Set(),
                dependents: new Set(),
                signals: [],
              });
            }
            discoveredServices.get(constrName).dependents.add(compName);
          }
        }
      }

      // Effects
      const rawEffects = el.__purity_effects || [];
      rawEffects.forEach((eff, idx) => {
        const desc = eff.description || (eff.name && eff.name !== 'execute' ? `Reactive Effect (${eff.name})` : `Reactive Effect #${idx + 1}`);
        compEntry.effects.push({
          id: `effect-${idx + 1}`,
          description: desc,
          active: true,
        });
      });

      const directives = el.activeDirectives || [];
      directives.forEach((_, idx) => {
        compEntry.effects.push({
          id: `directive-${idx + 1}`,
          description: `Active Directive Binding #${idx + 1}`,
          active: true,
        });
      });
    }
  }

  // Inspect discovered services for service-to-service dependencies and service signals
  for (const [sName, sData] of discoveredServices.entries()) {
    const inst = sData.instance;
    if (inst && typeof inst === 'object') {
      const propNames = Object.getOwnPropertyNames(inst);
      for (const key of propNames) {
        let val;
        try {
          val = inst[key];
        } catch {
          continue;
        }

        // Service signals
        if (typeof val === 'function') {
          const isSignal = Boolean(val.__purity_signal || (typeof val.set === 'function' && typeof val.update === 'function'));
          const isComputed = Boolean(val.__purity_computed || val.__purity_type === 'computed');

          if (isSignal || isComputed) {
            let currentVal = undefined;
            try {
              currentVal = serializeValue(val());
            } catch (e) {
              currentVal = `[Error: ${String(e)}]`;
            }
            sData.signals.push({
              name: key,
              type: isComputed ? 'computed' : 'signal',
              value: currentVal,
              isWritable: isSignal && !isComputed,
            });
          }
        }

        // Service-to-service dependency
        if (val && typeof val === 'object' && val.constructor) {
          const childConstr = val.constructor.name;
          if (childConstr && childConstr !== sName && (childConstr.endsWith('Service') || key.toLowerCase().endsWith('service'))) {
            sData.dependencies.add(childConstr);

            if (!discoveredServices.has(childConstr)) {
              discoveredServices.set(childConstr, {
                name: childConstr,
                instance: val,
                dependencies: new Set(),
                dependents: new Set(),
                signals: [],
              });
            }
            discoveredServices.get(childConstr).dependents.add(sName);
          }
        }
      }
    }
  }

  const components = Array.from(componentMap.values()).map((comp) => ({
    id: comp.id,
    name: comp.name,
    selector: comp.selector,
    elementCount: comp.elementCount,
    services: Array.from(comp.services.values()),
    signals: comp.signals,
    effects: comp.effects,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const services = Array.from(discoveredServices.values()).map((serv) => ({
    name: serv.name,
    isSingleton: true,
    dependencies: Array.from(serv.dependencies),
    dependents: Array.from(serv.dependents),
    signals: serv.signals,
  })).sort((a, b) => a.name.localeCompare(b.name));

  return {
    detected: true,
    framework: 'Purity',
    version: appRef?.environment?.version || '2.0.2',
    appName: appRef?.environment?.appName || 'Purity App',
    components,
    services,
  };
}
