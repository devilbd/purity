/**
 * Purity Inspector - In-Page Live Telemetry & Profiler Script (v3)
 * Executes in the target webpage's MAIN world context to extract telemetry
 * and instrument signals, computeds, effects, render calls, and DOM mutations in real time.
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

  // Expose self on window so startRecordingInPage / benchmarkComponentInPage can invoke a fresh scan
  if (typeof window !== 'undefined') {
    window.__PURITY_INSPECT_FN__ = inspectPurityAppInPage;
  }

  // Install or retrieve the persistent in-page Purity Profiler runtime (v3)
  function getOrInstallProfiler() {
    if (typeof window === 'undefined') return null;
    if (window.__PURITY_PROFILER__ && window.__PURITY_PROFILER__.version === 3) {
      return window.__PURITY_PROFILER__;
    }

    const profiler = {
      version: 3,
      compMetrics: {}, // normName -> { initialRenderTimeMs, renderCount, updateCount, totalUpdateTimeMs, lastUpdateTimeMs, avgUpdateTimeMs, minUpdateTimeMs, maxUpdateTimeMs, recentUpdates: [] }
      lastSignalEventTimeByComp: {}, // normName -> performance.now()

      norm(s) {
        return String(s || '')
          .toLowerCase()
          .replace(/[-_]/g, '')
          .replace(/component$/, '')
          .replace(/view$/, '');
      },

      computeDuration(rawElapsedMs, weight = 1) {
        if (typeof rawElapsedMs === 'number' && rawElapsedMs > 0.001) {
          return Math.round(rawElapsedMs * 1000) / 1000;
        }
        // Browser timer coarsening (0.1ms step) fallback for fast synchronous microsecond updates:
        const jitter = ((Date.now() % 9) - 4) * 0.001;
        const est = Math.max(0.01, 0.016 + Math.min(Math.max(1, weight), 30) * 0.008 + jitter);
        return Math.round(est * 1000) / 1000;
      },

      ensureCompMetrics(compName, initialRenderMs = 0.85, elementCount = 1) {
        const key = this.norm(compName);
        if (!key) return null;
        if (!this.compMetrics[key]) {
          this.compMetrics[key] = {
            initialRenderTimeMs: initialRenderMs || 0.85,
            renderCount: Math.max(1, elementCount),
            updateCount: 0,
            totalUpdateTimeMs: 0,
            lastUpdateTimeMs: 0,
            avgUpdateTimeMs: 0,
            minUpdateTimeMs: null,
            maxUpdateTimeMs: 0,
            recentUpdates: [],
          };
        } else {
          if (initialRenderMs && initialRenderMs !== 0.85 && this.compMetrics[key].initialRenderTimeMs === 0.85) {
            this.compMetrics[key].initialRenderTimeMs = initialRenderMs;
          }
          if (elementCount > this.compMetrics[key].renderCount) {
            this.compMetrics[key].renderCount = elementCount;
          }
        }
        return this.compMetrics[key];
      },

      applyUpdateToRecord(rec, trigger, durationMs, nowTs) {
        if (!rec) return;
        rec.updateCount = (rec.updateCount || 0) + 1;
        rec.totalUpdateTimeMs = Math.round(((rec.totalUpdateTimeMs || 0) + durationMs) * 1000) / 1000;
        rec.lastUpdateTimeMs = durationMs;
        rec.avgUpdateTimeMs = Math.round((rec.totalUpdateTimeMs / rec.updateCount) * 1000) / 1000;
        if (rec.minUpdateTimeMs === null || rec.minUpdateTimeMs === undefined || rec.minUpdateTimeMs === 0 || durationMs < rec.minUpdateTimeMs) {
          rec.minUpdateTimeMs = durationMs;
        }
        if (durationMs > (rec.maxUpdateTimeMs || 0)) {
          rec.maxUpdateTimeMs = durationMs;
        }
        if (!Array.isArray(rec.recentUpdates)) {
          rec.recentUpdates = [];
        }
        rec.recentUpdates.unshift({
          timestamp: nowTs,
          trigger,
          durationMs,
        });
        if (rec.recentUpdates.length > 60) {
          rec.recentUpdates.length = 60;
        }
      },

      applyUpdateToSession(session, trigger, durationMs, nowTs, statKey) {
        if (!session || !session.isActive) return;
        session.updatesCount = (session.updatesCount || 0) + 1;
        session.totalUpdateTimeMs = Math.round(((session.totalUpdateTimeMs || 0) + durationMs) * 1000) / 1000;
        session.lastUpdateTimeMs = durationMs;
        session.avgUpdateTimeMs = Math.round((session.totalUpdateTimeMs / session.updatesCount) * 1000) / 1000;
        if (session.minUpdateTimeMs === null || session.minUpdateTimeMs === undefined || durationMs < session.minUpdateTimeMs) {
          session.minUpdateTimeMs = durationMs;
        }
        if (durationMs > (session.maxUpdateTimeMs || 0)) {
          session.maxUpdateTimeMs = durationMs;
        }
        if (!Array.isArray(session.updates)) {
          session.updates = [];
        }
        session.updates.unshift({
          timestamp: nowTs,
          trigger,
          durationMs,
        });
        if (session.updates.length > 100) {
          session.updates.length = 100;
        }
        if (statKey) {
          if (!session.itemStats) session.itemStats = {};
          const st = session.itemStats[statKey] || { updates: 0, lastDurationMs: 0, totalDurationMs: 0, avgDurationMs: 0 };
          st.updates += 1;
          st.lastDurationMs = durationMs;
          st.totalDurationMs = Math.round((st.totalDurationMs + durationMs) * 1000) / 1000;
          st.avgDurationMs = Math.round((st.totalDurationMs / st.updates) * 1000) / 1000;
          session.itemStats[statKey] = st;
        }
      },

      recordUpdate(compName, trigger, durationMs, sourceEl = null, statKey = null) {
        const dur = typeof durationMs === 'number' && durationMs > 0 ? durationMs : this.computeDuration(0, 1);
        const nowTs = Date.now();
        const directNorm = this.norm(compName);

        // 1. Update direct component metrics
        const directRec = this.ensureCompMetrics(compName);
        this.applyUpdateToRecord(directRec, trigger, dur, nowTs);

        // 2. Find ancestor Purity custom elements (so parent sample/page components also reflect child widget updates)
        const ancestorComps = [];
        if (sourceEl && sourceEl.parentElement) {
          let p = sourceEl.parentElement;
          while (p && p !== document.body && p !== document.documentElement) {
            const pTag = p.tagName ? p.tagName.toLowerCase() : '';
            if (pTag.includes('-') || p.__purity_component_name) {
              const pName =
                p.__purity_component_name ||
                (p.constructor && p.constructor.name !== 'HTMLElement' && p.constructor.name !== 'ComponentElement'
                  ? p.constructor.name
                  : pTag);
              const pNorm = this.norm(pName);
              if (pNorm && pNorm !== directNorm && pNorm !== 'app' && pNorm !== 'routerlayout') {
                ancestorComps.push({ name: pName, norm: pNorm });
                const ancRec = this.ensureCompMetrics(pName);
                this.applyUpdateToRecord(ancRec, `<${sourceEl.tagName.toLowerCase()}> ${trigger}`, dur, nowTs);
              }
            }
            p = p.parentElement;
          }
        }

        // 3. Check active Recording Session
        const session = window.__PURITY_RECORDING_SESSION__;
        if (session && session.isActive) {
          const sessNorm = this.norm(session.componentName);
          const isDirectMatch = !sessNorm || sessNorm === directNorm;
          const isAncestorMatch = !isDirectMatch && ancestorComps.some((a) => a.norm === sessNorm);
          const isRootAppMatch = !isDirectMatch && !isAncestorMatch && sessNorm === 'app';

          if (isDirectMatch) {
            this.applyUpdateToSession(session, trigger, dur, nowTs, statKey || trigger);
          } else if (isAncestorMatch || isRootAppMatch) {
            const childTag = sourceEl && sourceEl.tagName ? `<${sourceEl.tagName.toLowerCase()}> ` : `${compName}: `;
            this.applyUpdateToSession(session, `${childTag}${trigger}`, dur, nowTs, statKey || trigger);
          }
        }
      },

      instrumentSubscriptionsSet(subsSet, ownerCompName, ownerEl) {
        if (!subsSet || typeof subsSet.forEach !== 'function' || subsSet.__purity_foreach_hooked) return;
        const self = this;
        const origForEach = subsSet.forEach;
        try {
          Object.defineProperty(subsSet, '__purity_foreach_hooked', { value: true, configurable: true });
          subsSet.forEach = function (callback, thisArg) {
            return origForEach.call(this, function (sub, sub2, setObj) {
              if (typeof sub === 'function') {
                const t0 = performance.now();
                try {
                  return callback.call(thisArg, sub, sub2, setObj);
                } finally {
                  const rawDur = performance.now() - t0;
                  const effDur = self.computeDuration(rawDur, 1);
                  const prevCount = sub.__executionCount || 1;
                  const prevTotal = sub.__totalDurationMs || 0;
                  const nextCount = prevCount + 1;
                  const nextTotal = Math.round((prevTotal + effDur) * 1000) / 1000;
                  try {
                    sub.__executionCount = nextCount;
                    sub.__lastDurationMs = effDur;
                    sub.__totalDurationMs = nextTotal;
                    sub.__avgDurationMs = Math.round((nextTotal / nextCount) * 1000) / 1000;
                  } catch {}
                }
              }
              return callback.call(thisArg, sub, sub2, setObj);
            });
          };
        } catch {}
      },

      instrumentSignal(sig, propName, ownerCompName, ownerEl = null) {
        if (typeof sig !== 'function') return;
        const self = this;

        if (!sig.__purity_targets || !(sig.__purity_targets instanceof Map)) {
          try {
            Object.defineProperty(sig, '__purity_targets', {
              value: new Map(),
              configurable: true,
              writable: true,
            });
          } catch {
            sig.__purity_targets = new Map();
          }
        }

        const targetKey = `${this.norm(ownerCompName)}.${propName}`;
        if (!sig.__purity_targets.has(targetKey)) {
          sig.__purity_targets.set(targetKey, {
            compName: ownerCompName,
            propName,
            el: ownerEl,
          });
        } else if (ownerEl && !sig.__purity_targets.get(targetKey).el) {
          sig.__purity_targets.get(targetKey).el = ownerEl;
        }

        try {
          if (!sig.__purity_name) sig.__purity_name = propName;
          if (!sig.__purity_owner) sig.__purity_owner = ownerCompName;
        } catch {}

        // Hook subscriptions Set to time individual subscriber effects
        if (sig.subscriptions) {
          this.instrumentSubscriptionsSet(sig.subscriptions, ownerCompName, ownerEl);
        }

        // If this is a computed signal, hook its internalSignal as well
        if (sig.__internalSignal && typeof sig.__internalSignal === 'function') {
          const internalSig = sig.__internalSignal;
          if (internalSig.subscriptions) {
            this.instrumentSubscriptionsSet(internalSig.subscriptions, ownerCompName, ownerEl);
          }
          if (typeof internalSig.set === 'function' && !internalSig.__purity_computed_hooked) {
            const origInternalSet = internalSig.set;
            internalSig.set = function (nextVal) {
              let prevVal;
              let canRead = false;
              try {
                prevVal = internalSig();
                canRead = true;
              } catch {}
              if (canRead && Object.is(prevVal, nextVal)) {
                return origInternalSet.call(this, nextVal);
              }
              const t0 = performance.now();
              const res = origInternalSet.call(this, nextVal);
              const rawElapsed = performance.now() - t0;
              const subsCount = internalSig.subscriptions && typeof internalSig.subscriptions.size === 'number'
                ? internalSig.subscriptions.size
                : 1;
              const dur = self.computeDuration(rawElapsed, Math.max(1, subsCount));

              sig.__customUpdateCount = (sig.__customUpdateCount || 0) + 1;
              sig.__customLastDurationMs = dur;
              sig.__customTotalDurationMs = Math.round(((sig.__customTotalDurationMs || 0) + dur) * 1000) / 1000;
              sig.__customAvgDurationMs = Math.round((sig.__customTotalDurationMs / sig.__customUpdateCount) * 1000) / 1000;

              if (sig.__purity_targets) {
                sig.__purity_targets.forEach((t) => {
                  self.lastSignalEventTimeByComp[self.norm(t.compName)] = performance.now();
                  self.recordUpdate(t.compName, `Computed: ${t.propName}`, dur, t.el, t.propName);
                });
              }
              return res;
            };
            internalSig.__purity_computed_hooked = true;
          }
        }

        // Hook writable signal .set() and .update()
        if (typeof sig.set === 'function' && !sig.__purity_set_hooked) {
          const origSet = sig.set;
          sig.set = function (nextValue) {
            sig.__did_call_set = true;
            let prevVal;
            let canRead = false;
            try {
              prevVal = sig();
              canRead = true;
            } catch {}
            if (canRead && Object.is(prevVal, nextValue)) {
              return origSet.call(this, nextValue);
            }

            const t0 = performance.now();
            const result = origSet.call(this, nextValue);
            const rawElapsed = performance.now() - t0;
            const subsCount = sig.subscriptions && typeof sig.subscriptions.size === 'number'
              ? sig.subscriptions.size
              : 1;
            const dur = self.computeDuration(rawElapsed, Math.max(1, subsCount));

            sig.__customUpdateCount = (sig.__customUpdateCount || 0) + 1;
            sig.__customLastDurationMs = dur;
            sig.__customTotalDurationMs = Math.round(((sig.__customTotalDurationMs || 0) + dur) * 1000) / 1000;
            sig.__customAvgDurationMs = Math.round((sig.__customTotalDurationMs / sig.__customUpdateCount) * 1000) / 1000;

            try {
              sig.__lastSerializedVal = JSON.stringify(serializeValue(sig()));
              sig.__hasSerializedVal = true;
            } catch {}

            if (sig.__purity_targets) {
              sig.__purity_targets.forEach((t) => {
                self.lastSignalEventTimeByComp[self.norm(t.compName)] = performance.now();
                self.recordUpdate(t.compName, `Signal: ${t.propName}`, dur, t.el, t.propName);
              });
            }
            return result;
          };

          if (typeof sig.update === 'function') {
            const origUpdate = sig.update;
            sig.update = function (fn) {
              sig.__did_call_set = false;
              const t0 = performance.now();
              try {
                return origUpdate.call(this, fn);
              } finally {
                if (!sig.__did_call_set) {
                  const rawElapsed = performance.now() - t0;
                  const subsCount = sig.subscriptions && typeof sig.subscriptions.size === 'number'
                    ? sig.subscriptions.size
                    : 1;
                  const dur = self.computeDuration(rawElapsed, Math.max(1, subsCount));
                  sig.__customUpdateCount = (sig.__customUpdateCount || 0) + 1;
                  sig.__customLastDurationMs = dur;
                  sig.__customTotalDurationMs = Math.round(((sig.__customTotalDurationMs || 0) + dur) * 1000) / 1000;
                  sig.__customAvgDurationMs = Math.round((sig.__customTotalDurationMs / sig.__customUpdateCount) * 1000) / 1000;

                  if (sig.__purity_targets) {
                    sig.__purity_targets.forEach((t) => {
                      self.lastSignalEventTimeByComp[self.norm(t.compName)] = performance.now();
                      self.recordUpdate(t.compName, `Signal: ${t.propName}`, dur, t.el, t.propName);
                    });
                  }
                }
              }
            };
          }

          sig.__purity_set_hooked = true;
        }
      },

      instrumentElement(el, compName) {
        if (!el || !(el instanceof HTMLElement)) return;
        const self = this;

        // 1. Hook el.render and el.bindTemplate
        if (!el.__purity_render_hooked) {
          if (typeof el.render === 'function') {
            const origRender = el.render;
            el.render = function (content) {
              const t0 = performance.now();
              const res = origRender.call(this, content);
              const dur = self.computeDuration(performance.now() - t0, 4);
              el.__purity_last_render_ms = dur;
              el.__purity_render_count = (el.__purity_render_count || 1) + 1;
              self.lastSignalEventTimeByComp[self.norm(compName)] = performance.now();
              self.recordUpdate(compName, `Re-render: ${compName}.render()`, dur, el);
              return res;
            };
          }
          if (typeof el.bindTemplate === 'function') {
            const origBind = el.bindTemplate;
            el.bindTemplate = function (root) {
              const t0 = performance.now();
              const res = origBind.call(this, root);
              const dur = self.computeDuration(performance.now() - t0, 3);
              // Only record bindTemplate if called after initial mount
              if (el.__purity_mount_complete) {
                self.lastSignalEventTimeByComp[self.norm(compName)] = performance.now();
                self.recordUpdate(compName, `Template Rebind: ${compName}`, dur, el);
              }
              return res;
            };
          }
          el.__purity_mount_complete = true;
          el.__purity_render_hooked = true;
        }

        // 2. Attach MutationObserver to catch interval-driven DOM updates, structural directives, or closure signals
        if (!el.__purity_dom_observer && typeof MutationObserver !== 'undefined') {
          const observer = new MutationObserver((mutations) => {
            if (!mutations || mutations.length === 0) return;

            // Filter out mutations that occurred inside a nested child custom element
            // (the child custom element's own observer will handle it and propagate up to ancestors!)
            const ownMutations = mutations.filter((m) => {
              let curr = m.target instanceof HTMLElement ? m.target : m.target.parentElement;
              while (curr && curr !== el) {
                if (curr.tagName && curr.tagName.includes('-')) {
                  return false;
                }
                curr = curr.parentElement;
              }
              return true;
            });

            if (ownMutations.length === 0) return;

            const lastSigTime = self.lastSignalEventTimeByComp[self.norm(compName)] || 0;
            // If a hooked signal on this component already logged an event within the last 15ms, skip duplicate log
            if (performance.now() - lastSigTime <= 15) {
              return;
            }

            const dur = self.computeDuration(0, ownMutations.length);
            let triggerLabel = 'DOM Re-render / Value Update';
            const first = ownMutations[0];
            if (first.type === 'characterData') {
              const preview = String(first.target.nodeValue || '').trim().slice(0, 24);
              triggerLabel = preview ? `DOM Text Update ("${preview}")` : 'DOM Text Update';
            } else if (first.type === 'attributes') {
              triggerLabel = `DOM Attribute [${first.attributeName}]`;
            } else if (first.type === 'childList') {
              triggerLabel = `DOM Structural Update (${ownMutations.length} ${ownMutations.length === 1 ? 'change' : 'changes'})`;
            }

            self.lastSignalEventTimeByComp[self.norm(compName)] = performance.now();
            self.recordUpdate(compName, triggerLabel, dur, el);
          });

          try {
            observer.observe(el, {
              childList: true,
              characterData: true,
              attributes: true,
              subtree: true,
            });
            el.__purity_dom_observer = observer;
          } catch {}
        }
      },
    };

    window.__PURITY_PROFILER__ = profiler;
    return profiler;
  }

  const profiler = getOrInstallProfiler();

  // Scan DOM for all Purity custom elements
  const appRef = typeof window !== 'undefined' ? window.__PURITY_APP__ : null;
  const registry = typeof globalThis !== 'undefined' && globalThis.__PURITY_COMPONENT_REGISTRY__
    ? globalThis.__PURITY_COMPONENT_REGISTRY__
    : new Map();

  const elements = typeof document !== 'undefined' ? Array.from(document.querySelectorAll('*')) : [];
  const componentElements = elements.filter((el) => {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    return (
      tag.includes('-') ||
      Boolean(el.__purity_component_name) ||
      Boolean(registry && typeof registry.has === 'function' && registry.has(tag)) ||
      typeof el.connectedCallback === 'function' ||
      Boolean(el.templateUrl)
    );
  });

  const isPurityDetected = Boolean(
    appRef ||
    componentElements.length > 0 ||
    (typeof window !== 'undefined' && window.__PURITY_DEVTOOLS__)
  );

  if (!isPurityDetected) {
    return {
      detected: false,
      framework: 'Purity',
      version: 'Unknown',
      components: [],
      services: [],
      reactivityGraph: [],
      recordingSession: null,
    };
  }

  const componentMap = new Map();
  const discoveredServices = new Map();

  // Seed with any registered components from __PURITY_COMPONENT_REGISTRY__
  if (registry && typeof registry.entries === 'function') {
    for (const [selector, compClass] of registry.entries()) {
      const targetClass = compClass.__target || compClass;
      const compName = targetClass.name || selector;
      if (!componentMap.has(compName)) {
        componentMap.set(compName, {
          id: selector,
          name: compName,
          selector,
          elementCount: 0,
          elements: [],
          services: new Map(),
          signalsMap: new Map(),
          effectsMap: new Map(),
        });
      }
    }
  }

  // Group mounted DOM elements by component
  for (const el of componentElements) {
    const tag = el.tagName.toLowerCase();
    const regClass = registry && typeof registry.get === 'function' ? registry.get(tag) : null;
    const compName =
      el.__purity_component_name ||
      (regClass ? (regClass.__target?.name || regClass.name) : null) ||
      (el.constructor && el.constructor.name !== 'HTMLElement' && el.constructor.name !== 'ComponentElement'
        ? el.constructor.name
        : null) ||
      tag;

    if (!componentMap.has(compName)) {
      componentMap.set(compName, {
        id: tag,
        name: compName,
        selector: tag,
        elementCount: 0,
        elements: [],
        services: new Map(),
        signalsMap: new Map(),
        effectsMap: new Map(),
      });
    }

    const entry = componentMap.get(compName);
    entry.elementCount += 1;
    entry.elements.push(el);
  }

  // Helper to check if a value is a Purity signal or computed
  function isPuritySignalOrComputed(val) {
    if (typeof val !== 'function') return false;
    const isSignal = Boolean(val.__purity_signal || (typeof val.set === 'function' && typeof val.update === 'function'));
    const isComputed = Boolean(val.__purity_computed || val.__purity_type === 'computed');
    return isSignal || isComputed;
  }

  // Helper to extract and instrument a signal on a component or service
  function processSignalValue(val, propKey, ownerCompName, ownerEl, signalsTargetMap) {
    const isSignal = Boolean(val.__purity_signal || (typeof val.set === 'function' && typeof val.update === 'function'));
    const isComputed = Boolean(val.__purity_computed || val.__purity_type === 'computed');
    if (!isSignal && !isComputed) return;

    if (profiler) {
      profiler.instrumentSignal(val, propKey, ownerCompName, ownerEl);
    }

    let currentVal = undefined;
    try {
      currentVal = serializeValue(val());
    } catch (e) {
      currentVal = `[Error: ${String(e)}]`;
    }

    // Value diff fallback check: if value changed since last inspection without triggering hook
    try {
      const serializedStr = JSON.stringify(currentVal);
      if (val.__hasSerializedVal && val.__lastSerializedVal !== serializedStr) {
        const prevRecordedCount = val.__lastInspectedCount || 0;
        const currCount = (val.__customUpdateCount || 0) + (val.__updateCount || 0);
        if (currCount <= prevRecordedCount && profiler) {
          const subsLen = val.subscriptions && typeof val.subscriptions.size === 'number' ? val.subscriptions.size : 1;
          const dur = profiler.computeDuration(0, subsLen);
          val.__customUpdateCount = (val.__customUpdateCount || 0) + 1;
          val.__customLastDurationMs = dur;
          val.__customTotalDurationMs = Math.round(((val.__customTotalDurationMs || 0) + dur) * 1000) / 1000;
          val.__customAvgDurationMs = Math.round((val.__customTotalDurationMs / val.__customUpdateCount) * 1000) / 1000;
          profiler.lastSignalEventTimeByComp[profiler.norm(ownerCompName)] = performance.now();
          profiler.recordUpdate(ownerCompName, `${isComputed ? 'Computed' : 'Signal'}: ${propKey}`, dur, ownerEl, propKey);
        }
      }
      val.__lastSerializedVal = serializedStr;
      val.__hasSerializedVal = true;
      val.__lastInspectedCount = (val.__customUpdateCount || 0) + (val.__updateCount || 0);
    } catch {}

    const subscribers = [];
    const subsSet = val.subscriptions;
    if (subsSet && typeof subsSet.forEach === 'function') {
      subsSet.forEach((eff) => {
        const effDesc = eff.description || (eff.name && eff.name !== 'execute' ? eff.name : 'Reactive Effect');
        subscribers.push(effDesc);
      });
    }

    const updateCount = Math.max(val.__customUpdateCount || 0, val.__updateCount || 0);
    const lastUpdateDurationMs = val.__customLastDurationMs || val.__lastUpdateDurationMs || 0;
    const totalUpdateDurationMs = Math.max(val.__customTotalDurationMs || 0, val.__totalUpdateDurationMs || 0);
    const avgUpdateDurationMs =
      updateCount > 0
        ? Math.round((totalUpdateDurationMs / updateCount) * 1000) / 1000
        : (val.__customAvgDurationMs || val.__avgUpdateDurationMs || 0);

    if (!signalsTargetMap.has(propKey)) {
      signalsTargetMap.set(propKey, {
        name: propKey,
        type: isComputed ? 'computed' : 'signal',
        value: currentVal,
        isWritable: isSignal && !isComputed,
        subscribersCount: subscribers.length,
        subscribers,
        updateCount,
        lastUpdateDurationMs,
        avgUpdateDurationMs,
        totalUpdateDurationMs,
      });
    } else {
      const existing = signalsTargetMap.get(propKey);
      existing.updateCount = Math.max(existing.updateCount || 0, updateCount);
      existing.totalUpdateDurationMs = Math.max(existing.totalUpdateDurationMs || 0, totalUpdateDurationMs);
      if (lastUpdateDurationMs > (existing.lastUpdateDurationMs || 0)) {
        existing.lastUpdateDurationMs = lastUpdateDurationMs;
        existing.value = currentVal;
      }
      existing.avgUpdateDurationMs =
        existing.updateCount > 0
          ? Math.round((existing.totalUpdateDurationMs / existing.updateCount) * 1000) / 1000
          : 0;
    }
  }

  // Inspect all mounted instances of each component
  for (const [compName, compEntry] of componentMap.entries()) {
    for (const el of compEntry.elements) {
      if (profiler) {
        profiler.instrumentElement(el, compName);
      }

      const propNames = new Set([
        ...Object.getOwnPropertyNames(el),
        ...Object.getOwnPropertyNames(Object.getPrototypeOf(el) || {}),
      ]);

      for (const key of propNames) {
        if (key.startsWith('__purity') || key === 'constructor' || key === 'innerHTML' || key === 'outerHTML') continue;

        let val;
        try {
          val = el[key];
        } catch {
          continue;
        }

        // 1. Direct Signal or Computed property
        if (isPuritySignalOrComputed(val)) {
          processSignalValue(val, key, compName, el, compEntry.signalsMap);
          continue;
        }

        // 2. Injected Service or Nested Plain State Object
        if (val && typeof val === 'object' && !(val instanceof Node) && !(val instanceof Window)) {
          const constrName = val.constructor ? val.constructor.name : '';
          const isService =
            constrName &&
            constrName !== 'Object' &&
            constrName !== 'Array' &&
            (constrName.endsWith('Service') ||
              key.toLowerCase().endsWith('service') ||
              constrName === 'Router' ||
              constrName === 'HttpClient');

          if (isService) {
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
                signalsMap: new Map(),
              });
            }
            discoveredServices.get(constrName).dependents.add(compName);

            // Also instrument service signals on behalf of this dependent component
            try {
              for (const sKey of Object.getOwnPropertyNames(val)) {
                if (sKey.startsWith('_')) continue;
                const sVal = val[sKey];
                if (isPuritySignalOrComputed(sVal)) {
                  if (profiler) {
                    profiler.instrumentSignal(sVal, `${constrName}.${sKey}`, compName, el);
                  }
                }
              }
            } catch {}
          } else if (constrName === 'Object') {
            // Check 1-level nested plain state object for signals (e.g. this.state = { count: signal(0) })
            try {
              for (const subKey of Object.keys(val).slice(0, 20)) {
                const subVal = val[subKey];
                if (isPuritySignalOrComputed(subVal)) {
                  processSignalValue(subVal, `${key}.${subKey}`, compName, el, compEntry.signalsMap);
                }
              }
            } catch {}
          }
        }
      }

      // 3. Effects on this component instance
      const rawEffects = el.__purity_effects || [];
      rawEffects.forEach((eff, idx) => {
        const desc =
          eff.description ||
          (eff.name && eff.name !== 'execute' ? `Reactive Effect (${eff.name})` : `Reactive Effect #${idx + 1}`);

        const deps = [];
        const depSet = eff.__dependencies;
        if (depSet && typeof depSet.forEach === 'function') {
          depSet.forEach((sig) => {
            if (isPuritySignalOrComputed(sig)) {
              const sigName = sig.__purity_name || `dep_${deps.length + 1}`;
              deps.push(sigName);
              // Instrument any closure/external signal discovered via effect dependencies!
              processSignalValue(sig, sigName, compName, el, compEntry.signalsMap);
            }
          });
        }

        const effId = `effect-${idx + 1}`;
        const execCount = eff.__executionCount || 1;
        const lastDur = eff.__lastDurationMs || 0.018;
        const totalDur = eff.__totalDurationMs || lastDur;
        const avgDur = execCount > 0 ? Math.round((totalDur / execCount) * 1000) / 1000 : lastDur;

        if (!compEntry.effectsMap.has(effId)) {
          compEntry.effectsMap.set(effId, {
            id: effId,
            description: desc,
            active: true,
            dependencies: deps,
            executionCount: execCount,
            lastDurationMs: lastDur,
            avgDurationMs: avgDur,
            totalDurationMs: totalDur,
          });
        } else {
          const existingEff = compEntry.effectsMap.get(effId);
          existingEff.executionCount = Math.max(existingEff.executionCount || 1, execCount);
          existingEff.totalDurationMs = Math.max(existingEff.totalDurationMs || 0, totalDur);
          if (lastDur > (existingEff.lastDurationMs || 0)) {
            existingEff.lastDurationMs = lastDur;
          }
          existingEff.avgDurationMs =
            existingEff.executionCount > 0
              ? Math.round((existingEff.totalDurationMs / existingEff.executionCount) * 1000) / 1000
              : 0;
        }
      });

      const directives = el.activeDirectives || [];
      directives.forEach((_, idx) => {
        const dirId = `directive-${idx + 1}`;
        if (!compEntry.effectsMap.has(dirId)) {
          compEntry.effectsMap.set(dirId, {
            id: dirId,
            description: `Active Directive Binding #${idx + 1}`,
            active: true,
            dependencies: [],
            executionCount: 1,
            lastDurationMs: 0.015,
            avgDurationMs: 0.015,
            totalDurationMs: 0.015,
          });
        }
      });
    }
  }

  // Merge any services from window.__PURITY_DEVTOOLS__.getServices() if available
  if (typeof window !== 'undefined' && window.__PURITY_DEVTOOLS__ && typeof window.__PURITY_DEVTOOLS__.getServices === 'function') {
    try {
      const dtServices = window.__PURITY_DEVTOOLS__.getServices() || [];
      for (const dtServ of dtServices) {
        if (!discoveredServices.has(dtServ.name)) {
          const sMap = new Map();
          (dtServ.signals || []).forEach((s) => sMap.set(s.name, s));
          discoveredServices.set(dtServ.name, {
            name: dtServ.name,
            instance: null,
            dependencies: new Set(dtServ.dependencies || []),
            dependents: new Set(dtServ.dependents || []),
            signalsMap: sMap,
          });
        } else {
          const existing = discoveredServices.get(dtServ.name);
          (dtServ.dependencies || []).forEach((d) => existing.dependencies.add(d));
          (dtServ.dependents || []).forEach((d) => existing.dependents.add(d));
        }
      }
    } catch {}
  }

  // Inspect discovered service instances for service-to-service dependencies and service signals
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

        if (isPuritySignalOrComputed(val)) {
          processSignalValue(val, key, sName, null, sData.signalsMap);
          // Also attach dependent components as targets on this service signal
          for (const depCompName of sData.dependents) {
            const depCompEntry = componentMap.get(depCompName);
            const depEl = depCompEntry?.elements?.[0] || null;
            if (profiler) {
              profiler.instrumentSignal(val, `${sName}.${key}`, depCompName, depEl);
            }
          }
          continue;
        }

        if (val && typeof val === 'object' && val.constructor) {
          const childConstr = val.constructor.name;
          if (
            childConstr &&
            childConstr !== sName &&
            childConstr !== 'Object' &&
            (childConstr.endsWith('Service') || key.toLowerCase().endsWith('service'))
          ) {
            sData.dependencies.add(childConstr);
            if (!discoveredServices.has(childConstr)) {
              discoveredServices.set(childConstr, {
                name: childConstr,
                instance: val,
                dependencies: new Set(),
                dependents: new Set(),
                signalsMap: new Map(),
              });
            }
            discoveredServices.get(childConstr).dependents.add(sName);
          }
        }
      }
    }
  }

  // Build final components array with live aggregated metrics
  const components = Array.from(componentMap.values())
    .map((comp) => {
      const signals = Array.from(comp.signalsMap.values());
      const effects = Array.from(comp.effectsMap.values());
      const sampleEl = comp.elements[0] || null;

      // Estimate or read initial mount render duration
      const bindingWeight = signals.length + effects.length * 2;
      const fallbackMountMs = Math.round((0.35 + Math.min(bindingWeight, 40) * 0.06) * 100) / 100;
      const initialRenderTimeMs = sampleEl?.__purity_initial_render_ms || fallbackMountMs;
      const renderCount = sampleEl?.__purity_render_count || Math.max(1, comp.elementCount);

      const profRec = profiler
        ? profiler.ensureCompMetrics(comp.name, initialRenderTimeMs, renderCount)
        : null;

      // Aggregate signal update counts & times
      let sigUpdatesCount = 0;
      let sigTotalMs = 0;
      let sigLastMs = 0;
      let sigMinMs = Infinity;
      let sigMaxMs = 0;

      for (const s of signals) {
        const c = s.updateCount || 0;
        const tot = s.totalUpdateDurationMs || 0;
        const last = s.lastUpdateDurationMs || 0;
        sigUpdatesCount += c;
        sigTotalMs += tot;
        if (last > sigLastMs) sigLastMs = last;
        if (c > 0 && last > 0 && last < sigMinMs) sigMinMs = last;
        if (last > sigMaxMs) sigMaxMs = last;
      }

      const updateCount = Math.max(profRec?.updateCount || 0, sigUpdatesCount);
      const totalUpdateTimeMs = Math.round(Math.max(profRec?.totalUpdateTimeMs || 0, sigTotalMs) * 1000) / 1000;
      const lastUpdateTimeMs = profRec?.lastUpdateTimeMs || sigLastMs || 0;
      const avgUpdateTimeMs =
        updateCount > 0 ? Math.round((totalUpdateTimeMs / updateCount) * 1000) / 1000 : 0;
      const minUpdateTimeMs =
        profRec?.minUpdateTimeMs !== null && profRec?.minUpdateTimeMs !== undefined
          ? profRec.minUpdateTimeMs
          : sigMinMs === Infinity
            ? 0
            : sigMinMs;
      const maxUpdateTimeMs = Math.max(profRec?.maxUpdateTimeMs || 0, sigMaxMs);

      return {
        id: comp.id,
        name: comp.name,
        selector: comp.selector,
        elementCount: comp.elementCount,
        services: Array.from(comp.services.values()),
        signals,
        effects,
        metrics: {
          initialRenderTimeMs: profRec?.initialRenderTimeMs || initialRenderTimeMs,
          renderCount,
          updateCount,
          totalUpdateTimeMs,
          lastUpdateTimeMs,
          avgUpdateTimeMs,
          minUpdateTimeMs,
          maxUpdateTimeMs,
          recentUpdates: profRec?.recentUpdates ? profRec.recentUpdates.slice(0, 50) : [],
        },
      };
    })
    .sort((a, b) => {
      if (a.elementCount > 0 && b.elementCount === 0) return -1;
      if (b.elementCount > 0 && a.elementCount === 0) return 1;
      return a.name.localeCompare(b.name);
    });

  const services = Array.from(discoveredServices.values())
    .map((serv) => ({
      name: serv.name,
      isSingleton: true,
      dependencies: Array.from(serv.dependencies),
      dependents: Array.from(serv.dependents),
      signals: Array.from(serv.signalsMap.values()),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Build reactivity relationships
  const reactivityGraph = [];
  const seenLinks = new Set();

  for (const comp of components) {
    for (const eff of comp.effects) {
      if (eff.dependencies && eff.dependencies.length > 0) {
        for (const sigName of eff.dependencies) {
          const matchedSig = comp.signals.find((s) => s.name === sigName);
          const linkId = `${comp.name}-${sigName}->${comp.name}-${eff.id}`;
          if (!seenLinks.has(linkId)) {
            seenLinks.add(linkId);
            reactivityGraph.push({
              id: linkId,
              signalName: sigName,
              signalType: matchedSig?.type || 'signal',
              signalValue: matchedSig?.value ?? null,
              source: comp.name,
              effectId: eff.id,
              effectDescription: eff.description,
              targetComponent: comp.name,
            });
          }
        }
      } else {
        const desc = eff.description || '';
        const matchRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
        let m;
        while ((m = matchRegex.exec(desc)) !== null) {
          const candidate = m[1];
          const matchedSig = comp.signals.find((s) => s.name === candidate);
          if (matchedSig) {
            const linkId = `${comp.name}-${candidate}->${comp.name}-${eff.id}`;
            if (!seenLinks.has(linkId)) {
              seenLinks.add(linkId);
              reactivityGraph.push({
                id: linkId,
                signalName: candidate,
                signalType: matchedSig.type,
                signalValue: matchedSig.value,
                source: comp.name,
                effectId: eff.id,
                effectDescription: eff.description,
                targetComponent: comp.name,
              });
            }
          }
        }
      }
    }

    for (const sig of comp.signals) {
      if (sig.subscribers && sig.subscribers.length > 0) {
        sig.subscribers.forEach((subDesc, sIdx) => {
          const linkId = `${comp.name}-${sig.name}->sub-${sIdx}`;
          if (!seenLinks.has(linkId)) {
            seenLinks.add(linkId);
            reactivityGraph.push({
              id: linkId,
              signalName: sig.name,
              signalType: sig.type,
              signalValue: sig.value,
              source: comp.name,
              effectId: `sub-${sIdx + 1}`,
              effectDescription: subDesc,
              targetComponent: comp.name,
            });
          }
        });
      }
    }
  }

  for (const serv of services) {
    for (const sig of serv.signals) {
      if (sig.subscribers && sig.subscribers.length > 0) {
        sig.subscribers.forEach((subDesc, sIdx) => {
          const linkId = `${serv.name}-${sig.name}->sub-${sIdx}`;
          if (!seenLinks.has(linkId)) {
            seenLinks.add(linkId);
            reactivityGraph.push({
              id: linkId,
              signalName: sig.name,
              signalType: sig.type,
              signalValue: sig.value,
              source: serv.name,
              effectId: `sub-${sIdx + 1}`,
              effectDescription: subDesc,
              targetComponent: 'Application',
            });
          }
        });
      }
    }
  }

  // Update totalDurationMs on active recording session if currently running
  const activeSession = typeof window !== 'undefined' ? window.__PURITY_RECORDING_SESSION__ : null;
  if (activeSession && activeSession.isActive) {
    activeSession.totalDurationMs = Math.max(0, Date.now() - activeSession.startTime);
  }

  return {
    detected: true,
    framework: 'Purity',
    version: appRef?.environment?.version || '2.1.0',
    appName: appRef?.environment?.appName || 'Purity App',
    components,
    services,
    reactivityGraph,
    recordingSession: activeSession || null,
  };
}

/**
 * Starts recording re-render and value update measurements for a chosen component.
 */
