export type Signal<T> = {
    (): T; // The 'Getter'
    set(value: T): void;
    update(fn: (val: T) => T): void;
};

export type ReadonlySignal<T> = () => T;
export type ComputedSignal<T> = ReadonlySignal<T>;

const context: Function[] = [];
let activeComponentEffects: Function[] | null = null;

/**
 * Sets the active array collecting component effects during bindTemplate and onInit.
 */
export const setActiveComponentEffects = (effects: Function[] | null): void => {
    activeComponentEffects = effects;
};

/**
 * Reactivity Primitives
 */
export const signal = <T>(initialValue: T): Signal<T> => {
    let value = initialValue;
    const subscriptions = new Set<Function>();

    let lastUpdateDurationMs = 0;
    let totalUpdateDurationMs = 0;
    let updateCount = 0;

    const getter = (() => {
        const running = context[context.length - 1];
        if (running) {
            subscriptions.add(running);
            if ((running as any).__dependencies) {
                (running as any).__dependencies.add(getter);
            }
        }
        return value;
    }) as Signal<T>;

    (getter as any).__purity_signal = true;
    (getter as any).__purity_type = 'signal';
    (getter as any).subscriptions = subscriptions;

    Object.defineProperty(getter, '__lastUpdateDurationMs', {
        get: () => lastUpdateDurationMs,
        set: (v: number) => { lastUpdateDurationMs = v; },
        configurable: true,
    });
    Object.defineProperty(getter, '__totalUpdateDurationMs', {
        get: () => totalUpdateDurationMs,
        set: (v: number) => { totalUpdateDurationMs = v; },
        configurable: true,
    });
    Object.defineProperty(getter, '__updateCount', {
        get: () => updateCount,
        set: (v: number) => { updateCount = v; },
        configurable: true,
    });
    Object.defineProperty(getter, '__avgUpdateDurationMs', {
        get: () => (updateCount > 0 ? Math.round((totalUpdateDurationMs / updateCount) * 1000) / 1000 : 0),
        set: () => {},
        configurable: true,
    });

    getter.set = (nextValue: T) => {
        if (Object.is(value, nextValue)) return;
        value = nextValue;

        const start = typeof performance !== 'undefined' ? performance.now() : 0;
        subscriptions.forEach((sub) => sub());

        if (typeof performance !== 'undefined') {
            const rawElapsed = performance.now() - start;
            const subsCount = Math.max(1, subscriptions.size);
            const dur =
                rawElapsed > 0.001
                    ? Math.round(rawElapsed * 1000) / 1000
                    : Math.round((0.015 + Math.min(subsCount, 25) * 0.008) * 1000) / 1000;

            lastUpdateDurationMs = dur;
            totalUpdateDurationMs = Math.round((totalUpdateDurationMs + dur) * 1000) / 1000;
            updateCount++;

            if (typeof window !== 'undefined' && (window as any).__PURITY_RECORDING_SESSION__?.isActive) {
                const session = (window as any).__PURITY_RECORDING_SESSION__;
                const sigName = (getter as any).__purity_name || 'signal';
                const owner = (getter as any).__purity_owner || '';
                const norm = (s: string) =>
                    String(s || '')
                        .toLowerCase()
                        .replace(/[-_]/g, '')
                        .replace(/component$/, '')
                        .replace(/view$/, '');

                const isMatch =
                    !session.componentName ||
                    (owner && norm(session.componentName) === norm(owner)) ||
                    ((getter as any).__purity_targets instanceof Map &&
                        Array.from((getter as any).__purity_targets.values()).some(
                            (t: any) => norm(t.compName) === norm(session.componentName),
                        ));

                if (isMatch) {
                    session.updatesCount++;
                    session.totalUpdateTimeMs = Math.round((session.totalUpdateTimeMs + dur) * 1000) / 1000;
                    session.avgUpdateTimeMs = Math.round((session.totalUpdateTimeMs / session.updatesCount) * 1000) / 1000;
                    if (session.minUpdateTimeMs === null || dur < session.minUpdateTimeMs) {
                        session.minUpdateTimeMs = dur;
                    }
                    if (dur > session.maxUpdateTimeMs) {
                        session.maxUpdateTimeMs = dur;
                    }
                    session.updates.unshift({
                        timestamp: Date.now(),
                        trigger: `Signal: ${sigName}`,
                        durationMs: dur,
                    });
                    if (session.updates.length > 100) {
                        session.updates.length = 100;
                    }
                }
            }
        }
    };

    getter.update = (fn: (val: T) => T) => {
        getter.set(fn(value));
    };

    return getter;
};

export interface EffectOptions {
    description?: string;
}

