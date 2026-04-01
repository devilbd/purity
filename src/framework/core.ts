type Signal<T> = {
    (): T; // The "Getter"
    set(value: T): void;
    update(fn: (val: T) => T): void;
};

const context: Function[] = [];

export const signal = <T>(initialValue: T): Signal<T> => {
    let value = initialValue;
    const subscriptions = new Set<Function>();

    // 1. Define the getter function
    const getter = (() => {
        const running = context[context.length - 1];
        if (running) subscriptions.add(running);
        return value;
    }) as Signal<T>;

    // 2. Attach the "set" method
    getter.set = (nextValue: T) => {
        if (Object.is(value, nextValue)) return; // Angular-like optimization
        value = nextValue;
        subscriptions.forEach((sub) => sub());
    };

    // 3. Attach the "update" method (syntax sugar)
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

export const updateTargets = (
    elements: HTMLElement[],
    newValue: string | null,
    ifNullValue = "",
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
    ifNullValue = "",
) => {
    if (elements) {
        elements.forEach((element) => {
            element.value = newValue ?? ifNullValue;
        });
    }
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

        if (this.templateUrl) {
            await this.loadTemplate();
        }

        this.onInit();
        this.initialized = true;
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

    /**
     * Called after the template is loaded and injected.
     * Override this to perform initialization logic like signal effects and DOM selection.
     */
    protected onInit() {}

    /**
     * Optional: manually trigger a re-render if needed.
     */
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
