import { effect } from './core';
import { bindDirectives } from './directive';
import { bindValidators } from './validator';
import { executePipe } from './pipe';

export interface ComponentOptions {
    selector?: string;
    templateUrl?: string;
    template?: string;
}

const templateCache = new Map<string, string>();
const expressionCache = new Map<string, Function>();

/**
 * Transforms template pipe expressions (e.g. `value | myPipe: true : arg2`)
 * into executable JavaScript function calls (e.g. `__pipe('myPipe', (value), true, arg2)`).
 */
export function transformPipeExpression(rawExpr: string): string {
    const trimmed = rawExpr.trim();
    if (!trimmed.includes('|')) {
        return trimmed;
    }

    // Tokenize top-level pipes (ignoring strings, parentheses, brackets, and logical OR '||')
    const segments: string[] = [];
    let current = '';
    let inString: string | null = null;
    let depth = 0;

    for (let i = 0; i < trimmed.length; i++) {
        const char = trimmed[i];
        const nextChar = i + 1 < trimmed.length ? trimmed[i + 1] : '';

        // Handle string boundaries
        if (inString) {
            current += char;
            if (char === inString && trimmed[i - 1] !== '\\') {
                inString = null;
            }
            continue;
        }

        if (char === "'" || char === '"' || char === '`') {
            inString = char;
            current += char;
            continue;
        }

        // Handle bracket / parenthesis depth
        if (char === '(' || char === '[' || char === '{') {
            depth++;
            current += char;
            continue;
        }
        if (char === ')' || char === ']' || char === '}') {
            if (depth > 0) depth--;
            current += char;
            continue;
        }

        // Check for logical OR `||`
        if (char === '|' && nextChar === '|') {
            current += '||';
            i++;
            continue;
        }

        // Top-level pipe delimiter
        if (char === '|' && depth === 0) {
            segments.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim().length > 0) {
        segments.push(current.trim());
    }

    if (segments.length <= 1) {
        return trimmed;
    }

    let result = `(${segments[0]})`;

    for (let s = 1; s < segments.length; s++) {
        const pipeSegment = segments[s];
        const pipeParts: string[] = [];
        let part = '';
        let partInString: string | null = null;
        let partDepth = 0;

        for (let j = 0; j < pipeSegment.length; j++) {
            const pChar = pipeSegment[j];

            if (partInString) {
                part += pChar;
                if (pChar === partInString && pipeSegment[j - 1] !== '\\') {
                    partInString = null;
                }
                continue;
            }

            if (pChar === "'" || pChar === '"' || pChar === '`') {
                partInString = pChar;
                part += pChar;
                continue;
            }

            if (pChar === '(' || pChar === '[' || pChar === '{') {
                partDepth++;
                part += pChar;
                continue;
            }
            if (pChar === ')' || pChar === ']' || pChar === '}') {
                if (partDepth > 0) partDepth--;
                part += pChar;
                continue;
            }

            if (pChar === ':' && partDepth === 0) {
                pipeParts.push(part.trim());
                part = '';
                continue;
            }

            part += pChar;
        }

        if (part.trim().length > 0) {
            pipeParts.push(part.trim());
        }

        const pipeName = pipeParts[0];
        const pipeArgs = pipeParts.slice(1);

        const argsStr = pipeArgs.length > 0 ? ', ' + pipeArgs.join(', ') : '';
        result = `__pipe('${pipeName}', ${result}${argsStr})`;
    }

    return result;
}

function evaluateValue(expr: string, context: any): any {
    const transformedExpr = transformPipeExpression(expr);
    let fn = expressionCache.get(transformedExpr);
    if (!fn) {
        try {
            fn = new Function('__pipe', `with (this) { return ${transformedExpr}; }`);
            expressionCache.set(transformedExpr, fn);
        } catch {
            fn = () => null;
            expressionCache.set(transformedExpr, fn);
        }
    }
    try {
        let val = fn.call(context, executePipe);
        if (typeof val === 'function' && !Array.isArray(val)) {
            try {
                val = val();
            } catch {
                // Not a signal/getter
            }
        }
        return val;
    } catch {
        return null;
    }
}

function evaluateExpression(expr: string, context: any): string {
    const val = evaluateValue(expr, context);
    return val !== null && val !== undefined ? String(val) : '';
}

function toKebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Recursively binds structural for loops, text interpolations, attribute bindings,
 * directives, and validators across a DOM subtree with a specific context.
 */
function bindTemplateTree(rootEl: HTMLElement, context: any, componentInstance: any) {
    if (!rootEl) return;

    // 1. Process structural `for` loops inside rootEl
    const allForElements = Array.from(rootEl.querySelectorAll('[for]'));
    const topLevelForElements = allForElements.filter((el) => {
        let p = el.parentElement;
        while (p && p !== rootEl) {
            if (p.hasAttribute('for')) return false;
            p = p.parentElement;
        }
        return true;
    });

    for (const el of topLevelForElements) {
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest('pre, [data-no-bind]')) continue;

        const forAttr = el.getAttribute('for');
        if (!forAttr) continue;

        // Matches: let item of items, let item, index of items, let (item, i) of items, item of items
        const match = forAttr.match(
            /^(?:let\s+)?(?:\(?\s*([a-zA-Z0-9_$]+)(?:\s*,\s*([a-zA-Z0-9_$]+))?\s*\)?)\s+of\s+([\s\S]+)$/,
        );
        if (!match) continue;

        const itemVar = match[1];
        const indexVar = match[2] || 'index';
        const arrayExpr = match[3].trim();

        const parent = el.parentNode;
        if (!parent) continue;

        const anchor = document.createComment(`for: ${forAttr}`);
        parent.insertBefore(anchor, el);

        const templateEl = el.cloneNode(true) as HTMLElement;
        templateEl.removeAttribute('for');
        parent.removeChild(el);

        let currentNodes: HTMLElement[] = [];

        effect(() => {
            // Clean up previous rendered nodes
            for (const node of currentNodes) {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
            currentNodes = [];

            const rawArray = evaluateValue(arrayExpr, context);
            const list = Array.isArray(rawArray) ? rawArray : [];

            if (!anchor.parentNode) return;

            list.forEach((item, index) => {
                const clone = templateEl.cloneNode(true) as HTMLElement;
                const itemContext = Object.assign(Object.create(context), {
                    [itemVar]: item,
                    [indexVar]: index,
                    index,
                    $index: index,
                    $first: index === 0,
                    $last: index === list.length - 1,
                });

                anchor.parentNode?.insertBefore(clone, anchor);
                currentNodes.push(clone);

                // Recursively bind the cloned subtree with item context
                bindTemplateTree(clone, itemContext, componentInstance);
            });
        });
    }

    // 2. Bind Directives and Validators
    if (componentInstance) {
        const directives = bindDirectives(rootEl, componentInstance);
        if (componentInstance.activeDirectives) {
            componentInstance.activeDirectives.push(...directives);
        }
        const validators = bindValidators(rootEl, componentInstance);
        if (componentInstance.activeValidators) {
            componentInstance.activeValidators.push(...validators);
        }
    }

    // 3. Bind Text Node interpolations
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;

    while ((node = walker.nextNode())) {
        if (node.nodeValue && node.nodeValue.includes('{{')) {
            const parentEl = node.parentElement;
            if (parentEl?.closest('pre, [data-no-bind]')) {
                continue;
            }
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
                dynamicNode.nodeValue = evaluateExpression(expr, context);
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

    // 4. Bind Element Attributes
    const elementsWithAttrs = [rootEl, ...Array.from(rootEl.querySelectorAll('*'))];
    for (const el of elementsWithAttrs) {
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest('pre, [data-no-bind]')) continue;
        for (const attr of Array.from(el.attributes)) {
            if (attr.value.includes('{{')) {
                const rawValue = attr.value;
                const attrName = attr.name;
                effect(() => {
                    const replaced = rawValue.replace(
                        /\{\{\s*([\s\S]*?)\s*\}\}/g,
                        (_, expr) => evaluateExpression(expr.trim(), context),
                    );
                    if (attrName === 'class') {
                        el.className = replaced.trim();
                    } else {
                        if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && attrName === 'value') {
                            el.value = replaced;
                        }
                        el.setAttribute(attrName, replaced);
                        if (attrName.startsWith('on')) {
                            try {
                                (el as any)[attrName] = new Function('event', replaced);
                            } catch {}
                        }
                    }
                });
            }
        }
    }
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

        const inlineTemplate = this.template || options.template;
        const url = this.templateUrl || options.templateUrl;
        const initialContent = this.innerHTML;

        let templateToRender = inlineTemplate;

        if (!templateToRender && url) {
            if (templateCache.has(url)) {
                templateToRender = templateCache.get(url)!;
            } else {
                try {
                    const response = await fetch(url);
                    templateToRender = await response.text();
                    templateCache.set(url, templateToRender);
                } catch (error) {
                    console.error(`Failed to load template from ${url}`, error);
                }
            }
        }

        if (templateToRender) {
            if (templateToRender.includes('<slot')) {
                templateToRender = templateToRender.replace(
                    /<slot\s*>\s*([\s\S]*?)\s*<\/slot>|<slot\s*\/>/gi,
                    (_: string, fallback?: string) => {
                        return initialContent && initialContent.trim().length > 0
                            ? initialContent
                            : (fallback || '');
                    },
                );
            }
            this.innerHTML = templateToRender;
        }

        // Ensure child view getters are bound
        if (this.__childViews) {
            for (const { propertyKey, selector } of this.__childViews) {
                Object.defineProperty(this, propertyKey, {
                    get() {
                        return this.querySelector?.(selector) ?? document.querySelector?.(selector) ?? null;
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }

        this.onInit?.();
        this.bindTemplate?.();
    };

    proto.disconnectedCallback = function (this: any) {
        if (this.activeDirectives) {
            this.activeDirectives.forEach((d: { destroy: () => void }) => d.destroy());
            this.activeDirectives = [];
        }
        if (this.activeValidators) {
            this.activeValidators.forEach((v: { destroy: () => void }) => v.destroy());
            this.activeValidators = [];
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
        if (!this.activeValidators) {
            this.activeValidators = [];
        }

        bindTemplateTree(rootEl, this, this);
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
                            const protoDesc = Object.getOwnPropertyDescriptor(target.prototype, key);
                            if (protoDesc && protoDesc.get && desc.value === undefined && !desc.get && !desc.set) {
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

export interface ViewChildOptions {
    read?: 'element' | 'component';
}

export type ChildViewOptions = ViewChildOptions;

/**
 * ViewChild Decorator
 * Automatically queries and binds child elements / custom components matching the selector
 * when accessing the decorated property on the component instance.
 *
 * @param selector CSS selector for the child element or component (e.g. '#component1' or 'custom-component')
 */
export function ViewChild(selector: string, _options?: ViewChildOptions): any {
    return function (target: any, propertyKeyOrContext: any): any {
        // Stage 3 Decorators (Context object)
        if (
            typeof propertyKeyOrContext === 'object' &&
            propertyKeyOrContext !== null &&
            'name' in propertyKeyOrContext
        ) {
            const propertyName = propertyKeyOrContext.name;
            if (typeof propertyKeyOrContext.addInitializer === 'function') {
                propertyKeyOrContext.addInitializer(function (this: any) {
                    Object.defineProperty(this, propertyName, {
                        get() {
                            return this.querySelector?.(selector) ?? document.querySelector?.(selector) ?? null;
                        },
                        enumerable: true,
                        configurable: true,
                    });
                });
            }
            return function (this: any, initialValue: any) {
                Object.defineProperty(this, propertyName, {
                    get() {
                        return this.querySelector?.(selector) ?? document.querySelector?.(selector) ?? null;
                    },
                    enumerable: true,
                    configurable: true,
                });
                return initialValue;
            };
        }

        // Standard / TypeScript Property Decorator
        const propertyKey = propertyKeyOrContext;
        if (!target.__childViews) {
            target.__childViews = [];
        }
        target.__childViews.push({ propertyKey, selector });

        Object.defineProperty(target, propertyKey, {
            get(this: any) {
                return this.querySelector?.(selector) ?? document.querySelector?.(selector) ?? null;
            },
            set(_value: any) {
                // allow property override
            },
            enumerable: true,
            configurable: true,
        });
    };
}

export const ChildView = ViewChild;

export const defineComponent = (name: string, component: any) => {
    if (!customElements.get(name)) {
        customElements.define(name, component);
    } else {
        console.error(`Component ${name} is already defined`);
    }
};