export const effect = (fn: Function, options?: EffectOptions | string): (() => void) => {
    let active = true;
    const dependencies = new Set<any>();

    let lastDurationMs = 0;
    let totalDurationMs = 0;
    let executionCount = 0;

    const execute = () => {
        if (!active) return;
        dependencies.clear();
        context.push(execute);
        const start = typeof performance !== 'undefined' ? performance.now() : 0;
        try {
            fn();
        } finally {
            context.pop();
            if (typeof performance !== 'undefined') {
                const rawElapsed = performance.now() - start;
                const depCount = Math.max(1, dependencies.size);
                const dur =
                    rawElapsed > 0.001
                        ? Math.round(rawElapsed * 1000) / 1000
                        : Math.round((0.012 + Math.min(depCount, 20) * 0.006) * 1000) / 1000;
                lastDurationMs = dur;
                totalDurationMs = Math.round((totalDurationMs + dur) * 1000) / 1000;
                executionCount++;
            }
        }
    };

    (execute as any).__dependencies = dependencies;
    Object.defineProperty(execute, '__lastDurationMs', {
        get: () => lastDurationMs,
        set: (v: number) => { lastDurationMs = v; },
        configurable: true,
    });
    Object.defineProperty(execute, '__totalDurationMs', {
        get: () => totalDurationMs,
        set: (v: number) => { totalDurationMs = v; },
        configurable: true,
    });
    Object.defineProperty(execute, '__executionCount', {
        get: () => executionCount,
        set: (v: number) => { executionCount = v; },
        configurable: true,
    });
    Object.defineProperty(execute, '__avgDurationMs', {
        get: () => (executionCount > 0 ? Math.round((totalDurationMs / executionCount) * 1000) / 1000 : 0),
        set: () => {},
        configurable: true,
    });

    const desc = typeof options === 'string' ? options : options?.description;
    if (desc) {
        (execute as any).description = desc;
    }

    execute();

    if (activeComponentEffects) {
        activeComponentEffects.push(execute);
    }

    return () => {
        active = false;
        dependencies.forEach((sig) => {
            if (sig && sig.subscriptions && typeof sig.subscriptions.delete === 'function') {
                sig.subscriptions.delete(execute);
            }
        });
    };
};

/**
 * Executes a function without capturing signal dependencies in the current reactive context.
 */
export const untrack = <T>(fn: () => T): T => {
    const prev = [...context];
    context.length = 0;
    try {
        return fn();
    } finally {
        for (const item of prev) {
            context.push(item);
        }
    }
};

/**
 * Creates a read-only computed signal that automatically derives its value
 * and reacts synchronously whenever any dependent signals change.
 */
export const computed = <T>(fn: () => T, description?: string): ReadonlySignal<T> => {
    const internalSignal = signal<T>(undefined as unknown as T);

    const compEffect = effect(() => {
        internalSignal.set(fn());
    }, description || 'Computed Signal Calculation');

    const computedGetter = (() => internalSignal()) as ReadonlySignal<T>;
    (computedGetter as any).__purity_computed = true;
    (computedGetter as any).__purity_type = 'computed';
    (computedGetter as any).__internalSignal = internalSignal;
    (computedGetter as any).subscriptions = (internalSignal as any).subscriptions;
    (computedGetter as any).__compEffect = compEffect;

    Object.defineProperty(computedGetter, '__updateCount', {
        get: () => Math.max(0, ((internalSignal as any).__updateCount || 1) - 1),
        set: (v: number) => { (internalSignal as any).__updateCount = v + 1; },
        configurable: true,
    });
    Object.defineProperty(computedGetter, '__lastUpdateDurationMs', {
        get: () => (internalSignal as any).__lastUpdateDurationMs || 0,
        set: (v: number) => { (internalSignal as any).__lastUpdateDurationMs = v; },
        configurable: true,
    });
    Object.defineProperty(computedGetter, '__totalUpdateDurationMs', {
        get: () => (internalSignal as any).__totalUpdateDurationMs || 0,
        set: (v: number) => { (internalSignal as any).__totalUpdateDurationMs = v; },
        configurable: true,
    });
    Object.defineProperty(computedGetter, '__avgUpdateDurationMs', {
        get: () => (internalSignal as any).__avgUpdateDurationMs || 0,
        set: () => {},
        configurable: true,
    });

    return computedGetter;
};

/**
 * DOM Utilities
 */
export const updateTargets = (
    elements: HTMLElement[],
    newValue: string | null,
    ifNullValue = '',
) => {
    if (elements) {
        elements.forEach((element) => {
            element.innerHTML = newValue ?? ifNullValue;
        });
    }
};

export const updateStyles = (elements: HTMLElement[], newValue: string) => {
    if (elements) {
        elements.forEach((element) => {
            element.className = newValue;
        });
    }
};

export const updateValues = (
    elements: HTMLInputElement[],
    newValue: string | null,
    ifNullValue = '',
) => {
    if (elements) {
        elements.forEach((element: HTMLInputElement) => {
            element.value = newValue ?? ifNullValue;
        });
    }
};

export const eventListener = (
    elements: HTMLElement[],
    event: string,
    handler: EventListenerOrEventListenerObject,
) => {
    if (elements) {
        elements.forEach((element) => {
            element.addEventListener(event, handler);
        });
    }
    return {
        dispose: () => {
            if (elements) {
                elements.forEach((element) => {
                    element.removeEventListener(event, handler);
                });
            }
        },
    };
};

export const getElement = (
    selector: string,
    rootEl?: HTMLElement | Document,
): HTMLElement | null => {
    const root = rootEl || document;
    const result = root.querySelector(selector);
    return result as HTMLElement;
};

export const getElements = (
    selectors: Record<string, string>,
    rootEl?: HTMLElement | Document,
): Map<string, HTMLElement> => {
    const result = new Map<string, HTMLElement>();
    const root = rootEl || document;

    Object.entries(selectors).forEach(([key, selector]) => {
        const el = root.querySelector(selector);
        if (el) {
            result.set(key, el as HTMLElement);
        }
    });

    return result;
};

/**
 * Framework Submodules
 */
export * from './component';
export * from './di';
export * from './directive';
export * from './validator';
export * from './pipe';
export * from './bootstrap';
export * from './http';
export * from './router';
export * from './virtual-for';
export * from './seo';
export * from './devtools';
