import { effect } from './core';
import { bindDirectives } from './directive';
import { bindValidators } from './validator';
import { executePipe } from './pipe';
import { bindVirtualFor, hasVirtualForAttribute, getVirtualForAttribute } from './virtual-for';

export { bindVirtualFor, hasVirtualForAttribute, getVirtualForAttribute };

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
 * Checks if a DOM node is located inside a nested custom element child of rootEl.
 */
export function isInsideNestedComponent(node: Node, rootEl: HTMLElement): boolean {
    let current: HTMLElement | null =
        node.nodeType === Node.TEXT_NODE
            ? node.parentElement
            : (node as HTMLElement).parentElement;
    while (current && current !== rootEl) {
        if (current.tagName && current.tagName.includes('-')) {
            return true;
        }
        current = current.parentElement;
    }
    return false;
}

export interface ConditionalBranch {
    type: 'if' | 'else-if' | 'else';
    expr: string;
    templateEl: HTMLElement;
}

const CONDITIONAL_ATTRS = [
    'if', '*if', 'p-if', 'pif', 'pIf',
    'else-if', 'elseif', '*else-if', '*elseif', 'p-else-if', 'pElseIf', 'p-elseif', 'pElseif',
    'else', '*else', 'p-else', 'pElse', 'pelse',
];

export function getIfAttribute(el: Element): string | null {
    return (
        el.getAttribute('if') ??
        el.getAttribute('*if') ??
        el.getAttribute('p-if') ??
        el.getAttribute('pif') ??
        el.getAttribute('pIf')
    );
}

export function getElseIfAttribute(el: Element): string | null {
    return (
        el.getAttribute('else-if') ??
        el.getAttribute('elseif') ??
        el.getAttribute('*else-if') ??
        el.getAttribute('*elseif') ??
        el.getAttribute('p-else-if') ??
        el.getAttribute('pElseIf') ??
        el.getAttribute('p-elseif') ??
        el.getAttribute('pElseif')
    );
}

export function hasElseAttribute(el: Element): boolean {
    return (
        el.hasAttribute('else') ||
        el.hasAttribute('*else') ||
        el.hasAttribute('p-else') ||
        el.hasAttribute('pElse') ||
        el.hasAttribute('pelse')
    );
}

export function isStructuralConditional(el: Element): boolean {
    return getIfAttribute(el) !== null || getElseIfAttribute(el) !== null || hasElseAttribute(el);
}

const FOR_ATTRS = ['for', '*for', 'p-for', 'pfor', 'pFor'];

export function getForAttribute(el: Element): string | null {
    return (
        el.getAttribute('for') ??
        el.getAttribute('*for') ??
        el.getAttribute('p-for') ??
        el.getAttribute('pfor') ??
        el.getAttribute('pFor')
    );
}

export function hasForAttribute(el: Element): boolean {
    return getForAttribute(el) !== null;
}

function removeForAttributes(el: Element): void {
    for (const attr of FOR_ATTRS) {
        if (el.hasAttribute(attr)) {
            el.removeAttribute(attr);
        }
    }
}

function removeConditionalAttributes(el: Element): void {
    for (const attr of CONDITIONAL_ATTRS) {
        if (el.hasAttribute(attr)) {
            el.removeAttribute(attr);
        }
    }
}

/**
 * Recursively binds structural conditionals (if / else-if / else), for loops,
 * text interpolations, attribute bindings, directives, and validators across
 * a DOM subtree with a specific context.
 */
