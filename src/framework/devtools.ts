import { container } from './di';

export interface SignalInfo {
    name: string;
    type: 'signal' | 'computed';
    value: any;
    isWritable: boolean;
    subscribersCount?: number;
    subscribers?: string[];
    updateCount?: number;
    lastUpdateDurationMs?: number;
    avgUpdateDurationMs?: number;
    totalUpdateDurationMs?: number;
}

export interface ServiceUsageInfo {
    name: string;
    propertyKey?: string;
}

export interface EffectInfo {
    id: string;
    description: string;
    active: boolean;
    dependencies?: string[];
    executionCount?: number;
    lastDurationMs?: number;
    avgDurationMs?: number;
    totalDurationMs?: number;
}

export interface ComponentMetrics {
    initialRenderTimeMs: number;
    renderCount: number;
    updateCount: number;
    totalUpdateTimeMs: number;
    lastUpdateTimeMs: number;
    avgUpdateTimeMs: number;
    minUpdateTimeMs: number;
    maxUpdateTimeMs: number;
    recentUpdates: Array<{ timestamp: number; trigger: string; durationMs: number }>;
}

export interface ComponentInspection {
    id: string;
    name: string;
    selector: string;
    elementCount: number;
    services: ServiceUsageInfo[];
    signals: SignalInfo[];
    effects: EffectInfo[];
    metrics?: ComponentMetrics;
}

export interface ServiceInspection {
    name: string;
    isSingleton: boolean;
    dependencies: string[];
    dependents: string[];
    signals: SignalInfo[];
}

export interface ReactiveLink {
    id: string;
    signalName: string;
    signalType: 'signal' | 'computed';
    signalValue: any;
    source: string; // Component or Service name
    effectId: string;
    effectDescription: string;
    targetComponent: string;
}

export interface PurityInspectionSnapshot {
    detected: boolean;
    framework: string;
    version: string;
    timestamp: number;
    components: ComponentInspection[];
    services: ServiceInspection[];
    reactivityGraph: ReactiveLink[];
    recordingSession?: any;
}

/**
 * Safely serializes values for inspector consumption, avoiding circular references and dom nodes.
 */
