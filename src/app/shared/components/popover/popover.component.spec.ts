import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PopoverComponent } from './popover.component';

describe('PopoverComponent', () => {
    let popover: PopoverComponent;
    let targetEl: HTMLElement;

    beforeEach(() => {
        // Create target element in DOM
        targetEl = document.createElement('div');
        targetEl.id = 'dom-with-popover';
        targetEl.textContent = 'I have popover';
        document.body.appendChild(targetEl);

        popover = new PopoverComponent();
    });

    afterEach(() => {
        popover.onDestroy();
        targetEl.remove();
        document.querySelectorAll('.purity-popover-portal').forEach(el => el.remove());
    });

    it('should initialize with default values', () => {
        expect(popover.isOpen()).toBe(false);
        expect(popover.position()).toBe('bottom');
        expect(popover.effectivePosition()).toBe('bottom');
        expect(popover.offset).toBe(8);
    });

    it('should open and close popover programmatically', () => {
        popover.open(targetEl);
        expect(popover.isOpen()).toBe(true);

        popover.close();
        expect(popover.isOpen()).toBe(false);
    });

    it('should toggle popover open state', () => {
        popover.toggle(targetEl);
        expect(popover.isOpen()).toBe(true);

        popover.toggle(targetEl);
        expect(popover.isOpen()).toBe(false);
    });

    it('should bind to target element via targetFor selector', () => {
        popover.setTargetFor('#dom-with-popover');
        expect(popover.targetFor()).toBe('#dom-with-popover');

        // Trigger mouseenter on target
        targetEl.dispatchEvent(new MouseEvent('mouseenter'));
        expect(popover.isOpen()).toBe(true);
    });

    it('should schedule close on target mouseleave', () => {
        vi.useFakeTimers();
        popover.setTargetFor('#dom-with-popover');

        targetEl.dispatchEvent(new MouseEvent('mouseenter'));
        expect(popover.isOpen()).toBe(true);

        targetEl.dispatchEvent(new MouseEvent('mouseleave'));
        // Fast forward through close delay
        vi.advanceTimersByTime(200);
        expect(popover.isOpen()).toBe(false);
        vi.useRealTimers();
    });

    it('should update position and change direction settings', () => {
        popover.setPosition('top');
        expect(popover.position()).toBe('top');

        popover.setPosition('left');
        expect(popover.position()).toBe('left');

        popover.setPosition('right');
        expect(popover.position()).toBe('right');
    });

    it('should clean up listeners and portal element on destroy', () => {
        popover.setTargetFor('#dom-with-popover');
        popover.open(targetEl);

        popover.onDestroy();
        expect(document.querySelectorAll('.purity-popover-portal')).toHaveLength(0);
    });
});
