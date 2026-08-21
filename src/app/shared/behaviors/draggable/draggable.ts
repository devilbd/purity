import { getElement } from '../../../../framework/core';
import './draggable.scss';
import { findDropTarget, type DroppableOptions } from '../droppable/droppable';

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

    let currentDropTarget: { element: HTMLElement; options: DroppableOptions } | null = null;
    let lastSnappedX = 0;
    let lastSnappedY = 0;
    let baseLeft = 0;
    let baseTop = 0;
    let containerRect: DOMRect | null = null;
    let elementWidth = 0;
    let elementHeight = 0;
    const container = options.constrainTo ? getElement(options.constrainTo) : null;
    let activeHandle: HTMLElement | null = null;
    let rafId: number | null = null;
    const DRAG_THRESHOLD = 3;

    // Helper to get current transform values
    const getTransform = () => {
        const style = window.getComputedStyle(element);
        const matrix = new DOMMatrix(style.transform);
        return { x: matrix.m41, y: matrix.m42 };
    };

    const ensureWithinBounds = () => {
        if (!container) return;

        const { x, y } = getTransform();
        const elementRect = element.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();

        // Calculate base offset (the position where translate(0,0) would place the element)
        const bLeft = elementRect.left - x;
        const bTop = elementRect.top - y;
        const eWidth = elementRect.width;
        const eHeight = elementRect.height;

        const minX = cRect.left - bLeft;
        const maxX = cRect.right - bLeft - eWidth;
        const minY = cRect.top - bTop;
        const maxY = cRect.bottom - bTop - eHeight;

        const nextX = Math.max(minX, Math.min(maxX, x));
        const nextY = Math.max(minY, Math.min(maxY, y));

        if (nextX !== x || nextY !== y) {
            element.style.transform = `translate3d(${nextX}px, ${nextY}px, 0px)`;
        }
    };

    const onResize = () => {
        if (!isDragging) ensureWithinBounds();
    };

    const onPointerDown = (e: PointerEvent) => {
        const target = e.target as HTMLElement;

        // Prevent drag on certain elements if needed (e.g., buttons, inputs)
        if (target.closest('button, input, textarea, a')) {
            return;
        }

        if (options.handle) {
            activeHandle = target.closest(options.handle) as HTMLElement;
            if (!activeHandle || !element.contains(activeHandle)) {
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
                lastSnappedX = currentX;
                lastSnappedY = currentY;

                const elementRect = element.getBoundingClientRect();
                baseLeft = elementRect.left - currentX;
                baseTop = elementRect.top - currentY;
                elementWidth = elementRect.width;
                elementHeight = elementRect.height;

                if (container) {
                    containerRect = container.getBoundingClientRect();
                }

                element.setPointerCapture(e.pointerId);
                element.classList.add('is-dragging');

                options.onDragStart?.(element);
            } else {
                return;
            }
        }

        let nextX = currentX + (e.clientX - startX);
        let nextY = currentY + (e.clientY - startY);

        if (container && containerRect) {
            const minX = containerRect.left - baseLeft;
            const maxX = containerRect.right - baseLeft - elementWidth;
            const minY = containerRect.top - baseTop;
            const maxY = containerRect.bottom - baseTop - elementHeight;

            nextX = Math.max(minX, Math.min(maxX, nextX));
            nextY = Math.max(minY, Math.min(maxY, nextY));
        }

        // Handle Droppable detection
        const dropTarget = findDropTarget(e.clientX, e.clientY, element);
        if (dropTarget !== currentDropTarget) {
            const hoverClass = currentDropTarget?.options.hoverClass || 'droppable-hover';

            if (currentDropTarget) {
                currentDropTarget.element.classList.remove(hoverClass);
                currentDropTarget.options.onLeave?.(element);
            }
            if (dropTarget) {
                dropTarget.element.classList.add(dropTarget.options.hoverClass || 'droppable-hover');
                dropTarget.options.onEnter?.(element);
            }
            currentDropTarget = dropTarget;
        }

        // Snap to center logic: only if currentDropTarget matches options.snapTo
        if (options.snapTo && currentDropTarget?.element.matches(options.snapTo)) {
            const targetRect = currentDropTarget.element.getBoundingClientRect();
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;

            nextX = targetCenterX - baseLeft - elementWidth / 2;
            nextY = targetCenterY - baseTop - elementHeight / 2;

            if (nextX !== lastSnappedX || nextY !== lastSnappedY) {
                lastSnappedX = nextX;
                lastSnappedY = nextY;
                element.classList.add('snap-hit');
            }
        } else {
            element.classList.remove('snap-hit');
        }

        options.onDragMove?.(element, nextX, nextY);

        // Schedule hardware-accelerated transform update
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

        options.onDragEnd?.(element);

        isDragging = false;
        if (element.hasPointerCapture(e.pointerId)) {
            element.releasePointerCapture(e.pointerId);
        }

        // Handle Drop
        if (currentDropTarget) {
            currentDropTarget.element.classList.remove(currentDropTarget.options.hoverClass || 'droppable-hover');
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
    window.addEventListener('resize', onResize);

    // Initial constraint check
    ensureWithinBounds();

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
            window.removeEventListener('resize', onResize);

            element.classList.remove('draggable-target', 'is-dragging', 'snap-hit');
        },
    };
}
