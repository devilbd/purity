import { getElement } from '@purity/core';
import './draggable.scss';
import { findDropTarget, type DroppableOptions } from '@behaviors/droppable/droppable';

export interface DraggableOptions {
    selector: string;
    constrainTo?: string;
    handle?: string;
    snapTo?: string;
    onDragStart?: (el: HTMLElement) => void;
    onDragMove?: (el: HTMLElement, x: number, y: number) => void;
    onDragEnd?: (el: HTMLElement) => void;
}

export function drag(options: DraggableOptions) {
    const element = getElement(options.selector);
    if (!element) {
        console.warn(`Drag behavior: Element with selector "${options.selector}" not found.`);
        return { destroy: () => {} };
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let initialPointerX = 0;
    let initialPointerY = 0;

    // Invariant base geometry captured at drag start (immune to transform feedback loops)
    let baseLeft = 0;
    let baseTop = 0;
    let baseWidth = 0;
    let baseHeight = 0;
    let initialScrollX = 0;
    let initialScrollY = 0;

    let currentDropTarget: { element: HTMLElement; options: DroppableOptions } | null = null;
    let activeHandle: HTMLElement | null = null;
    let rafId: number | null = null;
    const DRAG_THRESHOLD = 3;

    // Helper to get current transform translation
    const getTransform = () => {
        const style = window.getComputedStyle(element);
        if (!style.transform || style.transform === 'none') return { x: 0, y: 0 };
        try {
            const matrix = new DOMMatrix(style.transform);
            return { x: matrix.m41, y: matrix.m42 };
        } catch {
            return { x: 0, y: 0 };
        }
    };

    const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return; // Only process main left-clicks

        const target = e.target as HTMLElement;

        // Prevent drag on interactive elements
        if (target.closest('button, input, textarea, a, select')) {
            return;
        }

        if (options.handle) {
            activeHandle = target.closest(options.handle) as HTMLElement | null;
            if (!activeHandle || (!element.contains(activeHandle) && activeHandle !== element)) {
                activeHandle = null;
                return;
            }
        } else {
            activeHandle = element;
        }

        initialPointerX = e.clientX;
        initialPointerY = e.clientY;

        const { x, y } = getTransform();
        currentX = x;
        currentY = y;
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!activeHandle && !isDragging) return;

        if (!isDragging) {
            const dx = Math.abs(e.clientX - initialPointerX);
            const dy = Math.abs(e.clientY - initialPointerY);

            if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
                isDragging = true;
                startX = initialPointerX;
                startY = initialPointerY;

                try {
                    element.setPointerCapture(e.pointerId);
                } catch {}

                element.classList.add('is-dragging');

                // Capture initial un-transformed layout geometry
                const elRect = element.getBoundingClientRect();
                baseLeft = elRect.left - currentX;
                baseTop = elRect.top - currentY;
                baseWidth = elRect.width;
                baseHeight = elRect.height;
                initialScrollX = window.scrollX;
                initialScrollY = window.scrollY;

                options.onDragStart?.(element);
            } else {
                return;
            }
        }

        // Compute mouse-driven translation
        let nextX = currentX + (e.clientX - startX);
        let nextY = currentY + (e.clientY - startY);

        // Account for any viewport scroll during the drag gesture
        const scrollDeltaX = window.scrollX - initialScrollX;
        const scrollDeltaY = window.scrollY - initialScrollY;
        const currentBaseLeft = baseLeft - scrollDeltaX;
        const currentBaseTop = baseTop - scrollDeltaY;

        // Handle Droppable target detection
        const dropTarget = findDropTarget(e.clientX, e.clientY, element);
        if (dropTarget !== currentDropTarget) {
            if (currentDropTarget) {
                const prevHover = currentDropTarget.options.hoverClass || 'droppable-hover';
                currentDropTarget.element.classList.remove(prevHover);
                currentDropTarget.options.onLeave?.(element);
            }
            if (dropTarget) {
                const newHover = dropTarget.options.hoverClass || 'droppable-hover';
                dropTarget.element.classList.add(newHover);
                dropTarget.options.onEnter?.(element);
            }
            currentDropTarget = dropTarget;
        }

        // Snap to drop target center (if current drop target matches snapTo selector)
        if (options.snapTo && currentDropTarget?.element.matches(options.snapTo)) {
            const targetRect = currentDropTarget.element.getBoundingClientRect();
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;

            const elementBaseCenterX = currentBaseLeft + baseWidth / 2;
            const elementBaseCenterY = currentBaseTop + baseHeight / 2;

            nextX = targetCenterX - elementBaseCenterX;
            nextY = targetCenterY - elementBaseCenterY;

            element.classList.add('snap-hit');
        } else {
            element.classList.remove('snap-hit');
        }

        // Container boundary constraints (if constrained to a container)
        const container = options.constrainTo
            ? (options.constrainTo === 'parent'
                ? element.parentElement
                : (getElement(options.constrainTo) || (element.closest(options.constrainTo) as HTMLElement | null)))
            : null;

        if (container && container !== document.body) {
            const cRect = container.getBoundingClientRect();
            const minX = cRect.left - currentBaseLeft;
            const maxX = cRect.right - (currentBaseLeft + baseWidth);
            const minY = cRect.top - currentBaseTop;
            const maxY = cRect.bottom - (currentBaseTop + baseHeight);

            if (minX <= maxX) {
                nextX = Math.max(minX, Math.min(maxX, nextX));
            }
            if (minY <= maxY) {
                nextY = Math.max(minY, Math.min(maxY, nextY));
            }
        }

        options.onDragMove?.(element, nextX, nextY);

        // Hardware-accelerated transform update via requestAnimationFrame
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            element.style.transform = `translate3d(${nextX}px, ${nextY}px, 0px)`;
            rafId = null;
        });
    };

    const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) {
            activeHandle = null;
            return;
        }

        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        options.onDragEnd?.(element);

        isDragging = false;
        if (element.hasPointerCapture(e.pointerId)) {
            try {
                element.releasePointerCapture(e.pointerId);
            } catch {}
        }

        // Handle Drop callback
        if (currentDropTarget) {
            const hoverClass = currentDropTarget.options.hoverClass || 'droppable-hover';
            currentDropTarget.element.classList.remove(hoverClass);
            currentDropTarget.options.onDrop?.(element);
            currentDropTarget = null;
        }

        element.classList.remove('is-dragging', 'snap-hit');
        activeHandle = null;
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);

    // Initial setup
    element.classList.add('draggable-target');

    return {
        destroy: () => {
            isDragging = false;
            if (rafId) cancelAnimationFrame(rafId);

            element.removeEventListener('pointerdown', onPointerDown);
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerup', onPointerUp);
            element.removeEventListener('pointercancel', onPointerUp);

            element.classList.remove('draggable-target', 'is-dragging', 'snap-hit');
        },
    };
}
