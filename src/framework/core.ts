export type Signal<T> = {
    (): T; // The 'Getter'
    set(value: T): void;
    update(fn: (val: T) => T): void;
};

export type ReadonlySignal<T> = () => T;
export type ComputedSignal<T> = ReadonlySignal<T>;

const context: Function[] = [];

/**
 * Reactivity Primitives
 */
export const signal = <T>(initialValue: T): Signal<T> => {
    let value = initialValue;
    const subscriptions = new Set<Function>();

    const getter = (() => {
        const running = context[context.length - 1];
        if (running) subscriptions.add(running);
        return value;
    }) as Signal<T>;

    getter.set = (nextValue: T) => {
        if (Object.is(value, nextValue)) return;
        value = nextValue;
        subscriptions.forEach((sub) => sub());
    };

    getter.update = (fn: (val: T) => T) => {
        getter.set(fn(value));
    };

    return getter;
};

export const effect = (fn: Function) => {
    const execute = () => {
        context.push(execute);
        try {
            fn();
        } finally {
            context.pop();
        }
    };
    execute();
};

/**
 * Creates a read-only computed signal that automatically derives its value
 * and reacts synchronously whenever any dependent signals change.
 */
export const computed = <T>(fn: () => T): ReadonlySignal<T> => {
    const internalSignal = signal<T>(undefined as unknown as T);

    effect(() => {
        internalSignal.set(fn());
    });

    return (() => internalSignal()) as ReadonlySignal<T>;
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