function bindTemplateTree(rootEl: HTMLElement, context: any, componentInstance: any) {
    if (!rootEl) return;

    // 1. Process structural conditional directives (`if`, `else-if`, `else`) inside rootEl
    const candidateIfElements = Array.from(rootEl.querySelectorAll('*')).filter((el): el is HTMLElement => {
        if (!(el instanceof HTMLElement)) return false;
        if (getIfAttribute(el) === null) return false;
        if (el.closest('[data-no-bind]')) return false;
        if (isInsideNestedComponent(el, rootEl)) return false;
        let p = el.parentElement;
        while (p && p !== rootEl) {
            if (isStructuralConditional(p) || hasForAttribute(p) || hasVirtualForAttribute(p)) {
                return false;
            }
            p = p.parentElement;
        }
        return true;
    });

    const consumedConditionalElements = new Set<Element>();

    for (const el of candidateIfElements) {
        if (consumedConditionalElements.has(el)) continue;
        if (!el.parentNode) continue;

        const parent = el.parentNode;
        const ifExpr = getIfAttribute(el)!;
        const branches: ConditionalBranch[] = [];

        // Branch 0: 'if'
        const ifTemplate = el.cloneNode(true) as HTMLElement;
        removeConditionalAttributes(ifTemplate);
        branches.push({
            type: 'if',
            expr: ifExpr,
            templateEl: ifTemplate,
        });
        consumedConditionalElements.add(el);

        // Look ahead at sibling elements for connected else-if and else branches
        const siblingElementsToRemove: HTMLElement[] = [el];
        let next = el.nextElementSibling;
        while (next && next instanceof HTMLElement) {
            if (isInsideNestedComponent(next, rootEl)) break;
            const elseIfExpr = getElseIfAttribute(next);
            if (elseIfExpr !== null) {
                const elseIfTemplate = next.cloneNode(true) as HTMLElement;
                removeConditionalAttributes(elseIfTemplate);
                branches.push({
                    type: 'else-if',
                    expr: elseIfExpr,
                    templateEl: elseIfTemplate,
                });
                consumedConditionalElements.add(next);
                siblingElementsToRemove.push(next);
                next = next.nextElementSibling;
                continue;
            }

            if (hasElseAttribute(next)) {
                const elseTemplate = next.cloneNode(true) as HTMLElement;
                removeConditionalAttributes(elseTemplate);
                branches.push({
                    type: 'else',
                    expr: 'true',
                    templateEl: elseTemplate,
                });
                consumedConditionalElements.add(next);
                siblingElementsToRemove.push(next);
                break;
            }

            break;
        }

        // Insert anchor bookmarks at the location of `el`
        const startAnchor = document.createComment(`if-start: ${ifExpr}`);
        const endAnchor = document.createComment(`if-end`);
        parent.insertBefore(startAnchor, el);
        parent.insertBefore(endAnchor, el);

        // Remove all branch DOM elements from the active document tree
        for (const item of siblingElementsToRemove) {
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
        }

        let currentRenderedIndex = -1;

        effect(() => {
            let matchedIndex = -1;

            for (let i = 0; i < branches.length; i++) {
                const branch = branches[i];
                if (branch.type === 'else') {
                    matchedIndex = i;
                    break;
                }

                const rawVal = evaluateValue(branch.expr, context);
                const isTruthy =
                    rawVal !== false &&
                    rawVal !== 0 &&
                    rawVal !== '' &&
                    rawVal !== null &&
                    rawVal !== undefined;

                if (isTruthy) {
                    matchedIndex = i;
                    break;
                }
            }

            if (matchedIndex === currentRenderedIndex) {
                return;
            }

            // Clean up previous rendered nodes between startAnchor and endAnchor
            while (startAnchor.nextSibling && startAnchor.nextSibling !== endAnchor) {
                const nodeToRemove = startAnchor.nextSibling;
                nodeToRemove.parentNode?.removeChild(nodeToRemove);
            }

            currentRenderedIndex = matchedIndex;

            if (matchedIndex !== -1 && endAnchor.parentNode) {
                const matchedBranch = branches[matchedIndex];
                const clone = matchedBranch.templateEl.cloneNode(true) as HTMLElement;
                endAnchor.parentNode.insertBefore(clone, endAnchor);

                // Recursively build, compile, and bind the cloned subtree with the active context
                bindTemplateTree(clone, context, componentInstance);
            }
        });
    }

    // 2. Process high-performance Virtualized For repeaters (`virtual-for`) inside rootEl
    bindVirtualFor(rootEl, context, componentInstance, bindTemplateTree, evaluateValue, isInsideNestedComponent);

    // 3. Process structural standard `for` loops inside rootEl
    const allForElements = Array.from(rootEl.querySelectorAll('*')).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && hasForAttribute(el) && !hasVirtualForAttribute(el),
    );
    const topLevelForElements = allForElements.filter((el) => {
        if (isInsideNestedComponent(el, rootEl)) return false;
        let p = el.parentElement;
        while (p && p !== rootEl) {
            if (hasForAttribute(p) || isStructuralConditional(p) || hasVirtualForAttribute(p)) {
                return false;
            }
            p = p.parentElement;
        }
        return true;
    });

    for (const el of topLevelForElements) {
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest('[data-no-bind]')) continue;

        const forAttr = getForAttribute(el);
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
        removeForAttributes(templateEl);
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

            const fragment = document.createDocumentFragment();

            list.forEach((item, index) => {
                const clone = templateEl.cloneNode(true) as HTMLElement;
                const itemContext = Object.assign(Object.create(context), {
                    [itemVar]: item,
                    [indexVar]: index,
                    index,
                    $index: index,
                    $first: index === 0,
                    $last: index === list.length - 1,
                    __host: componentInstance || (context instanceof Element ? context : (context as any)?.__host),
                });

                // Recursively bind the cloned subtree with item context
                bindTemplateTree(clone, itemContext, componentInstance);

                fragment.appendChild(clone);
                currentNodes.push(clone);
            });

            anchor.parentNode?.insertBefore(fragment, anchor);
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
            if (parentEl?.closest('[data-no-bind]')) {
                continue;
            }
            if (isInsideNestedComponent(node, rootEl)) {
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

    // 4. Bind Element Attributes & Event Handlers
    const elementsWithAttrs = [rootEl, ...Array.from(rootEl.querySelectorAll('*'))];
    for (const el of elementsWithAttrs) {
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest('[data-no-bind]')) continue;
        if (el !== rootEl && isInsideNestedComponent(el, rootEl)) continue;
        for (const attr of Array.from(el.attributes)) {
            let attrName = attr.name;
            const rawValue = attr.value;

            if (attrName === 'data-purity-val') {
                attrName = 'value';
                el.removeAttribute('data-purity-val');
            }

            // Bind event handlers (onclick, oninput, onchange, etc.) to component/item context
            if (attrName.startsWith('on')) {
                try {
                    const eventType = attrName.slice(2).toLowerCase();
                    const cleanedExpr = rawValue.replace(/\{\{\s*([\s\S]*?)\s*\}\}/g, '$1');
                    const handlerFn = new Function(
                        '$event',
                        '__context',
                        '__pipe',
                        `with (__context) { return (function(event) { ${cleanedExpr} }).call(this, $event); }`,
                    );
                    const listener = function (this: any, event: Event) {
                        return handlerFn.call(this, event, context, executePipe);
                    };
                    (el as any)[attrName] = listener;
                    el.addEventListener(eventType, listener);
                    el.removeAttribute(attrName);
                } catch (err) {
                    console.error(`[Purity] Failed to compile event handler ${attrName}="${rawValue}":`, err);
                }
                continue;
            }

            if (rawValue.includes('{{')) {
                effect(() => {
                    const replaced = rawValue.replace(
                        /\{\{\s*([\s\S]*?)\s*\}\}/g,
                        (_, expr) => evaluateExpression(expr.trim(), context),
                    );
                    if (attrName === 'class') {
                        el.className = replaced.trim();
                    } else if (
                        ['disabled', 'checked', 'readonly', 'required', 'hidden', 'selected', 'open'].includes(attrName)
                    ) {
                        const val = replaced.trim();
                        const isTruthy =
                            val !== '' &&
                            val !== 'false' &&
                            val !== 'null' &&
                            val !== 'undefined' &&
                            val !== '0';
                        if (isTruthy) {
                            el.setAttribute(attrName, val || attrName);
                            (el as any)[attrName] = true;
                        } else {
                            el.removeAttribute(attrName);
                            (el as any)[attrName] = false;
                        }
                    } else {
                        if ((el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && attrName === 'value') {
                            el.value = replaced;
                        }
                        el.setAttribute(attrName, replaced);
                    }
                });
            }
        }
    }
}

