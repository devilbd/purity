import { getElement } from '@purity/core';
import './resizable.scss';

export type ResizeCornerHandle =
    | 'nw'
    | 'ne'
    | 'se'
    | 'sw'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';

export type ResizeEdgeHandle =
    | 'n'
    | 's'
    | 'e'
    | 'w'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right';

export type ResizeHandle = ResizeCornerHandle | ResizeEdgeHandle;
export type CanonicalCorner = 'nw' | 'ne' | 'se' | 'sw';
export type CanonicalEdge = 'n' | 's' | 'e' | 'w';
export type CanonicalHandle = CanonicalCorner | CanonicalEdge;

export interface ResizeStartData {
    width: number;
    height: number;
    handle: CanonicalHandle;
    pointerX: number;
    pointerY: number;
}

export interface ResizeData {
    width: number;
    height: number;
    handle: CanonicalHandle;
    deltaX: number;
    deltaY: number;
    pointerX: number;
    pointerY: number;
}

export interface ResizeEndData {
    width: number;
    height: number;
    handle: CanonicalHandle;
}

export interface ResizableOptions {
    /** Target container CSS selector string */
    selector?: string;
    /** Direct target element or CSS selector */
    target?: string | HTMLElement;
    /** Handles to attach. Defaults to all 4 corners: ['nw', 'ne', 'se', 'sw'] */
    handles?: ResizeHandle[] | 'corners' | 'edges' | 'all';
    /** Minimum width in pixels (defaults to 20 or computed CSS min-width) */
    minWidth?: number;
    /** Minimum height in pixels (defaults to 20 or computed CSS min-height) */
    minHeight?: number;
    /** Maximum width in pixels (defaults to Infinity or computed CSS max-width) */
    maxWidth?: number;
    /** Maximum height in pixels (defaults to Infinity or computed CSS max-height) */
    maxHeight?: number;
    /** Lock aspect ratio: true locks initial aspect ratio, or specify numeric ratio (width / height) */
    aspectRatio?: number | boolean;
    /** Grid snap in pixels: number or [snapX, snapY] */
    snap?: number | [number, number];
    /** Constrain resizing within a container or 'parent' or 'window' */
    constrainTo?: string | HTMLElement | 'parent' | 'window';
    /** Positioning mode for top/left handle changes: 'auto' (default), 'transform', or 'position' */
    positionMode?: 'auto' | 'transform' | 'position';
    /** Visual theme for handles: 'modern' (Adwaita pills), 'minimal', or 'invisible' */
    handleTheme?: 'modern' | 'minimal' | 'invisible';
    /** Custom class applied to injected handles */
    handleClass?: string;
    /** Callback fired when resize starts */
    onResizeStart?: (el: HTMLElement, data: ResizeStartData) => void;
    /** Callback fired on each resize step */
    onResize?: (el: HTMLElement, data: ResizeData) => void;
    /** Callback fired when resize finishes */
    onResizeEnd?: (el: HTMLElement, data: ResizeEndData) => void;
}

export interface ResizableInstance {
    readonly element: HTMLElement;
    readonly isResizing: boolean;
    readonly isEnabled: boolean;
    getDimensions: () => { width: number; height: number };
    setDimensions: (width: number, height: number) => void;
    enable: () => void;
    disable: () => void;
    destroy: () => void;
}

const instanceRegistry = new WeakMap<HTMLElement, ResizableInstance>();

function normalizeHandle(handle: string): CanonicalHandle | null {
    switch (handle.toLowerCase()) {
        case 'nw':
        case 'top-left':
        case 'topleft':
            return 'nw';
        case 'ne':
        case 'top-right':
        case 'topright':
            return 'ne';
        case 'se':
        case 'bottom-right':
        case 'bottomright':
            return 'se';
        case 'sw':
        case 'bottom-left':
        case 'bottomleft':
            return 'sw';
        case 'n':
        case 'top':
            return 'n';
        case 's':
        case 'bottom':
            return 's';
        case 'e':
        case 'right':
            return 'e';
        case 'w':
        case 'left':
            return 'w';
        default:
            return null;
    }
}

function resolveHandles(handlesConfig?: ResizeHandle[] | 'corners' | 'edges' | 'all'): CanonicalHandle[] {
    if (!handlesConfig || handlesConfig === 'corners') {
        return ['nw', 'ne', 'se', 'sw'];
    }
    if (handlesConfig === 'edges') {
        return ['n', 's', 'e', 'w'];
    }
    if (handlesConfig === 'all') {
        return ['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'];
    }
    if (Array.isArray(handlesConfig)) {
        const result: CanonicalHandle[] = [];
        for (const h of handlesConfig) {
            const canonical = normalizeHandle(h);
            if (canonical && !result.includes(canonical)) {
                result.push(canonical);
            }
        }
        return result.length > 0 ? result : ['nw', 'ne', 'se', 'sw'];
    }
    return ['nw', 'ne', 'se', 'sw'];
}

