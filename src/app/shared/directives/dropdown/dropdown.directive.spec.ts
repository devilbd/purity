import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DropdownDirective } from './dropdown.directive';

describe('DropdownDirective', () => {
    let hostEl: HTMLElement;
    let directive: DropdownDirective;

    beforeEach(() => {
        hostEl = document.createElement('dropdown');
        hostEl.setAttribute('label', 'Options');
        hostEl.innerHTML = `
            <ul>
                <li data-value="opt1">Option 1</li>
                <li data-value="opt2">Option 2</li>
                <li class="disabled" data-value="opt3">Option 3 Disabled</li>
            </ul>
        `;
        document.body.appendChild(hostEl);

        directive = new DropdownDirective(hostEl);
        directive.onInit();
    });

    afterEach(() => {
        if (directive) {
            directive.destroy();
        }
        if (hostEl.parentNode) {
            hostEl.parentNode.removeChild(hostEl);
        }
        const strayBodies = document.querySelectorAll('.p-dropdown-body');
        strayBodies.forEach((b) => b.remove());
    });

    it('should initialize DOM structure with trigger and body', () => {
        expect(hostEl.classList.contains('p-dropdown')).toBe(true);
        expect(hostEl.hasAttribute('data-dropdown-ready')).toBe(true);

        const trigger = hostEl.querySelector('.dropdown-trigger') as HTMLButtonElement;
        expect(trigger).not.toBeNull();
        expect(trigger.querySelector('.dropdown-label')?.textContent).toBe('Options');

        const body = document.querySelector('.p-dropdown-body');
        expect(body).not.toBeNull();
        expect(body?.querySelectorAll('li').length).toBe(3);
    });

    it('should open and close the dropdown', () => {
        expect(directive.isOpen).toBe(false);

        directive.open();
        expect(directive.isOpen).toBe(true);
        expect(hostEl.classList.contains('dropdown-open')).toBe(true);

        const body = document.querySelector('.p-dropdown-body');
        expect(body?.classList.contains('is-open')).toBe(true);

        directive.close();
        expect(directive.isOpen).toBe(false);
        expect(hostEl.classList.contains('dropdown-open')).toBe(false);
        expect(body?.classList.contains('is-open')).toBe(false);
    });

    it('should toggle dropdown state on trigger click', () => {
        const trigger = hostEl.querySelector('.dropdown-trigger') as HTMLButtonElement;

        trigger.click();
        expect(directive.isOpen).toBe(true);

        trigger.click();
        expect(directive.isOpen).toBe(false);
    });

    it('should select item, dispatch events, update label, and close dropdown', () => {
        const selectSpy = vi.fn();
        const changeSpy = vi.fn();

        hostEl.addEventListener('select', (e: any) => selectSpy(e.detail));
        hostEl.addEventListener('change', (e: any) => changeSpy(e.detail));

        directive.open();

        const body = document.querySelector('.p-dropdown-body') as HTMLElement;
        const secondItem = body.querySelectorAll('li')[1];

        secondItem.click();

        expect(selectSpy).toHaveBeenCalled();
        const detail = selectSpy.mock.calls[0][0];
        expect(detail.value).toBe('opt2');
        expect(detail.label).toBe('Option 2');

        expect(changeSpy).toHaveBeenCalled();
        expect(secondItem.classList.contains('is-selected')).toBe(true);

        const label = hostEl.querySelector('.dropdown-label');
        expect(label?.textContent).toBe('Option 2');
        expect(directive.isOpen).toBe(false);
    });

    it('should ignore clicks on disabled items', () => {
        const selectSpy = vi.fn();
        hostEl.addEventListener('select', selectSpy);

        directive.open();

        const body = document.querySelector('.p-dropdown-body') as HTMLElement;
        const disabledItem = body.querySelectorAll('li')[2]; // class="disabled"

        disabledItem.click();

        expect(selectSpy).not.toHaveBeenCalled();
        expect(directive.isOpen).toBe(true);
    });

    it('should close on outside pointerdown', () => {
        directive.open();
        expect(directive.isOpen).toBe(true);

        // Simulate opened duration beyond 100ms threshold
        (directive as any).openedAt = Date.now() - 200;

        const outsideEl = document.createElement('div');
        document.body.appendChild(outsideEl);

        const pointerEvent = new MouseEvent('pointerdown', { bubbles: true });
        outsideEl.dispatchEvent(pointerEvent);

        expect(directive.isOpen).toBe(false);
        outsideEl.remove();
    });

    it('should close on Escape keydown', () => {
        directive.open();
        expect(directive.isOpen).toBe(true);

        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        hostEl.dispatchEvent(escapeEvent);

        expect(directive.isOpen).toBe(false);
    });

    it('should update label programmatically', () => {
        directive.setLabel('Custom Option');
        const label = hostEl.querySelector('.dropdown-label');
        expect(label?.textContent).toBe('Custom Option');
    });

    it('should prevent opening when disabled', () => {
        hostEl.setAttribute('disabled', '');
        directive.open();
        expect(directive.isOpen).toBe(false);
    });

    it('should clean up body element on destroy', () => {
        expect(document.querySelector('.p-dropdown-body')).not.toBeNull();

        directive.destroy();
        expect(document.querySelector('.p-dropdown-body')).toBeNull();
    });
});
