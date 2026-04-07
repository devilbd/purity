import { getElement } from '../../../../framework/core';
import './draggable.scss';
import { findDropTarget, type DroppableOptions } from '../droppable/droppable';

export interface DraggableOptions {
    selector: string;
    constrainTo?: string;
    handle?: string;
    snapGrid?: number | { x?: number; y?: number };
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

        if (options.handle) {
            activeHandle = target.closest(options.handle) as HTMLElement;
            if (!activeHandle || !element.contains(activeHandle)) {
                return;
            }
        } else {
            activeHandle = element;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const { x, y } = getTransform();
        currentX = x;
        currentY = y;
        lastSnappedX = x;
        lastSnappedY = y;

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
        if (activeHandle) activeHandle.style.cursor = 'grabbing';
        element.style.zIndex = '1000';
        // Enable a snappy transition for snapping movement to smooth out the "jumps"
        element.style.transition = options.snapGrid 
            ? 'transform 0.15s cubic-bezier(0.2, 0.8, 0.4, 1.1)' 
            : 'none';
        element.style.userSelect = 'none';
        
        element.classList.add('is-dragging');

        options.onDragStart?.(element);
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

        // Visual feedback when a snap occurs
        if (options.snapGrid && (nextX !== lastSnappedX || nextY !== lastSnappedY)) {
            lastSnappedX = nextX;
            lastSnappedY = nextY;
            element.classList.remove('snap-hit');
            void element.offsetWidth; // Trigger reflow to restart animation
            element.classList.add('snap-hit');
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

        options.onDragMove?.(element, nextX, nextY);

        // Use requestAnimationFrame for smoother performance
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
            element.style.transform = `translate(${nextX}px, ${nextY}px)`;
        rafId = null;
        });
    };

    const onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        
        options.onDragEnd?.(element);

        isDragging = false;
        element.releasePointerCapture(e.pointerId);

        // Handle Drop
        if (currentDropTarget) {
            currentDropTarget.element.classList.remove(currentDropTarget.options.hoverClass || 'droppable-hover');
            currentDropTarget.options.onDrop?.(element);
            currentDropTarget = null;
        }

        // Reset visual feedback
        if (activeHandle) {
            activeHandle.style.cursor = 'grab';
        }
        element.classList.remove('is-dragging');
        element.classList.remove('snap-hit');
        element.style.userSelect = '';
        element.style.zIndex = '';
        element.style.transition = '';
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);

    // Initial setup
    if (options.handle) {
        element.querySelectorAll(options.handle).forEach(h => {
            (h as HTMLElement).style.cursor = 'grab';
        });
    } else {
        element.style.cursor = 'grab';
    }

    return {
        destroy: () => {
            isDragging = false;
            if (rafId) cancelAnimationFrame(rafId);

            element.removeEventListener('pointerdown', onPointerDown);
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerup', onPointerUp);
            element.removeEventListener('pointercancel', onPointerUp);

            element.classList.remove('is-dragging', 'snap-hit');
            element.style.cursor = '';
            element.style.userSelect = '';
            element.style.zIndex = '';
            element.style.transition = '';
            if (options.handle) {
                element.querySelectorAll(options.handle).forEach(h => {
                    (h as HTMLElement).style.cursor = '';
                });
            }
        }
    };
}
