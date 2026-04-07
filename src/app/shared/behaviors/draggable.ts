import { getElement } from '../../../framework/core';

export interface DragOptions {
    selector: string;
    constrainTo?: string;
    handle?: string;
    snapGrid?: number | { x?: number; y?: number };
}

export function drag(options: DragOptions) {
    const element = getElement(options.selector);
    if (!element) {
        console.warn(`Drag behavior: Element with selector "${options.selector}" not found.`);
        return;
    }

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    let baseLeft = 0;
    let baseTop = 0;
    let containerRect: DOMRect | null = null;
    let elementWidth = 0;
    let elementHeight = 0;
    const container = options.constrainTo ? getElement(options.constrainTo) : null;
    const handle = options.handle ? element.querySelector(options.handle) as HTMLElement : null;

    // Helper to get current transform values
    const getTransform = () => {
        const style = window.getComputedStyle(element);
        const matrix = new DOMMatrix(style.transform);
        return { x: matrix.m41, y: matrix.m42 };
    };

    const onPointerDown = (e: PointerEvent) => {
        const target = e.target as HTMLElement;

        // Prevent drag on certain elements if needed (e.g., buttons, inputs)
        if (target.closest('button, input, textarea, a')) {
            return;
        }

        if (handle && !handle.contains(target)) {
            return;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const { x, y } = getTransform();
        currentX = x;
        currentY = y;

        if (container) {
            containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            // Calculate position as if transform was (0,0) to determine valid translate bounds
            baseLeft = elementRect.left - currentX;
            baseTop = elementRect.top - currentY;
            elementWidth = elementRect.width;
            elementHeight = elementRect.height;
        }

        element.setPointerCapture(e.pointerId);
        
        // Add visual feedback
        (handle || element).style.cursor = 'grabbing';
        element.style.zIndex = '1000';
        element.style.transition = 'none'; // Disable transitions during drag
        element.style.userSelect = 'none';
        
        element.classList.add('is-dragging');
    };

    const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;

        let nextX = currentX + (e.clientX - startX);
        let nextY = currentY + (e.clientY - startY);

        if (options.snapGrid) {
            const snapX = typeof options.snapGrid === 'number' ? options.snapGrid : (options.snapGrid.x ?? 0);
            const snapY = typeof options.snapGrid === 'number' ? options.snapGrid : (options.snapGrid.y ?? 0);

            if (snapX > 0) nextX = Math.round(nextX / snapX) * snapX;
            if (snapY > 0) nextY = Math.round(nextY / snapY) * snapY;
        }

        if (container && containerRect) {
            const minX = containerRect.left - baseLeft;
            const maxX = containerRect.right - baseLeft - elementWidth;
            const minY = containerRect.top - baseTop;
            const maxY = containerRect.bottom - baseTop - elementHeight;

            nextX = Math.max(minX, Math.min(maxX, nextX));
            nextY = Math.max(minY, Math.min(maxY, nextY));
        }

        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
            element.style.transform = `translate(${nextX}px, ${nextY}px)`;
        });
    };

    const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        
        isDragging = false;
        element.releasePointerCapture(e.pointerId);

        // Reset visual feedback
        (handle || element).style.cursor = 'grab';
        element.classList.remove('is-dragging');
        element.style.userSelect = '';
    };

    (handle || element).addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);

    // Initial setup
    const cursorTarget = handle || element;
    if (!cursorTarget.style.cursor) {
        cursorTarget.style.cursor = 'grab';
    }
}
