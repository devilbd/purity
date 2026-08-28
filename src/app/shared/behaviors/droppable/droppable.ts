import { getElement } from '@purity/core';
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
        return { destroy: () => {} };
    }

    const item = { element, options };
    droppables.add(item);

    return {
        destroy: () => {
            droppables.delete(item);
        },
    };
}

/**
 * Internal helper for Draggable to find valid targets at coordinates without forced layout recalculations.
 */
export function findDropTarget(x: number, y: number, draggedEl: HTMLElement) {
    for (const item of droppables) {
        if (!item.element || !item.element.isConnected || item.element === draggedEl) continue;
        const rect = item.element.getBoundingClientRect();
        if (
            x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
        ) {
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