/**
 * Generates candidate DOM query selectors from a property key when an explicit selector is not specified.
 * E.g., propertyKey = 'testDemoComponent' -> ['test-demo-component', '#test-demo-component', 'test-demo', '#test-demo', '#testDemoComponent']
 */
function getCandidateSelectors(propertyKey: string, explicitSelector?: string): string[] {
    if (explicitSelector && explicitSelector.trim().length > 0) {
        return [explicitSelector.trim()];
    }

    const kebab = toKebabCase(propertyKey);
    const candidates = new Set<string>();

    // 1. Exact kebab tag name (e.g. <test-demo-component>, <loader>)
    candidates.add(kebab);

    // 2. Exact kebab ID (e.g. #test-demo-component, #loader)
    candidates.add('#' + kebab);

    // 3. Tag variations with / without '-component'
    if (kebab.endsWith('-component')) {
        const withoutComponent = kebab.slice(0, -10);
        candidates.add(withoutComponent);
        candidates.add('#' + withoutComponent);
    } else {
        candidates.add(kebab + '-component');
        candidates.add('#' + kebab + '-component');
    }

    // 4. Exact propertyKey as ID (e.g. #testDemoComponent)
    candidates.add('#' + propertyKey);

    return Array.from(candidates);
}

/**
 * Safely resolves a child element matching selector or candidate list from a host or root document
 * without throwing illegal invocation when host is a prototype/context wrapper.
 */
