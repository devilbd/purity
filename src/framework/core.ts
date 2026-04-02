export type Signal<T> = {
    (): T; // The 'Getter'
    set(value: T): void;
    update(fn: (val: T) => T): void;
};

const context: Function[] = [];

/**
 * Reactivity Namespace
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

export const Reactivity = {
    signal,
    effect,
};

/**
 * DOM Utilities Namespace
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
    rootEl?: HTMLElement,
): HTMLElement | null => {
    const result = rootEl
        ? rootEl.querySelector(selector)
        : document.querySelector(selector);
    return result as HTMLElement;
};

const templateCache = new Map<string, string>();

export abstract class Component extends HTMLElement {
    protected templateUrl?: string;
    protected initialized = false;

    constructor() {
        super();
    }

    async connectedCallback() {
        if (this.initialized) return;
        this.initialized = true; // Mark as initialized immediately to prevent recursion

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