function serializeValue(val: any, depth = 0): any {
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
        const out: Record<string, any> = {};
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

/**
 * Inspects an object (component or service) to discover signals and their current values.
 */
function extractSignalsFromObject(target: any, ownerName = 'Unknown'): SignalInfo[] {
    if (!target || typeof target !== 'object') return [];
    const signals: SignalInfo[] = [];
    const visited = new Set<string>();

    const checkProp = (propKey: string, val: any) => {
        if (!propKey || visited.has(propKey)) return;
        if (propKey.startsWith('_') && !propKey.startsWith('__purity')) return;
        visited.add(propKey);

        if (typeof val === 'function') {
            const isSignal = Boolean(
                val.__purity_signal ||
                (typeof val.set === 'function' && typeof val.update === 'function')
            );
            const isComputed = Boolean(
                val.__purity_computed ||
                (val.__purity_type === 'computed')
            );

            if (isSignal || isComputed) {
                let currentVal: any = undefined;
                try {
                    currentVal = serializeValue(val());
                } catch (err) {
                    currentVal = `[Error evaluating: ${String(err)}]`;
                }

                // Tag signal with metadata for reactive relationship discovery
                try {
                    (val as any).__purity_name = propKey;
                    (val as any).__purity_owner = ownerName;
                } catch {}

                const subscribers: string[] = [];
                const subsSet: Set<any> | undefined = (val as any).subscriptions;
                if (subsSet && typeof subsSet.forEach === 'function') {
                    subsSet.forEach((eff: any) => {
                        const effDesc =
                            eff.description ||
                            (eff.name && eff.name !== 'execute' ? eff.name : 'Reactive Effect');
                        subscribers.push(effDesc);
                    });
                }

                signals.push({
                    name: propKey,
                    type: isComputed ? 'computed' : 'signal',
                    value: currentVal,
                    isWritable: isSignal && !isComputed,
                    subscribersCount: subscribers.length,
                    subscribers,
                    updateCount: (val as any).__updateCount || 0,
                    lastUpdateDurationMs: (val as any).__lastUpdateDurationMs || 0,
                    avgUpdateDurationMs: (val as any).__avgUpdateDurationMs || 0,
                    totalUpdateDurationMs: (val as any).__totalUpdateDurationMs || 0,
                });
            }
        }
    };

    // Check own properties
    for (const key of Object.getOwnPropertyNames(target)) {
        try {
            checkProp(key, target[key]);
        } catch {}
    }

    // Check prototype properties
    const proto = Object.getPrototypeOf(target);
    if (proto && proto !== Object.prototype && proto !== HTMLElement.prototype) {
        for (const key of Object.getOwnPropertyNames(proto)) {
            if (key === 'constructor') continue;
            try {
                const desc = Object.getOwnPropertyDescriptor(proto, key);
                if (desc?.value) checkProp(key, desc.value);
            } catch {}
        }
    }

    return signals;
}

/**
 * Inspects all components in the active Purity application.
 */
export function getComponentsInspection(): ComponentInspection[] {
    const registry: Map<string, any> = (globalThis as any).__PURITY_COMPONENT_REGISTRY__ || new Map();
    const componentMap = new Map<string, {
        name: string;
        selector: string;
        elements: HTMLElement[];
        customClass?: any;
    }>();

    // 1. Gather all registered components from componentRegistry
    for (const [selector, compClass] of registry.entries()) {
        const targetClass = (compClass as any).__target || compClass;
        const name = targetClass.name || selector;
        if (!componentMap.has(name)) {
            componentMap.set(name, {
                name,
                selector,
                elements: [],
                customClass: compClass,
            });
        }
    }

    // 2. Scan DOM for mounted custom elements
    if (typeof document !== 'undefined') {
        const allElements = Array.from(document.querySelectorAll('*'));
        for (const el of allElements) {
            if (!(el instanceof HTMLElement)) continue;
            const tag = el.tagName.toLowerCase();

            // Custom Element or Purity component marker
            const compClass = registry.get(tag);
            const isCustom = tag.includes('-') || Boolean(compClass) || (el as any).__purity_component_name;

            if (isCustom) {
                const name =
                    (el as any).__purity_component_name ||
                    (compClass ? ((compClass as any).__target?.name || compClass.name) : null) ||
                    (el.constructor.name !== 'HTMLElement' ? el.constructor.name : null) ||
                    tag;

                if (!componentMap.has(name)) {
                    componentMap.set(name, {
                        name,
                        selector: tag,
                        elements: [],
                        customClass: compClass || el.constructor,
                    });
                }
                componentMap.get(name)!.elements.push(el);
            }
        }
    }

    const inspections: ComponentInspection[] = [];

    for (const [name, data] of componentMap.entries()) {
        const sampleEl = data.elements[0] || null;
        const servicesUsed = new Set<string>();
        const serviceUsage: ServiceUsageInfo[] = [];

        // Check DI container recorded dependencies
        const diServices = container.getComponentDependencies(name);
        for (const s of diServices) {
            if (!servicesUsed.has(s)) {
                servicesUsed.add(s);
                serviceUsage.push({ name: s });
            }
        }

        // Scan instance properties for services
        if (sampleEl) {
            for (const key of Object.getOwnPropertyNames(sampleEl)) {
                try {
                    const val = (sampleEl as any)[key];
                    if (val && typeof val === 'object' && val.constructor) {
                        const constructorName = val.constructor.name;
                        if (
                            constructorName &&
                            (constructorName.endsWith('Service') ||
                             container.getAllRegisteredServices().includes(constructorName))
                        ) {
                            if (!servicesUsed.has(constructorName)) {
                                servicesUsed.add(constructorName);
                                serviceUsage.push({ name: constructorName, propertyKey: key });
                            }
                        }
                    }
                } catch {}
            }
        }

        // Scan signals across all mounted instances (aggregating update telemetry)
        const signalsMap = new Map<string, SignalInfo>();
        for (const instEl of data.elements) {
            const instSignals = extractSignalsFromObject(instEl, name);
            for (const sig of instSignals) {
                if (!signalsMap.has(sig.name)) {
                    signalsMap.set(sig.name, { ...sig });
                } else {
                    const existing = signalsMap.get(sig.name)!;
                    existing.updateCount = (existing.updateCount || 0) + (sig.updateCount || 0);
                    existing.totalUpdateDurationMs =
                        Math.round(((existing.totalUpdateDurationMs || 0) + (sig.totalUpdateDurationMs || 0)) * 1000) / 1000;
                    if ((sig.lastUpdateDurationMs || 0) > (existing.lastUpdateDurationMs || 0)) {
                        existing.lastUpdateDurationMs = sig.lastUpdateDurationMs;
                        existing.value = sig.value;
                    }
                    existing.avgUpdateDurationMs =
                        existing.updateCount > 0
                            ? Math.round(((existing.totalUpdateDurationMs || 0) / existing.updateCount) * 1000) / 1000
                            : 0;
                }
            }
        }
        const signals = Array.from(signalsMap.values());

        // Scan effects and their dependencies
        const effects: EffectInfo[] = [];
        if (sampleEl) {
            const rawEffects: Function[] = (sampleEl as any).__purity_effects || [];
            rawEffects.forEach((eff, idx) => {
                const desc =
                    (eff as any).description ||
                    (eff.name && eff.name !== 'execute' ? `Reactive Effect (${eff.name})` : `Reactive Effect #${idx + 1}`);

                const deps: string[] = [];
                const depSet: Set<any> | undefined = (eff as any).__dependencies;
                if (depSet && typeof depSet.forEach === 'function') {
                    depSet.forEach((sig) => {
                        if (sig && sig.__purity_name) {
                            deps.push(sig.__purity_name);
                        }
                    });
                }

                // Aggregate execution counts across instances if multiple instances exist
                let execCount = (eff as any).__executionCount || 1;
                let lastDur = (eff as any).__lastDurationMs || 0;
                let totalDur = (eff as any).__totalDurationMs || 0;
                if (data.elements.length > 1) {
                    for (let i = 1; i < data.elements.length; i++) {
                        const otherEff = (data.elements[i] as any).__purity_effects?.[idx];
                        if (otherEff) {
                            execCount += Math.max(0, (otherEff.__executionCount || 1) - 1);
                            totalDur = Math.round((totalDur + (otherEff.__totalDurationMs || 0)) * 1000) / 1000;
                            if ((otherEff.__lastDurationMs || 0) > lastDur) {
                                lastDur = otherEff.__lastDurationMs;
                            }
                        }
                    }
                }
                const avgDur = execCount > 0 ? Math.round((totalDur / execCount) * 1000) / 1000 : 0;

                effects.push({
                    id: `effect-${idx + 1}`,
                    description: desc,
                    active: true,
                    dependencies: deps,
                    executionCount: execCount,
                    lastDurationMs: lastDur,
                    avgDurationMs: avgDur,
                    totalDurationMs: totalDur,
                });
            });

            // Also check activeDirectives
            const directives: any[] = (sampleEl as any).activeDirectives || [];
            directives.forEach((_, idx) => {
                effects.push({
                    id: `directive-${idx + 1}`,
                    description: `Active Directive Binding #${idx + 1}`,
                    active: true,
                });
            });

            // Also check activeValidators
            const validators: any[] = (sampleEl as any).activeValidators || [];
            validators.forEach((_, idx) => {
                effects.push({
                    id: `validator-${idx + 1}`,
                    description: `Form Validator Binding #${idx + 1}`,
                    active: true,
                });
            });
        }

        // Aggregate component metrics
        let totalUpdateMs = 0;
        let totalUpdates = 0;
        let lastUpdateMs = 0;
        let minUpdateMs = Infinity;
        let maxUpdateMs = 0;

        signals.forEach((s) => {
            const count = s.updateCount || 0;
            const tot = s.totalUpdateDurationMs || 0;
            const last = s.lastUpdateDurationMs || 0;
            totalUpdates += count;
            totalUpdateMs += tot;
            if (last > lastUpdateMs) lastUpdateMs = last;
            if (count > 0 && last > 0 && last < minUpdateMs) minUpdateMs = last;
            if (last > maxUpdateMs) maxUpdateMs = last;
        });

        effects.forEach((e) => {
            const reRuns = Math.max(0, (e.executionCount || 1) - 1);
            const last = e.lastDurationMs || 0;
            if (reRuns > 0 && totalUpdates === 0) {
                totalUpdates += reRuns;
                totalUpdateMs += e.totalDurationMs || 0;
            }
            if (last > lastUpdateMs && lastUpdateMs === 0) lastUpdateMs = last;
            if (reRuns > 0 && last > 0 && last < minUpdateMs) minUpdateMs = last;
            if (last > maxUpdateMs) maxUpdateMs = last;
        });

        const initialRender = (sampleEl as any)?.__purity_initial_render_ms ?? 0.85;
        const renderCount = (sampleEl as any)?.__purity_render_count || Math.max(1, data.elements.length);
        const avgUpdate = totalUpdates > 0 ? Math.round((totalUpdateMs / totalUpdates) * 1000) / 1000 : 0;

        const metrics: ComponentMetrics = {
            initialRenderTimeMs: initialRender,
            renderCount,
            updateCount: totalUpdates,
            totalUpdateTimeMs: Math.round(totalUpdateMs * 1000) / 1000,
            lastUpdateTimeMs: lastUpdateMs,
            avgUpdateTimeMs: avgUpdate,
            minUpdateTimeMs: minUpdateMs === Infinity ? 0 : minUpdateMs,
            maxUpdateTimeMs: maxUpdateMs,
            recentUpdates: [],
        };

        inspections.push({
            id: data.selector,
            name,
            selector: data.selector,
            elementCount: data.elements.length,
            services: serviceUsage,
            signals,
            effects,
            metrics,
        });
    }

    // Sort components: mounted first, then alphabetically
    return inspections.sort((a, b) => {
        if (a.elementCount > 0 && b.elementCount === 0) return -1;
        if (b.elementCount > 0 && a.elementCount === 0) return 1;
        return a.name.localeCompare(b.name);
    });
}

/**
 * Inspects all registered and resolved services in the application.
 */
export function getServicesInspection(): ServiceInspection[] {
    const registeredNames = container.getAllRegisteredServices();
    const serviceMap = new Map<string, ServiceInspection>();

    for (const name of registeredNames) {
        let instance: any = null;
        try {
            instance = container.getServiceInstance(name) || container.resolve(name);
        } catch {
            instance = container.getServiceInstance(name);
        }

        const dependencies = container.getServiceDependencies(name);
        const dependents = container.getServiceDependents(name);

        // Also inspect instance for services injected as fields
        if (instance && typeof instance === 'object') {
            for (const key of Object.getOwnPropertyNames(instance)) {
                try {
                    const val = instance[key];
                    if (val && typeof val === 'object' && val.constructor) {
                        const constrName = val.constructor.name;
                        if (
                            constrName &&
                            constrName !== name &&
                            (constrName.endsWith('Service') || registeredNames.includes(constrName))
                        ) {
                            if (!dependencies.includes(constrName)) {
                                dependencies.push(constrName);
                            }
                        }
                    }
                } catch {}
            }
        }

        const signals = instance ? extractSignalsFromObject(instance, name) : [];

        serviceMap.set(name, {
            name,
            isSingleton: true,
            dependencies,
            dependents,
            signals,
        });
    }

    return Array.from(serviceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Builds the visual reactivity relationship graph linking signals to their subscribed effects.
 */
export function getReactivityGraph(
    components: ComponentInspection[],
    services: ServiceInspection[],
): ReactiveLink[] {
    const links: ReactiveLink[] = [];
    const seen = new Set<string>();

    // Map all signals by name and source
    const signalLookup = new Map<string, { type: 'signal' | 'computed'; value: any; source: string }>();

    for (const comp of components) {
        for (const sig of comp.signals) {
            signalLookup.set(`${comp.name}.${sig.name}`, {
                type: sig.type,
                value: sig.value,
                source: comp.name,
            });
            // Also store unqualified for local component lookups
            if (!signalLookup.has(sig.name)) {
                signalLookup.set(sig.name, {
                    type: sig.type,
                    value: sig.value,
                    source: comp.name,
                });
            }
        }
    }

    for (const serv of services) {
        for (const sig of serv.signals) {
            signalLookup.set(`${serv.name}.${sig.name}`, {
                type: sig.type,
                value: sig.value,
                source: serv.name,
            });
            if (!signalLookup.has(sig.name)) {
                signalLookup.set(sig.name, {
                    type: sig.type,
                    value: sig.value,
                    source: serv.name,
                });
            }
        }
    }

    // 1. Traverse each component's effects and their recorded signal dependencies
    for (const comp of components) {
        for (const eff of comp.effects) {
            if (eff.dependencies && eff.dependencies.length > 0) {
                for (const sigName of eff.dependencies) {
                    const lookup = signalLookup.get(`${comp.name}.${sigName}`) || signalLookup.get(sigName);
                    const linkId = `${lookup?.source || comp.name}-${sigName}->${comp.name}-${eff.id}`;

                    if (!seen.has(linkId)) {
                        seen.add(linkId);
                        links.push({
                            id: linkId,
                            signalName: sigName,
                            signalType: lookup?.type || 'signal',
                            signalValue: lookup?.value,
                            source: lookup?.source || comp.name,
                            effectId: eff.id,
                            effectDescription: eff.description,
                            targetComponent: comp.name,
                        });
                    }
                }
            } else {
                // If explicit dependencies were not captured (e.g. dynamic expression),
                // match signals used in the effect's expression / description:
                const desc = eff.description || '';
                const matchRegex = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
                let m: RegExpExecArray | null;
                while ((m = matchRegex.exec(desc)) !== null) {
                    const candidate = m[1];
                    const lookup = signalLookup.get(`${comp.name}.${candidate}`) || signalLookup.get(candidate);
                    if (lookup) {
                        const linkId = `${lookup.source}-${candidate}->${comp.name}-${eff.id}`;
                        if (!seen.has(linkId)) {
                            seen.add(linkId);
                            links.push({
                                id: linkId,
                                signalName: candidate,
                                signalType: lookup.type,
                                signalValue: lookup.value,
                                source: lookup.source,
                                effectId: eff.id,
                                effectDescription: eff.description,
                                targetComponent: comp.name,
                            });
                        }
                    }
                }
            }
        }
    }

    // 2. Also check signals that have direct subscribers recorded
    for (const comp of components) {
        for (const sig of comp.signals) {
            if (sig.subscribers && sig.subscribers.length > 0) {
                sig.subscribers.forEach((subDesc, sIdx) => {
                    const linkId = `${comp.name}-${sig.name}->${comp.name}-sub-${sIdx}`;
                    if (!seen.has(linkId)) {
                        seen.add(linkId);
                        links.push({
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
                    if (!seen.has(linkId)) {
                        seen.add(linkId);
                        links.push({
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

    return links;
}

/**
 * Creates the full DevTools inspector API snapshot.
 */
export function inspectPurityApp(): PurityInspectionSnapshot {
    const components = getComponentsInspection();
    const services = getServicesInspection();
    const reactivityGraph = getReactivityGraph(components, services);

    return {
        detected: true,
        framework: 'Purity',
        version: '2.1.0',
        timestamp: Date.now(),
        components,
        services,
        reactivityGraph,
        recordingSession: (typeof window !== 'undefined' ? (window as any).__PURITY_RECORDING_SESSION__ : null) || null,
    };
}

export function startComponentRecording(componentName: string) {
    // Ensure all signals and components are scanned and tagged with __purity_name / __purity_owner
    getComponentsInspection();
    getServicesInspection();

    const session = {
        componentName,
        isActive: true,
        startTime: Date.now(),
        endTime: null as number | null,
        totalDurationMs: 0,
        updatesCount: 0,
        totalUpdateTimeMs: 0,
        avgUpdateTimeMs: 0,
        minUpdateTimeMs: null as number | null,
        maxUpdateTimeMs: 0,
        updates: [] as Array<{ timestamp: number; trigger: string; durationMs: number }>,
    };
    if (typeof window !== 'undefined') {
        (window as any).__PURITY_RECORDING_SESSION__ = session;
    }
    return session;
}

export function stopComponentRecording() {
    if (typeof window !== 'undefined' && (window as any).__PURITY_RECORDING_SESSION__) {
        const session = (window as any).__PURITY_RECORDING_SESSION__;
        session.isActive = false;
        session.endTime = Date.now();
        session.totalDurationMs = Math.max(0, session.endTime - session.startTime);
        return session;
    }
    return null;
}

export function benchmarkComponentUpdate(componentName: string) {
    if (typeof document === 'undefined') return null;
    const el = Array.from(document.querySelectorAll('*')).find((e: any) =>
        e.__purity_component_name === componentName ||
        e.tagName.toLowerCase().includes(componentName.toLowerCase().replace(/component$/, ''))
    );
    if (!el) return null;

    const start = performance.now();
    if (typeof (el as any).bindTemplate === 'function') {
        (el as any).bindTemplate();
    }
    const durationMs = Math.round((performance.now() - start) * 1000) / 1000;

    if (typeof window !== 'undefined' && (window as any).__PURITY_RECORDING_SESSION__?.isActive) {
        const session = (window as any).__PURITY_RECORDING_SESSION__;
        session.updatesCount++;
        session.totalUpdateTimeMs = Math.round((session.totalUpdateTimeMs + durationMs) * 1000) / 1000;
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

/**
 * Creates and registers the global Purity DevTools instance.
 */
export function createDevTools() {
    return {
        isPurity: true,
        version: '2.1.0',
        getComponents: getComponentsInspection,
        getServices: getServicesInspection,
        getReactivity: () => getReactivityGraph(getComponentsInspection(), getServicesInspection()),
        inspect: inspectPurityApp,
        startRecording: startComponentRecording,
        stopRecording: stopComponentRecording,
        benchmarkComponentUpdate: benchmarkComponentUpdate,
    };
}

if (typeof window !== 'undefined') {
    (window as any).__PURITY_DEVTOOLS__ = createDevTools();
}
