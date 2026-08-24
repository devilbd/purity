import type { Constructor } from './di';
import { effect } from './core';

export interface DirectiveLifecycle {
    element: HTMLElement;
    value?: any;
    onInit?(): void;
    onChanges?(value: any, oldValue?: any): void;
    onDOMChange?(record: MutationRecord | Event): void;
    onDestroy?(): void;
}

export interface DirectiveOptions {
    selector: string;
}

export const directiveRegistry = new Map<string, Constructor<DirectiveLifecycle>>();

/**
 * Normalizes directive selectors (e.g. '[highlight]' -> 'highlight')
 */
export function normalizeDirectiveSelector(selector: string): string {
    return selector.replace(/^\[|\]$/g, '').trim().toLowerCase();
}

/**
 * Decorator to register a class as a Directive.
 * Supports:
 * - @Directive('directiveName')
 * - @Directive({ selector: 'directiveName' })
 * - @Directive('[directiveName]')
 * - @Directive
 */
export function Directive(
    selectorOrOptionsOrTarget: string | DirectiveOptions | Constructor,
    context?: any,
): any {
    if (typeof selectorOrOptionsOrTarget === 'function') {
        const target = selectorOrOptionsOrTarget;
        const name =
            context && typeof context.name === 'string' ? context.name : target.name;
        const normalized = normalizeDirectiveSelector(
            name.replace(/directive$/i, ''),
        );
        directiveRegistry.set(
            normalized,
            target as unknown as Constructor<DirectiveLifecycle>,
        );
        return target;
    }

    const selector =
        typeof selectorOrOptionsOrTarget === 'string'
            ? selectorOrOptionsOrTarget
            : selectorOrOptionsOrTarget.selector;

    const normalized = normalizeDirectiveSelector(selector);

    return function <T extends Constructor>(
        target: T,
        _context?: ClassDecoratorContext<T> | any,
    ): T | void {
        directiveRegistry.set(
            normalized,
            target as unknown as Constructor<DirectiveLifecycle>,
        );
        return target;
    };
}

/**
 * Base class for directives providing DOM reference, value, and lifecycle hooks.
 */
export abstract class BaseDirective implements DirectiveLifecycle {
    element!: HTMLElement;
    value?: any;

    onInit?(): void;
    onChanges?(value: any, oldValue?: any): void;
    onDOMChange?(record: MutationRecord | Event): void;
    onDestroy?(): void;
}

import { isInsideNestedComponent } from './component';

/**
 * Scans a DOM tree for attributes matching registered directives and initializes them.
 */
export function bindDirectives(
    root: HTMLElement,
    context: any = root,
): Array<{ destroy: () => void }> {
    const activeDirectives: Array<{ destroy: () => void }> = [];
    const elements = [root, ...Array.from(root.querySelectorAll('*'))];

    for (const el of elements) {
        if (!(el instanceof HTMLElement)) continue;
        if (el !== root && isInsideNestedComponent(el, root)) continue;

        for (const [selector, DirectiveConstructor] of directiveRegistry.entries()) {
            let matchedAttrName: string | null = null;

            if (el.hasAttribute(selector)) {
                matchedAttrName = selector;
            } else if (el.hasAttribute(`[${selector}]`)) {
                matchedAttrName = `[${selector}]`;
            }

            if (matchedAttrName !== null) {
                const instance = new DirectiveConstructor();
                instance.element = el;

                // Setup MutationObserver to notify directive when properties/attributes of DOM change
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        instance.onDOMChange?.(mutation);
                    }
                });

                observer.observe(el, {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: false,
                    attributeOldValue: true,
                });

                // Listen to standard input/change events for form controls
                const domEventListener = (e: Event) => {
                    instance.onDOMChange?.(e);
                };
                el.addEventListener('input', domEventListener);
                el.addEventListener('change', domEventListener);

                const rawAttrValue = el.getAttribute(matchedAttrName) || '';

                if (rawAttrValue.includes('{{')) {
                    // Reactive attribute value
                    let previousValue: any = undefined;
                    effect(() => {
                        try {
                            const replaced = rawAttrValue.replace(
                                /\{\{\s*([\s\S]*?)\s*\}\}/g,
                                (_, expr) => {
                                    const fn = new Function(
                                        `with (this) { return ${expr.trim()}; }`,
                                    );
                                    const val = fn.call(context);
                                    return val !== null && val !== undefined
                                        ? String(val)
                                        : '';
                                },
                            );
                            instance.value = replaced;
                            instance.onChanges?.(replaced, previousValue);
                            previousValue = replaced;
                        } catch (err) {
                            console.warn(
                                `[Purity Directive] Error in directive ${selector} reactive binding:`,
                                err,
                            );
                        }
                    });
                } else {
                    // Static value or simple presence
                    instance.value = rawAttrValue;
                    instance.onChanges?.(rawAttrValue, undefined);
                }

                // Call onInit lifecycle hook
                instance.onInit?.();

                activeDirectives.push({
                    destroy: () => {
                        observer.disconnect();
                        el.removeEventListener('input', domEventListener);
                        el.removeEventListener('change', domEventListener);
                        instance.onDestroy?.();
                    },
                });
            }
        }
    }

    return activeDirectives;
}
