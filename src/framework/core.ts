import { bindDirectives } from './directive';

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
        this.bindTemplate();
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
            this.bindTemplate();
        }
    }

    protected activeDirectives: Array<{ destroy: () => void }> = [];

    disconnectedCallback() {
        this.activeDirectives.forEach((d) => d.destroy());
        this.activeDirectives = [];
    }

    /**
     * Parses and binds reactive handlebars-style {{ expression }} interpolations in text nodes and attributes.
     */
    protected bindTemplate(root: HTMLElement = this) {
        // Bind Directives
        const directives = bindDirectives(root, this);
        this.activeDirectives.push(...directives);

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const textNodes: Text[] = [];
        let node: Node | null;

        while ((node = walker.nextNode())) {
            if (node.nodeValue && node.nodeValue.includes('{{')) {
                textNodes.push(node as Text);
            }
        }

        const interpolationRegex = /\{\{\s*([\s\S]*?)\s*\}\}/g;

        for (const textNode of textNodes) {
            const textContent = textNode.nodeValue;
            if (!textContent) continue;

            const parent = textNode.parentNode;
            if (!parent) continue;

            let lastIndex = 0;
            let match: RegExpExecArray | null;
            const fragments: Node[] = [];
            let hasMatch = false;

            interpolationRegex.lastIndex = 0;
            while ((match = interpolationRegex.exec(textContent)) !== null) {
                hasMatch = true;
                const staticText = textContent.slice(lastIndex, match.index);
                if (staticText) {
                    fragments.push(document.createTextNode(staticText));
                }

                const expr = match[1].trim();
                const dynamicNode = document.createTextNode('');
                fragments.push(dynamicNode);

                effect(() => {
                    try {
                        const fn = new Function(`with (this) { return ${expr}; }`);
                        const val = fn.call(this);
                        dynamicNode.nodeValue =
                            val !== null && val !== undefined ? String(val) : '';
                    } catch {
                        dynamicNode.nodeValue = '';
                    }
                });

                lastIndex = match.index + match[0].length;
            }

            if (hasMatch) {
                const remainingText = textContent.slice(lastIndex);
                if (remainingText) {
                    fragments.push(document.createTextNode(remainingText));
                }

                for (const frag of fragments) {
                    parent.insertBefore(frag, textNode);
                }
                parent.removeChild(textNode);
            }
        }

        const elementsWithAttrs = [root, ...Array.from(root.querySelectorAll('*'))];
        for (const el of elementsWithAttrs) {
            if (!(el instanceof HTMLElement)) continue;
            for (const attr of Array.from(el.attributes)) {
                if (attr.value.includes('{{')) {
                    const rawValue = attr.value;
                    const attrName = attr.name;
                    effect(() => {
                        const replaced = rawValue.replace(
                            /\{\{\s*([\s\S]*?)\s*\}\}/g,
                            (_, expr) => {
                                try {
                                    const fn = new Function(
                                        `with (this) { return ${expr.trim()}; }`,
                                    );
                                    const val = fn.call(this);
                                    return val !== null && val !== undefined
                                        ? String(val)
                                        : '';
                                } catch {
                                    return '';
                                }
                            },
                        );
                        if (el instanceof HTMLInputElement && attrName === 'value') {
                            el.value = replaced;
                        }
                        el.setAttribute(attrName, replaced);
                    });
                }
            }
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

/**
 * Dependency Injection
 */
export * from './di';

/**
 * Directives
 */
export * from './directive';
