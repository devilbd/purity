import { effect } from './core';
import { bindDirectives } from './directive';

export interface ComponentOptions {
    selector?: string;
    templateUrl?: string;
    template?: string;
}

const templateCache = new Map<string, string>();

function toKebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Attaches standard Purity component lifecycle methods, template loader, and bindings to a prototype.
 */
function attachComponentLifecycle(proto: any, options: ComponentOptions) {
    proto.loadTemplate = async function (this: any) {
        const url = this.templateUrl || options.templateUrl;
        if (!url) return;

        if (templateCache.has(url)) {
            this.innerHTML = templateCache.get(url)!;
        } else {
            try {
                const response = await fetch(url);
                const template = await response.text();
                templateCache.set(url, template);
                this.innerHTML = template;
            } catch (error) {
                console.error(`Failed to load template from ${url}`, error);
            }
        }
    };

    proto.connectedCallback = async function (this: any) {
        if (this.initialized) return;
        this.initialized = true;

        const url = this.templateUrl || options.templateUrl;
        const inlineTemplate = this.template || options.template;

        if (url) {
            await this.loadTemplate();
        } else if (inlineTemplate && !this.innerHTML) {
            this.innerHTML = inlineTemplate;
        }

        this.onInit?.();
        this.bindTemplate?.();
    };

    proto.disconnectedCallback = function (this: any) {
        if (this.activeDirectives) {
            this.activeDirectives.forEach((d: { destroy: () => void }) => d.destroy());
            this.activeDirectives = [];
        }
        this.onDestroy?.();
    };

    proto.render = function (this: any, content?: string) {
        if (content !== undefined && content !== null) {
            this.innerHTML = content;
            this.bindTemplate?.();
        }
    };

    proto.bindTemplate = function (this: any, root?: HTMLElement) {
        const rootEl = root || this;
        if (!this.activeDirectives) {
            this.activeDirectives = [];
        }

        // Bind Directives
        const directives = bindDirectives(rootEl, this);
        this.activeDirectives.push(...directives);

        const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
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

        const elementsWithAttrs = [rootEl, ...Array.from(rootEl.querySelectorAll('*'))];
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
    };
}

/**
 * Decorator that transforms a class into a native Web Component (Custom Element).
 * Automatically registers the custom element with customElements.define().
 */
export function Component(selectorOrOptions?: string | ComponentOptions): any {
    const options: ComponentOptions =
        typeof selectorOrOptions === 'string'
            ? { selector: selectorOrOptions }
            : (selectorOrOptions ?? {});

    return function <T extends abstract new (...args: any[]) => any>(
        target: T,
        context?: ClassDecoratorContext<T> | any,
    ): any {
        const selector =
            options.selector ??
            (context && typeof context.name === 'string'
                ? toKebabCase(context.name.replace(/Component$/, ''))
                : toKebabCase(target.name.replace(/Component$/, '')));

        let CustomElementClass: CustomElementConstructor;

        if (target.prototype instanceof HTMLElement) {
            CustomElementClass = target as unknown as CustomElementConstructor;
            if (options.templateUrl && !(CustomElementClass.prototype as any).templateUrl) {
                (CustomElementClass.prototype as any).templateUrl = options.templateUrl;
            }
            if (options.template && !(CustomElementClass.prototype as any).template) {
                (CustomElementClass.prototype as any).template = options.template;
            }
            attachComponentLifecycle(CustomElementClass.prototype, options);
        } else {
            class ComponentElement extends HTMLElement {
                protected initialized = false;
                protected activeDirectives: Array<{ destroy: () => void }> = [];

                constructor() {
                    super();

                    const userInstance = new (target as any)();

                    const frameworkProtectedMethods = new Set([
                        'render',
                        'connectedCallback',
                        'disconnectedCallback',
                        'loadTemplate',
                        'bindTemplate',
                    ]);

                    const propKeys = [
                        ...Object.getOwnPropertyNames(userInstance),
                        ...Object.getOwnPropertySymbols(userInstance),
                    ];
                    for (const key of propKeys) {
                        const desc = Object.getOwnPropertyDescriptor(userInstance, key);
                        if (desc) {
                            if (
                                typeof key === 'string' &&
                                frameworkProtectedMethods.has(key) &&
                                desc.value === undefined &&
                                !desc.get &&
                                !desc.set
                            ) {
                                continue;
                            }
                            Object.defineProperty(this, key, desc);
                        }
                    }
                }
            }

            // Copy prototype methods and getters/setters
            const descriptors = Object.getOwnPropertyDescriptors(target.prototype);
            for (const [key, desc] of Object.entries(descriptors)) {
                if (key !== 'constructor') {
                    Object.defineProperty(ComponentElement.prototype, key, desc);
                }
            }

            if (options.templateUrl && !(ComponentElement.prototype as any).templateUrl) {
                (ComponentElement.prototype as any).templateUrl = options.templateUrl;
            }
            if (options.template && !(ComponentElement.prototype as any).template) {
                (ComponentElement.prototype as any).template = options.template;
            }

            attachComponentLifecycle(ComponentElement.prototype, options);
            CustomElementClass = ComponentElement;
        }

        if (selector) {
            defineComponent(selector, CustomElementClass);
        }

        return CustomElementClass;
    };
}

export const defineComponent = (name: string, component: any) => {
    if (!customElements.get(name)) {
        customElements.define(name, component);
    } else {
        console.error(`Component ${name} is already defined`);
    }
};