function safeQuerySelector(host: any, selectorOrCandidates: string | string[]): any {
    if (typeof document === 'undefined') return null;

    const selectors = Array.isArray(selectorOrCandidates)
        ? selectorOrCandidates
        : [selectorOrCandidates];

    for (const selector of selectors) {
        if (!selector) continue;

        if (host && host.__host) {
            try {
                const el = host.__host.querySelector?.(selector);
                if (el) return el;
            } catch (_) {}
        }

        if (host) {
            try {
                const el = host.querySelector?.(selector);
                if (el) return el;
            } catch (_) {}
        }

        try {
            const el = document.querySelector?.(selector);
            if (el) return el;
        } catch (_) {}
    }

    return null;
}

/**
 * Sanitizes template HTML to prevent browser HTML parser warnings on strict input types
 * (e.g. type="number", type="range", type="date") before Handlebars expressions are bound.
 */
function sanitizeStrictInputAttributes(html: string): string {
    return html.replace(/<input\b([^>]*?)>/gi, (fullTag, attrs) => {
        const isStrictType = /\btype=["'](?:number|range|date|time|month|week|datetime-local)["']/i.test(attrs);
        if (isStrictType && /\bvalue=["']\{\{[\s\S]*?\}\}["']/i.test(attrs)) {
            const transformedAttrs = attrs.replace(/\bvalue=(["']\{\{[\s\S]*?\}\}["'])/i, 'data-purity-val=$1');
            return `<input${transformedAttrs}>`;
        }
        return fullTag;
    });
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
            this.innerHTML = sanitizeStrictInputAttributes(templateToRender);
        }

        // Ensure child view getters are bound
        if (this.__childViews) {
            for (const { propertyKey, selector, candidates } of this.__childViews) {
                const searchList = candidates || (selector ? [selector] : getCandidateSelectors(propertyKey));
                Object.defineProperty(this, propertyKey, {
                    get() {
                        return safeQuerySelector(this, searchList);
                    },
                    enumerable: true,
                    configurable: true,
                });
            }
        }

        this.bindTemplate?.();
        this.onInit?.();
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
            this.innerHTML = sanitizeStrictInputAttributes(content);
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

        // If Custom Element tag is already defined in the browser registry (e.g. playground re-evaluation / HMR),
        // update its active target constructor, template, and prototype descriptors dynamically.
        if (typeof customElements !== 'undefined' && selector && customElements.get(selector)) {
            const existing = customElements.get(selector) as any;
            existing.__target = target;
            existing.__options = options;
            existing.selector = selector;
            (target as any).selector = selector;
            if (options.template) (existing.prototype as any).template = options.template;
            if (options.templateUrl) (existing.prototype as any).templateUrl = options.templateUrl;

            const descriptors = Object.getOwnPropertyDescriptors(target.prototype);
            for (const [key, desc] of Object.entries(descriptors)) {
                if (key !== 'constructor') {
                    Object.defineProperty(existing.prototype, key, desc);
                }
            }
            attachComponentLifecycle(existing.prototype, options);
            return existing;
        }

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

                    const activeTarget = (this.constructor as any).__target || target;
                    const userInstance = new (activeTarget as any)();

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

            (ComponentElement as any).__target = target;
            (ComponentElement as any).__options = options;
            (ComponentElement as any).selector = selector;
            (target as any).selector = selector;

            attachComponentLifecycle(ComponentElement.prototype, options);
            CustomElementClass = ComponentElement;
        }

        (CustomElementClass as any).selector = selector;
        (target as any).selector = selector;

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
 * Automatically queries and binds child elements / custom components when accessing the decorated property.
 * If selector is omitted, the selector is implicitly inferred from the property name in kebab-case
 * (e.g. `testDemoComponent` -> `<test-demo-component>` / `#test-demo-component`, `loader` -> `<loader-component>` / `#loader`).
 * An explicit selector is optional and only needed when disambiguating between multiple instances.
 *
 * @param selectorOrTarget Optional CSS selector string (e.g. '#component1' or 'custom-component'), or target for bare decorator usage
 * @param propertyKeyOrOptions Optional property key or ViewChild options
 */
export function ViewChild(selectorOrTarget?: string | any, propertyKeyOrOptions?: any): any {
    // 1. Bare decorator usage: @ViewChild propertyName: any;
    if (typeof selectorOrTarget === 'object' && selectorOrTarget !== null && typeof propertyKeyOrOptions === 'string') {
        const target = selectorOrTarget;
        const propertyKey = propertyKeyOrOptions;
        applyViewChild(target, propertyKey, undefined);
        return;
    }

    // 2. Factory usage: @ViewChild() or @ViewChild('selector') or @ViewChild(options)
    const explicitSelector = typeof selectorOrTarget === 'string' ? selectorOrTarget : undefined;

    return function (target: any, propertyKeyOrContext: any): any {
        // Stage 3 Decorators (Context object)
        if (
            typeof propertyKeyOrContext === 'object' &&
            propertyKeyOrContext !== null &&
            'name' in propertyKeyOrContext
        ) {
            const propertyName = propertyKeyOrContext.name;
            const candidates = getCandidateSelectors(propertyName, explicitSelector);
            if (typeof propertyKeyOrContext.addInitializer === 'function') {
                propertyKeyOrContext.addInitializer(function (this: any) {
                    Object.defineProperty(this, propertyName, {
                        get() {
                            return safeQuerySelector(this, candidates);
                        },
                        enumerable: true,
                        configurable: true,
                    });
                });
            }
            return function (this: any, initialValue: any) {
                Object.defineProperty(this, propertyName, {
                    get() {
                        return safeQuerySelector(this, candidates);
                    },
                    enumerable: true,
                    configurable: true,
                });
                return initialValue;
            };
        }

        // Standard / TypeScript Property Decorator
        const propertyKey = propertyKeyOrContext;
        applyViewChild(target, propertyKey, explicitSelector);
    };
}

function applyViewChild(target: any, propertyKey: string, explicitSelector?: string): void {
    if (!target.__childViews) {
        target.__childViews = [];
    }
    const candidates = getCandidateSelectors(propertyKey, explicitSelector);
    target.__childViews.push({ propertyKey, selector: explicitSelector, candidates });

    Object.defineProperty(target, propertyKey, {
        get(this: any) {
            return safeQuerySelector(this, candidates);
        },
        set(_value: any) {
            // allow property override
        },
        enumerable: true,
        configurable: true,
    });
}

export const ChildView = ViewChild;

export const defineComponent = (name: string, component: any) => {
    if (!customElements.get(name)) {
        customElements.define(name, component);
    } else {
        console.error(`Component ${name} is already defined`);
    }
};