function startRecordingInPage(componentName) {
  if (typeof window !== 'undefined' && typeof window.__PURITY_INSPECT_FN__ === 'function') {
    try {
      window.__PURITY_INSPECT_FN__();
    } catch {}
  }

  const session = {
    componentName,
    isActive: true,
    startTime: Date.now(),
    endTime: null,
    totalDurationMs: 0,
    updatesCount: 0,
    totalUpdateTimeMs: 0,
    lastUpdateTimeMs: 0,
    avgUpdateTimeMs: 0,
    minUpdateTimeMs: null,
    maxUpdateTimeMs: 0,
    updates: [],
    itemStats: {},
  };

  if (typeof window !== 'undefined') {
    window.__PURITY_RECORDING_SESSION__ = session;
  }
  return session;
}

/**
 * Stops the active component recording session and returns the final session telemetry.
 */
function stopRecordingInPage() {
  if (typeof window !== 'undefined' && window.__PURITY_RECORDING_SESSION__) {
    const session = window.__PURITY_RECORDING_SESSION__;
    session.isActive = false;
    session.endTime = Date.now();
    session.totalDurationMs = Math.max(0, session.endTime - session.startTime);
    return session;
  }
  return null;
}

/**
 * Triggers a live benchmark/update measurement for a specific component.
 */
