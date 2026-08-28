import { effect } from './core';

export interface VirtualForOptions {
    itemHeight: number;
    buffer: number;
    height?: string;
    dynamicHeight?: boolean;
    scrollIndexExpr?: string;
    scrollAlign?: 'start' | 'center' | 'end';
}

export interface VirtualScrollMetrics {
    totalItems: number;
    renderedCount: number;
    startIndex: number;
    endIndex: number;
    scrollTop: number;
    totalHeight: number;
    itemHeight: number;
}

const VIRTUAL_FOR_ATTRS = [
    'virtual-for',
    '*virtual-for',
    'p-virtual-for',
    'pVirtualFor',
    'p-virtualfor',
    'virtualFor',
    'virtualfor',
];

export function getVirtualForAttribute(el: Element): string | null {
    for (const attr of VIRTUAL_FOR_ATTRS) {
        const val = el.getAttribute(attr);
        if (val !== null) return val;
    }
    return null;
}

export function hasVirtualForAttribute(el: Element): boolean {
    return getVirtualForAttribute(el) !== null;
}

export function removeVirtualForAttributes(el: Element): void {
    for (const attr of VIRTUAL_FOR_ATTRS) {
        if (el.hasAttribute(attr)) {
            el.removeAttribute(attr);
        }
    }
}

/**
 * Parses virtual-for expression:
 * e.g. "let item, index of items; itemHeight: 48; buffer: 8; height: 420px; scrollIndex: jumpSignal"
 */
