import { getElement } from '../../../../framework/core';
import './droppable.scss';

export interface DroppableOptions {
    selector: string;
    accepts?: string;
    hoverClass?: string;
    onDrop?: (draggedEl: HTMLElement) => void;
    onEnter?: (draggedEl: HTMLElement) => void;
    onLeave?: (draggedEl: HTMLElement) => void;
}

const droppables = new Set<{ element: HTMLElement; options: DroppableOptions }>();

/**
 * Registers an element as a drop target.
 */
export function droppable(options: DroppableOptions) {
    const element = getElement(options.selector);
    if (!element) {
        console.warn(`Droppable behavior: Element "${options.selector}" not found.`);
        return;
    }

    droppables.add({ element, options });
}

/**
 * Internal helper for Draggable to find valid targets at coordinates.
 */
export function findDropTarget(x: number, y: number, draggedEl: HTMLElement) {
    // Temporarily disable pointer events on the dragged element to see what's underneath
    const originalPointerEvents = draggedEl.style.pointerEvents;
    draggedEl.style.pointerEvents = 'none';
    const targetAtPoint = document.elementFromPoint(x, y);
    draggedEl.style.pointerEvents = originalPointerEvents;

    if (!targetAtPoint) return null;

    for (const item of droppables) {
        if (item.element === targetAtPoint || item.element.contains(targetAtPoint)) {
            // Check if this target accepts the current element
            if (optionsMatch(item.options, draggedEl)) {
                return item;
            }
        }
    }
    return null;
}

function optionsMatch(options: DroppableOptions, draggedEl: HTMLElement): boolean {
    if (!options.accepts) return true;
    return draggedEl.matches(options.accepts);
}