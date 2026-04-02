export type Signal<T> = {
    (): T; // The 'Getter'
    set(value: T): void;
    update(fn: (val: T) => T): void;
};

const context: Function[] = [];

/**
 * Reactivity
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
    elements: HTMLElement[],
    newValue: string | null,
    ifNullValue = '',
) => {
    if (elements) {
        elements.forEach((element) => {
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
 * UI Components
 */
const templateCache = new Map<string, string>();

export abstract class Component extends HTMLElement {
    protected templateUrl?: string;
    protected initialized = false;

    constructor() {
        super();
    }

    async connectedCallback() {
        if (this.initialized) return;
        this.initialized = true;

        if (this.templateUrl) {
            await this.loadTemplate();
        }

        this.onInit();
    }

    protected async loadTemplate() {
        if (!this.templateUrl) return;

        if (templateCache.has(this.templateUrl)) {
            this.innerHTML = templateCache.get(this.templateUrl)!;
        } else {
            try {
                const response = await fetch(this.templateUrl);
                const template = await response.text();
                templateCache.set(this.templateUrl, template);
                this.innerHTML = template;
            } catch (error) {
                console.error(
                    `Failed to load template from ${this.templateUrl}`,
                    error,
                );
            }
        }
    }

    protected onInit() {}

    protected render(content?: string) {
        if (content) {
            this.innerHTML = content;
        }
    }
}

export const defineComponent = (name: string, component: any) => {
    if (!customElements.get(name)) {
        customElements.define(name, component);
    } else {
        console.error(`Component ${name} is already defined`);
    }
};
