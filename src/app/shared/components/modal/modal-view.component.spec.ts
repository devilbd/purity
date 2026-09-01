import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ModalViewComponent } from './modal-view.component';

describe('ModalViewComponent', () => {
    let element: HTMLElement;
    let modal: ModalViewComponent;

    beforeEach(() => {
        element = document.createElement('modal-view');
        document.body.appendChild(element);
        modal = element as unknown as ModalViewComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        // Clean up any stray backdrop left in body
        const strayBackdrops = document.querySelectorAll('.modal-backdrop');
        strayBackdrops.forEach((b) => b.remove());
    });

    it('should initialize with default states', () => {
        expect(modal.isOpen()).toBe(false);
        expect(modal.isMaximized()).toBe(false);
        expect(modal.title()).toBe('Purity Modal Dialog');
    });

    it('should open modal with default title', () => {
        modal.open();
        expect(modal.isOpen()).toBe(true);
        expect(modal.title()).toBe('Purity Modal Dialog');
    });

    it('should open modal with custom title', () => {
        modal.open({ title: 'Confirmation Dialog' });
        expect(modal.isOpen()).toBe(true);
        expect(modal.title()).toBe('Confirmation Dialog');
    });

    it('should close modal', () => {
        modal.open();
        expect(modal.isOpen()).toBe(true);

        modal.close();
        expect(modal.isOpen()).toBe(false);
    });

    it('should toggle maximize state', () => {
        expect(modal.isMaximized()).toBe(false);

        modal.maximize();
        expect(modal.isMaximized()).toBe(true);

        modal.maximize();
        expect(modal.isMaximized()).toBe(false);
    });

    it('should close on Escape keydown when open', () => {
        modal.open();
        expect(modal.isOpen()).toBe(true);

        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(escapeEvent);

        expect(modal.isOpen()).toBe(false);
    });

    it('should ignore Escape keydown when already closed', () => {
        expect(modal.isOpen()).toBe(false);

        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(escapeEvent);

        expect(modal.isOpen()).toBe(false);
    });

    it('should ignore non-Escape keydown events', () => {
        modal.open();
        expect(modal.isOpen()).toBe(true);

        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(enterEvent);

        expect(modal.isOpen()).toBe(true);
    });

    it('should close when backdrop itself is clicked', () => {
        modal.open();
        expect(modal.isOpen()).toBe(true);

        const backdropEl = document.createElement('div');
        const mockEvent = {
            target: backdropEl,
            currentTarget: backdropEl,
        } as unknown as MouseEvent;

        modal.onBackdropClick(mockEvent);
        expect(modal.isOpen()).toBe(false);
    });

    it('should not close when backdrop child content is clicked', () => {
        modal.open();
        expect(modal.isOpen()).toBe(true);

        const backdropEl = document.createElement('div');
        const modalContentEl = document.createElement('div');
        const mockEvent = {
            target: modalContentEl,
            currentTarget: backdropEl,
        } as unknown as MouseEvent;

        modal.onBackdropClick(mockEvent);
        expect(modal.isOpen()).toBe(true);
    });

    it('should clean up backdrop and event listeners when disconnected', () => {
        modal.open();
        expect(modal.isOpen()).toBe(true);

        // Disconnecting element from DOM triggers disconnectedCallback & onDestroy
        element.remove();

        // Escape should no longer affect state after destroy
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        window.dispatchEvent(escapeEvent);

        // Backdrop should be removed from body
        const backdropInBody = document.querySelector('body > .modal-backdrop');
        expect(backdropInBody).toBeNull();
    });
});