/**
 * Initializes resizable behavior on a container, equipping it with interactive corner resize handles.
 *
 * @param targetOrOptions Container selector string, HTMLElement, or full options configuration.
 * @param extraOptions Optional additional configuration options.
 */
export function resizable(
    targetOrOptions: string | HTMLElement | ResizableOptions,
    extraOptions?: Partial<ResizableOptions>,
): ResizableInstance {
    let opts: ResizableOptions;
    if (typeof targetOrOptions === 'string') {
        opts = { selector: targetOrOptions, ...extraOptions };
    } else if (targetOrOptions instanceof HTMLElement) {
        opts = { target: targetOrOptions, ...extraOptions };
    } else {
        opts = { ...targetOrOptions, ...extraOptions };
    }

    let element: HTMLElement | null = null;
    if (opts.target instanceof HTMLElement) {
        element = opts.target;
    } else if (typeof opts.target === 'string') {
        element = getElement(opts.target);
    } else if (opts.selector) {
        element = getElement(opts.selector);
    }

    if (!element) {
        const identifier = opts.selector || (typeof opts.target === 'string' ? opts.target : 'element');
        console.warn(`Resizable behavior: Container "${identifier}" not found.`);
        return {
            element: null as unknown as HTMLElement,
            get isResizing() {
                return false;
            },
            get isEnabled() {
                return false;
            },
            getDimensions: () => ({ width: 0, height: 0 }),
            setDimensions: () => {},
            enable: () => {},
            disable: () => {},
            destroy: () => {},
        };
    }

    // Clean up any previously attached instance on the same element
    if (instanceRegistry.has(element)) {
        instanceRegistry.get(element)!.destroy();
    }

    let isEnabled = true;
    let isResizing = false;
    let activeHandle: CanonicalHandle | null = null;
    let activeHandleEl: HTMLElement | null = null;
    let activePointerId: number | null = null;

    let startWidth = 0;
    let startHeight = 0;
    let startPointerX = 0;
    let startPointerY = 0;
    let startTransform = { x: 0, y: 0 };
    let startLeft = 0;
    let startTop = 0;

    let currentMinWidth = 20;
    let currentMinHeight = 20;
    let currentMaxWidth = Infinity;
    let currentMaxHeight = Infinity;
    let targetAspectRatio: number | null = null;
    let activePositionMode: 'transform' | 'position' = 'transform';

    let lastWidth = 0;
    let lastHeight = 0;

    const snapX = Array.isArray(opts.snap) ? opts.snap[0] : (opts.snap || 0);
    const snapY = Array.isArray(opts.snap) ? opts.snap[1] : (opts.snap || 0);

    // Ensure containing block positioning context for absolute corner handles
    const computedInitial = window.getComputedStyle(element);
    const isStatic = !computedInitial.position || computedInitial.position === 'static';
    const originalPosition = element.style.position;
    if (isStatic) {
        element.style.position = 'relative';
    }

    element.classList.add('resizable-container');
    if (opts.handleTheme) {
        element.classList.add(`resizable-theme-${opts.handleTheme}`);
    }
    element.setAttribute('data-purity-resizable', 'true');

    // Helper to get CSS transform offset (matching Draggable)
    const getTransform = (): { x: number; y: number } => {
        const style = window.getComputedStyle(element);
        const transform = style.transform || element.style.transform;
        if (!transform || transform === 'none') return { x: 0, y: 0 };

        if (typeof DOMMatrix !== 'undefined') {
            try {
                const matrix = new DOMMatrix(transform);
                return { x: matrix.m41, y: matrix.m42 };
            } catch {}
        }

        const translateMatch = transform.match(/translate(?:3d)?\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px/);
        if (translateMatch) {
            return {
                x: parseFloat(translateMatch[1]) || 0,
                y: parseFloat(translateMatch[2]) || 0,
            };
        }

        const matrixMatch = transform.match(/^matrix\((?:[^,]+,){4}\s*([^,]+),\s*([^)]+)\)$/);
        if (matrixMatch) {
            return {
                x: parseFloat(matrixMatch[1]) || 0,
                y: parseFloat(matrixMatch[2]) || 0,
            };
        }

        return { x: 0, y: 0 };
    };

    const getConstrainContainer = (): HTMLElement | null => {
        if (!opts.constrainTo) return null;
        if (opts.constrainTo === 'window') return document.documentElement;
        if (opts.constrainTo === 'parent') return element.parentElement;
        if (opts.constrainTo instanceof HTMLElement) return opts.constrainTo;
        return getElement(opts.constrainTo) || (element.closest(opts.constrainTo) as HTMLElement | null);
    };

    // Initialize handles
    const handlesList = resolveHandles(opts.handles);
    const createdHandles: HTMLElement[] = [];
    const handlesMap = new Map<CanonicalHandle, HTMLElement>();
    const handleListeners = new Map<HTMLElement, (e: PointerEvent) => void>();

    for (const h of handlesList) {
        let handleEl = Array.from(element.children).find((child) =>
            child.classList.contains(`resize-handle-${h}`),
        ) as HTMLElement | undefined;

        let isInjected = false;
        if (!handleEl) {
            handleEl = document.createElement('div');
            handleEl.className = `resize-handle resize-handle-${h}`;
            if (['nw', 'ne', 'se', 'sw'].includes(h)) {
                handleEl.classList.add('resize-handle-corner');
            } else {
                handleEl.classList.add('resize-handle-edge');
            }
            if (opts.handleClass) {
                handleEl.classList.add(opts.handleClass);
            }
            handleEl.setAttribute('data-handle', h);
            handleEl.setAttribute('data-purity-injected', 'true');
            handleEl.setAttribute('role', 'separator');
            handleEl.setAttribute('aria-label', `Resize corner ${h}`);
            element.appendChild(handleEl);
            isInjected = true;
        }

        if (isInjected) {
            createdHandles.push(handleEl);
        }
        handlesMap.set(h, handleEl);

        const onPointerDown = (e: PointerEvent) => {
            if (!isEnabled || e.button !== 0) return;

            e.preventDefault();
            e.stopPropagation();

            activeHandle = h;
            activeHandleEl = e.currentTarget as HTMLElement;

            try {
                activeHandleEl.setPointerCapture(e.pointerId);
            } catch {}

            activePointerId = e.pointerId;
            isResizing = true;
            element.classList.add('is-resizing');
            activeHandleEl.classList.add('is-active');
            document.body.classList.add('is-resizing-active');

            // Synchronize cursor on document.body during drag
            const handleCursor = window.getComputedStyle(activeHandleEl).cursor;
            if (handleCursor) {
                document.body.style.cursor = handleCursor;
            }

            // Snapshot geometry
            const rect = element.getBoundingClientRect();
            startWidth = rect.width || parseFloat(element.style.width) || element.offsetWidth || 100;
            startHeight = rect.height || parseFloat(element.style.height) || element.offsetHeight || 100;
            startPointerX = e.clientX;
            startPointerY = e.clientY;

            const computed = window.getComputedStyle(element);
            startTransform = getTransform();
            startLeft = parseFloat(computed.left) || element.offsetLeft || 0;
            startTop = parseFloat(computed.top) || element.offsetTop || 0;

            currentMinWidth = opts.minWidth ?? (parseFloat(computed.minWidth) || 20);
            currentMinHeight = opts.minHeight ?? (parseFloat(computed.minHeight) || 20);
            currentMaxWidth = opts.maxWidth ?? (parseFloat(computed.maxWidth) || Infinity);
            currentMaxHeight = opts.maxHeight ?? (parseFloat(computed.maxHeight) || Infinity);

            if (opts.aspectRatio === true) {
                targetAspectRatio = startWidth / (startHeight || 1);
            } else if (typeof opts.aspectRatio === 'number' && opts.aspectRatio > 0) {
                targetAspectRatio = opts.aspectRatio;
            } else {
                targetAspectRatio = null;
            }

            if (opts.positionMode === 'transform') {
                activePositionMode = 'transform';
            } else if (opts.positionMode === 'position') {
                activePositionMode = 'position';
            } else {
                const hasTransform =
                    (element.style.transform && element.style.transform !== 'none') ||
                    startTransform.x !== 0 ||
                    startTransform.y !== 0;
                if (hasTransform) {
                    activePositionMode = 'transform';
                } else if (computed.position === 'absolute' || computed.position === 'fixed') {
                    activePositionMode = 'position';
                } else {
                    activePositionMode = 'transform';
                }
            }

            opts.onResizeStart?.(element, {
                width: startWidth,
                height: startHeight,
                handle: activeHandle,
                pointerX: startPointerX,
                pointerY: startPointerY,
            });

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
            window.addEventListener('pointercancel', onPointerUp);
        };

        handleEl.addEventListener('pointerdown', onPointerDown);
        handleListeners.set(handleEl, onPointerDown);
    }

    const onPointerMove = (e: PointerEvent) => {
        if (!isResizing || !activeHandle) return;

        let dx = e.clientX - startPointerX;
        let dy = e.clientY - startPointerY;

        if (snapX > 0) {
            dx = Math.round(dx / snapX) * snapX;
        }
        if (snapY > 0) {
            dy = Math.round(dy / snapY) * snapY;
        }

        let proposedWidth = startWidth;
        let proposedHeight = startHeight;
        let deltaPosX = 0;
        let deltaPosY = 0;

        switch (activeHandle) {
            case 'se':
                proposedWidth = startWidth + dx;
                proposedHeight = startHeight + dy;
                break;
            case 'sw':
                proposedWidth = startWidth - dx;
                proposedHeight = startHeight + dy;
                break;
            case 'ne':
                proposedWidth = startWidth + dx;
                proposedHeight = startHeight - dy;
                break;
            case 'nw':
                proposedWidth = startWidth - dx;
                proposedHeight = startHeight - dy;
                break;
            case 'e':
                proposedWidth = startWidth + dx;
                break;
            case 'w':
                proposedWidth = startWidth - dx;
                break;
            case 's':
                proposedHeight = startHeight + dy;
                break;
            case 'n':
                proposedHeight = startHeight - dy;
                break;
        }

        // Maintain aspect ratio if enabled
        if (targetAspectRatio !== null) {
            if (['nw', 'ne', 'se', 'sw'].includes(activeHandle)) {
                if (Math.abs(dx) >= Math.abs(dy)) {
                    proposedHeight = proposedWidth / targetAspectRatio;
                } else {
                    proposedWidth = proposedHeight * targetAspectRatio;
                }
            } else if (activeHandle === 'e' || activeHandle === 'w') {
                proposedHeight = proposedWidth / targetAspectRatio;
            } else if (activeHandle === 'n' || activeHandle === 's') {
                proposedWidth = proposedHeight * targetAspectRatio;
            }
        }

        // Clamp to min/max boundaries
        const finalWidth = Math.max(currentMinWidth, Math.min(currentMaxWidth, proposedWidth));
        const finalHeight = Math.max(currentMinHeight, Math.min(currentMaxHeight, proposedHeight));

        // Offset origin coordinates for handles pulling on top or left edges
        if (activeHandle === 'nw' || activeHandle === 'sw' || activeHandle === 'w') {
            deltaPosX = startWidth - finalWidth;
        }
        if (activeHandle === 'nw' || activeHandle === 'ne' || activeHandle === 'n') {
            deltaPosY = startHeight - finalHeight;
        }

        // Boundary constraint check
        const container = getConstrainContainer();
        if (container && container !== document.body) {
            const cRect = container.getBoundingClientRect();
            const elRect = element.getBoundingClientRect();
            if (elRect.left + deltaPosX < cRect.left) {
                deltaPosX = cRect.left - elRect.left;
            }
            if (elRect.top + deltaPosY < cRect.top) {
                deltaPosY = cRect.top - elRect.top;
            }
        }

        lastWidth = finalWidth;
        lastHeight = finalHeight;

        opts.onResize?.(element, {
            width: finalWidth,
            height: finalHeight,
            handle: activeHandle,
            deltaX: deltaPosX,
            deltaY: deltaPosY,
            pointerX: e.clientX,
            pointerY: e.clientY,
        });

        // Apply styles synchronously for zero-lag reactivity
        element.style.width = `${finalWidth}px`;
        element.style.height = `${finalHeight}px`;

        if (activePositionMode === 'transform') {
            const nextX = startTransform.x + deltaPosX;
            const nextY = startTransform.y + deltaPosY;
            element.style.transform = `translate3d(${nextX}px, ${nextY}px, 0px)`;
        } else if (activePositionMode === 'position') {
            element.style.left = `${startLeft + deltaPosX}px`;
            element.style.top = `${startTop + deltaPosY}px`;
        }
    };

    const onPointerUp = () => {
        if (!isResizing) return;

        if (activeHandleEl && activePointerId !== null) {
            try {
                if (activeHandleEl.hasPointerCapture(activePointerId)) {
                    activeHandleEl.releasePointerCapture(activePointerId);
                }
            } catch {}
        }

        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        element.classList.remove('is-resizing');
        document.body.classList.remove('is-resizing-active');
        document.body.style.cursor = '';
        if (activeHandleEl) {
            activeHandleEl.classList.remove('is-active');
        }

        const finishedHandle = activeHandle;
        isResizing = false;
        activeHandle = null;
        activeHandleEl = null;
        activePointerId = null;

        if (finishedHandle) {
            opts.onResizeEnd?.(element, {
                width: lastWidth || element.getBoundingClientRect().width || parseFloat(element.style.width) || 0,
                height: lastHeight || element.getBoundingClientRect().height || parseFloat(element.style.height) || 0,
                handle: finishedHandle,
            });
        }
    };

    const instance: ResizableInstance = {
        get element() {
            return element;
        },
        get isResizing() {
            return isResizing;
        },
        get isEnabled() {
            return isEnabled;
        },
        getDimensions: () => {
            const rect = element.getBoundingClientRect();
            if (rect.width > 0 || rect.height > 0) {
                return { width: rect.width, height: rect.height };
            }
            const computed = window.getComputedStyle(element);
            return {
                width: parseFloat(element.style.width) || parseFloat(computed.width) || 0,
                height: parseFloat(element.style.height) || parseFloat(computed.height) || 0,
            };
        },
        setDimensions: (width: number, height: number) => {
            const computed = window.getComputedStyle(element);
            const minW = opts.minWidth ?? (parseFloat(computed.minWidth) || 20);
            const minH = opts.minHeight ?? (parseFloat(computed.minHeight) || 20);
            const maxW = opts.maxWidth ?? (parseFloat(computed.maxWidth) || Infinity);
            const maxH = opts.maxHeight ?? (parseFloat(computed.maxHeight) || Infinity);
            const clampedW = Math.max(minW, Math.min(maxW, width));
            const clampedH = Math.max(minH, Math.min(maxH, height));
            element.style.width = `${clampedW}px`;
            element.style.height = `${clampedH}px`;
        },
        enable: () => {
            isEnabled = true;
            element.classList.remove('is-disabled');
            for (const h of handlesMap.values()) {
                h.style.pointerEvents = '';
                h.style.display = '';
            }
        },
        disable: () => {
            isEnabled = false;
            element.classList.add('is-disabled');
            for (const h of handlesMap.values()) {
                h.style.pointerEvents = 'none';
                h.style.display = 'none';
            }
        },
        destroy: () => {
            if (isResizing) {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                window.removeEventListener('pointercancel', onPointerUp);
                document.body.classList.remove('is-resizing-active');
                document.body.style.cursor = '';
                isResizing = false;
            }

            for (const [handleEl, listener] of handleListeners.entries()) {
                handleEl.removeEventListener('pointerdown', listener as EventListener);
            }
            handleListeners.clear();

            for (const h of createdHandles) {
                if (h.parentElement === element) {
                    h.remove();
                }
            }
            createdHandles.length = 0;
            handlesMap.clear();

            element.classList.remove(
                'resizable-container',
                'is-resizing',
                'is-disabled',
                'resizable-theme-modern',
                'resizable-theme-minimal',
                'resizable-theme-invisible',
            );
            if (opts.handleTheme) {
                element.classList.remove(`resizable-theme-${opts.handleTheme}`);
            }
            if (isStatic && originalPosition !== undefined) {
                element.style.position = originalPosition;
            }
            element.removeAttribute('data-purity-resizable');
            instanceRegistry.delete(element);
        },
    };

    instanceRegistry.set(element, instance);
    return instance;
}

/**
 * Initializes resizable behavior across multiple matching container elements.
 */
export function resizableAll(
    selectorOrElements: string | HTMLElement[] | NodeListOf<HTMLElement>,
    options?: Partial<ResizableOptions>,
): {
    instances: ResizableInstance[];
    destroy: () => void;
    enable: () => void;
    disable: () => void;
} {
    let elements: HTMLElement[] = [];
    if (typeof selectorOrElements === 'string') {
        elements = Array.from(document.querySelectorAll<HTMLElement>(selectorOrElements));
    } else if (Array.isArray(selectorOrElements)) {
        elements = selectorOrElements;
    } else if (selectorOrElements instanceof NodeList) {
        elements = Array.from(selectorOrElements) as HTMLElement[];
    }

    const instances = elements.map((el) => resizable(el, options));
    return {
        instances,
        destroy: () => instances.forEach((i) => i.destroy()),
        enable: () => instances.forEach((i) => i.enable()),
        disable: () => instances.forEach((i) => i.disable()),
    };
}

export { resizable as resize };