export function parseVirtualForExpression(rawExpr: string): {
    itemVar: string;
    indexVar: string;
    arrayExpr: string;
    options: VirtualForOptions;
} {
    const parts = rawExpr.split(';').map((p) => p.trim()).filter(Boolean);
    const mainForPart = parts[0];

    const match = mainForPart.match(
        /^(?:let\s+)?(?:\(?\s*([a-zA-Z0-9_$]+)(?:\s*,\s*([a-zA-Z0-9_$]+))?\s*\)?)\s+of\s+([\s\S]+)$/,
    );

    const itemVar = match ? match[1] : 'item';
    const indexVar = match && match[2] ? match[2] : 'index';
    const arrayExpr = match ? match[3].trim() : mainForPart.trim();

    const options: VirtualForOptions = {
        itemHeight: 48,
        buffer: 6,
        scrollAlign: 'center',
    };

    for (let i = 1; i < parts.length; i++) {
        const [key, val] = parts[i].split(':').map((s) => s.trim());
        if (!key || !val) continue;

        if (key === 'itemHeight' || key === 'item-height') {
            const num = parseFloat(val);
            if (!isNaN(num) && num > 0) options.itemHeight = num;
        } else if (key === 'buffer' || key === 'overscan') {
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= 0) options.buffer = num;
        } else if (key === 'height') {
            options.height = val;
        } else if (
            key === 'scrollIndex' ||
            key === 'scroll-index' ||
            key === 'jumpIndex' ||
            key === 'jump-index' ||
            key === 'scrollTo' ||
            key === 'scroll-to'
        ) {
            options.scrollIndexExpr = val;
        } else if (key === 'scrollAlign' || key === 'scroll-align' || key === 'align') {
            const cleanAlign = val.replace(/['"]/g, '').toLowerCase();
            if (cleanAlign === 'start' || cleanAlign === 'center' || cleanAlign === 'end') {
                options.scrollAlign = cleanAlign as 'start' | 'center' | 'end';
            }
        }
    }

    return { itemVar, indexVar, arrayExpr, options };
}

/**
 * Binds high-performance virtual scrolling repeater on elements with `virtual-for`
 * or inside `<virtual-scroll>` custom containers.
 */
export function bindVirtualFor(
    rootEl: HTMLElement,
    context: any,
    componentInstance: any,
    bindTemplateTreeFn: (root: HTMLElement, ctx: any, inst: any) => void,
    evaluateValueFn: (expr: string, ctx: any) => any,
    isInsideNestedComponentFn: (node: Node, root: HTMLElement) => boolean,
): void {
    const allElements = Array.from(rootEl.querySelectorAll('*')).filter(
        (el): el is HTMLElement => el instanceof HTMLElement && hasVirtualForAttribute(el),
    );

    const topLevelVirtualElements = allElements.filter((el) => {
        if (isInsideNestedComponentFn(el, rootEl)) return false;
        let p = el.parentElement;
        while (p && p !== rootEl) {
            if (hasVirtualForAttribute(p)) {
                return false;
            }
            p = p.parentElement;
        }
        return true;
    });

    for (const el of topLevelVirtualElements) {
        if (el.closest('[data-no-bind]')) continue;

        const rawAttr = getVirtualForAttribute(el);
        if (!rawAttr) continue;

        const parsed = parseVirtualForExpression(rawAttr);

        // Check if element has explicit HTML attributes overriding options
        const attrItemHeight = el.getAttribute('item-height') || el.getAttribute('itemHeight');
        if (attrItemHeight) {
            const num = parseFloat(attrItemHeight);
            if (!isNaN(num) && num > 0) parsed.options.itemHeight = num;
        }

        const attrBuffer = el.getAttribute('buffer') || el.getAttribute('overscan');
        if (attrBuffer) {
            const num = parseInt(attrBuffer, 10);
            if (!isNaN(num) && num >= 0) parsed.options.buffer = num;
        }

        const attrHeight = el.getAttribute('height') || el.getAttribute('viewport-height');
        if (attrHeight) {
            parsed.options.height = attrHeight;
        }

        const attrScrollIndex =
            el.getAttribute('scroll-index') ||
            el.getAttribute('scrollIndex') ||
            el.getAttribute('[scroll-index]') ||
            el.getAttribute('[scrollIndex]') ||
            el.getAttribute('jump-index') ||
            el.getAttribute('jumpIndex');
        if (attrScrollIndex) {
            parsed.options.scrollIndexExpr = attrScrollIndex;
        }

        const attrScrollAlign =
            el.getAttribute('scroll-align') ||
            el.getAttribute('scrollAlign') ||
            el.getAttribute('align');
        if (attrScrollAlign) {
            const clean = attrScrollAlign.toLowerCase();
            if (clean === 'start' || clean === 'center' || clean === 'end') {
                parsed.options.scrollAlign = clean as 'start' | 'center' | 'end';
            }
        }

        const parent = el.parentElement;
        if (!parent) continue;

        // Create virtual scroll container and viewport structure
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'p-virtual-scroll-container';
        scrollContainer.style.position = 'relative';
        scrollContainer.style.overflowY = 'auto';
        scrollContainer.style.overflowX = 'hidden';
        (scrollContainer.style as any).webkitOverflowScrolling = 'touch';
        scrollContainer.style.contain = 'strict';
        scrollContainer.style.boxSizing = 'border-box';
        scrollContainer.style.minHeight = '120px';

        if (parsed.options.height) {
            scrollContainer.style.height = parsed.options.height.endsWith('px') || parsed.options.height.endsWith('%') || parsed.options.height.endsWith('vh') || parsed.options.height.endsWith('em') || parsed.options.height.endsWith('rem')
                ? parsed.options.height
                : `${parsed.options.height}px`;
        } else if (el.style.height) {
            scrollContainer.style.height = el.style.height;
        } else {
            scrollContainer.style.height = '420px';
        }

        // Copy classes from host template if present
        if (el.classList.contains('virtual-viewport') || el.classList.contains('window')) {
            scrollContainer.className += ' ' + el.className.replace(/p-virtual-scroll-container/g, '');
        }

        const phantomSpacer = document.createElement('div');
        phantomSpacer.className = 'p-virtual-spacer';
        phantomSpacer.style.position = 'absolute';
        phantomSpacer.style.top = '0';
        phantomSpacer.style.left = '0';
        phantomSpacer.style.width = '1px';
        phantomSpacer.style.pointerEvents = 'none';
        phantomSpacer.style.opacity = '0';

        const viewportContent = document.createElement('div');
        viewportContent.className = 'p-virtual-content';
        viewportContent.style.position = 'absolute';
        viewportContent.style.top = '0';
        viewportContent.style.left = '0';
        viewportContent.style.right = '0';
        viewportContent.style.width = '100%';
        viewportContent.style.boxSizing = 'border-box';

        scrollContainer.appendChild(phantomSpacer);
        scrollContainer.appendChild(viewportContent);

        // Template element for rendering rows
        const rowTemplate = el.cloneNode(true) as HTMLElement;
        removeVirtualForAttributes(rowTemplate);
        rowTemplate.style.position = 'absolute';
        rowTemplate.style.left = '0';
        rowTemplate.style.right = '0';
        rowTemplate.style.width = '100%';
        rowTemplate.style.boxSizing = 'border-box';

        parent.insertBefore(scrollContainer, el);
        parent.removeChild(el);

        // Active node cache for recycling: index -> DOM Node
        const renderedNodes = new Map<number, HTMLElement>();
        let currentArray: any[] = [];
        let itemHeight = parsed.options.itemHeight;
        let buffer = parsed.options.buffer;
        let isRafScheduled = false;

        const updateWindow = () => {
            isRafScheduled = false;
            if (!scrollContainer.isConnected) return;

            const totalCount = currentArray.length;
            const totalHeight = totalCount * itemHeight;
            phantomSpacer.style.height = `${totalHeight}px`;

            const scrollTop = scrollContainer.scrollTop;
            const viewportHeight = scrollContainer.clientHeight || 420;

            const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
            const endIndex = Math.min(totalCount, Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer);

            // 1. Remove nodes that fell out of view
            for (const [idx, node] of renderedNodes.entries()) {
                if (idx < startIndex || idx >= endIndex) {
                    if (node.parentNode) {
                        node.parentNode.removeChild(node);
                    }
                    renderedNodes.delete(idx);
                }
            }

            // 2. Render and bind entering visible nodes in a single batched DocumentFragment
            const fragment = document.createDocumentFragment();
            let hasNewNodes = false;

            for (let i = startIndex; i < endIndex; i++) {
                if (renderedNodes.has(i)) {
                    // Update position if height changed
                    const existingNode = renderedNodes.get(i)!;
                    existingNode.style.top = `${i * itemHeight}px`;
                    existingNode.style.height = `${itemHeight}px`;
                    continue;
                }

                const itemData = currentArray[i];
                const clone = rowTemplate.cloneNode(true) as HTMLElement;
                clone.style.position = 'absolute';
                clone.style.top = `${i * itemHeight}px`;
                clone.style.height = `${itemHeight}px`;
                clone.style.left = '0';
                clone.style.right = '0';
                clone.style.boxSizing = 'border-box';
                clone.setAttribute('data-virtual-index', String(i));

                const itemContext = Object.assign(Object.create(context), {
                    [parsed.itemVar]: itemData,
                    [parsed.indexVar]: i,
                    index: i,
                    $index: i,
                    $first: i === 0,
                    $last: i === totalCount - 1,
                    $even: i % 2 === 0,
                    $odd: i % 2 !== 0,
                    __host: componentInstance || (context instanceof Element ? context : (context as any)?.__host),
                });

                // Recursively bind handlebars, pipes, directives, and validators inside row
                bindTemplateTreeFn(clone, itemContext, componentInstance);

                fragment.appendChild(clone);
                renderedNodes.set(i, clone);
                hasNewNodes = true;
            }

            if (hasNewNodes) {
                viewportContent.appendChild(fragment);
            }
        };

        const scheduleUpdate = () => {
            if (!isRafScheduled) {
                isRafScheduled = true;
                requestAnimationFrame(updateWindow);
            }
        };

        // Passive scroll listener for smooth 60fps / 120fps scrolling
        scrollContainer.addEventListener('scroll', scheduleUpdate, { passive: true });

        // Observe resize changes to viewport height
        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => scheduleUpdate());
            resizeObserver.observe(scrollContainer);
        }

        // Programmatic API helpers attached to the scroll container
        (scrollContainer as any).scrollToIndex = (targetIndex: number, align: 'start' | 'center' | 'end' = 'start', behavior: ScrollBehavior = 'auto') => {
            const totalCount = currentArray.length;
            const clamped = Math.max(0, Math.min(totalCount - 1, targetIndex));
            const viewportH = scrollContainer.clientHeight || 380;
            let targetScrollTop = clamped * itemHeight;

            if (align === 'center') {
                targetScrollTop = Math.max(0, targetScrollTop - (viewportH / 2) + (itemHeight / 2));
            } else if (align === 'end') {
                targetScrollTop = Math.max(0, targetScrollTop - viewportH + itemHeight);
            }

            scrollContainer.scrollTo({
                top: targetScrollTop,
                behavior,
            });
            updateWindow();
        };

        (scrollContainer as any).getVirtualMetrics = (): VirtualScrollMetrics => {
            const scrollTop = scrollContainer.scrollTop;
            const viewportHeight = scrollContainer.clientHeight || 420;
            const totalCount = currentArray.length;
            const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
            const endIndex = Math.min(totalCount, Math.ceil((scrollTop + viewportHeight) / itemHeight) + buffer);

            return {
                totalItems: totalCount,
                renderedCount: renderedNodes.size,
                startIndex,
                endIndex,
                scrollTop,
                totalHeight: totalCount * itemHeight,
                itemHeight,
            };
        };

        // Reactive effect observing array signals and option updates
        effect(() => {
            const rawArray = evaluateValueFn(parsed.arrayExpr, context);
            currentArray = Array.isArray(rawArray) ? rawArray : [];

            // Clear previously rendered nodes to re-bind on fresh array reference
            for (const node of renderedNodes.values()) {
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
            renderedNodes.clear();

            updateWindow();
        });

        // Reactive effect observing declarative scroll index / jump target signal
        if (parsed.options.scrollIndexExpr) {
            let lastScrolledIndex: number | null = null;
            effect(() => {
                const rawIdx = evaluateValueFn(parsed.options.scrollIndexExpr!, context);
                const targetIdx = typeof rawIdx === 'number' ? rawIdx : parseInt(String(rawIdx), 10);
                if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx !== lastScrolledIndex) {
                    lastScrolledIndex = targetIdx;
                    (scrollContainer as any).scrollToIndex(targetIdx, parsed.options.scrollAlign || 'center');
                }
            });
        }
    }
}