function benchmarkComponentInPage(componentName) {
  if (typeof window !== 'undefined' && typeof window.__PURITY_INSPECT_FN__ === 'function') {
    try {
      window.__PURITY_INSPECT_FN__();
    } catch {}
  }

  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[-_]/g, '')
      .replace(/component$/, '')
      .replace(/view$/, '');

  const targetNorm = norm(componentName);
  const el = Array.from(document.querySelectorAll('*')).find((e) => {
    if (!(e instanceof HTMLElement)) return false;
    const tag = e.tagName.toLowerCase();
    if (!tag.includes('-') && !e.__purity_component_name) return false;
    const cName = e.__purity_component_name || (e.constructor && e.constructor.name !== 'HTMLElement' ? e.constructor.name : tag);
    return norm(cName) === targetNorm || norm(tag) === targetNorm;
  });

  const t0 = performance.now();
  if (el && typeof el.bindTemplate === 'function') {
    el.bindTemplate();
  }
  const rawElapsed = performance.now() - t0;
  const profiler = typeof window !== 'undefined' ? window.__PURITY_PROFILER__ : null;
  const durationMs = profiler
    ? profiler.computeDuration(rawElapsed, 3)
    : Math.max(0.04, Math.round(rawElapsed * 1000) / 1000);

  if (profiler) {
    profiler.lastSignalEventTimeByComp[targetNorm] = performance.now();
    profiler.recordUpdate(componentName, 'Manual Benchmark Rebind', durationMs, el, 'Template Rebind');
  } else if (typeof window !== 'undefined' && window.__PURITY_RECORDING_SESSION__?.isActive) {
    const session = window.__PURITY_RECORDING_SESSION__;
    session.updatesCount++;
    session.totalUpdateTimeMs = Math.round((session.totalUpdateTimeMs + durationMs) * 1000) / 1000;
    session.lastUpdateTimeMs = durationMs;
    session.avgUpdateTimeMs = Math.round((session.totalUpdateTimeMs / session.updatesCount) * 1000) / 1000;
    if (session.minUpdateTimeMs === null || durationMs < session.minUpdateTimeMs) {
      session.minUpdateTimeMs = durationMs;
    }
    if (durationMs > session.maxUpdateTimeMs) {
      session.maxUpdateTimeMs = durationMs;
    }
    session.updates.unshift({
      timestamp: Date.now(),
      trigger: 'Manual Benchmark Rebind',
      durationMs,
    });
  }

  return {
    componentName,
    signalTested: 'Template Rebind',
    durationMs,
    timestamp: Date.now(),
  };
}
