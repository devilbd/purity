import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SwitchButtonComponent } from './switch-button.component';

describe('SwitchButtonComponent', () => {
    let element: HTMLElement;
    let switchButton: SwitchButtonComponent;

    beforeEach(() => {
        element = document.createElement('switch-button');
        document.body.appendChild(element);
        switchButton = element as unknown as SwitchButtonComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    it('should initialize with default OFF state', () => {
        expect(switchButton.isOn()).toBe(false);
        expect(switchButton.checked()).toBe(false);
        expect(switchButton.disabled()).toBe(false);
        expect(element.getAttribute('role')).toBe('switch');
        expect(element.getAttribute('aria-checked')).toBe('false');
        expect(element.classList.contains('is-on')).toBe(false);
    });

    it('should turn ON when switchOn() is called', () => {
        const changeSpy = vi.fn();
        element.addEventListener('change', changeSpy);

        switchButton.switchOn();

        expect(switchButton.isOn()).toBe(true);
        expect(switchButton.checked()).toBe(true);
        expect(element.classList.contains('is-on')).toBe(true);
        expect(element.getAttribute('aria-checked')).toBe('true');
        expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('should not fire change event when switchOn() is called if already ON', () => {
        switchButton.switchOn();
        const changeSpy = vi.fn();
        element.addEventListener('change', changeSpy);

        switchButton.switchOn();

        expect(switchButton.isOn()).toBe(true);
        expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should turn OFF when switchOff() is called', () => {
        switchButton.switchOn();
        expect(switchButton.isOn()).toBe(true);

        const changeSpy = vi.fn();
        element.addEventListener('change', changeSpy);

        switchButton.switchOff();

        expect(switchButton.isOn()).toBe(false);
        expect(switchButton.checked()).toBe(false);
        expect(element.classList.contains('is-on')).toBe(false);
        expect(element.getAttribute('aria-checked')).toBe('false');
        expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('should toggle state alternately when toggle() is called', () => {
        expect(switchButton.isOn()).toBe(false);

        switchButton.toggle();
        expect(switchButton.isOn()).toBe(true);

        switchButton.toggle();
        expect(switchButton.isOn()).toBe(false);
    });

    it('should toggle when host element is clicked', () => {
        expect(switchButton.isOn()).toBe(false);

        element.click();
        expect(switchButton.isOn()).toBe(true);

        element.click();
        expect(switchButton.isOn()).toBe(false);
    });

    it('should toggle on Space and Enter keydown events', () => {
        expect(switchButton.isOn()).toBe(false);

        element.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
        expect(switchButton.isOn()).toBe(true);

        element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        expect(switchButton.isOn()).toBe(false);
    });

    it('should not toggle when disabled', () => {
        switchButton.disabled.set(true);

        switchButton.switchOn();
        expect(switchButton.isOn()).toBe(false);

        switchButton.toggle();
        expect(switchButton.isOn()).toBe(false);

        element.click();
        expect(switchButton.isOn()).toBe(false);
    });

    it('should respect initial checked attribute', () => {
        const preCheckedEl = document.createElement('switch-button');
        preCheckedEl.setAttribute('checked', '');
        document.body.appendChild(preCheckedEl);

        const comp = preCheckedEl as unknown as SwitchButtonComponent;
        expect(comp.isOn()).toBe(true);
        expect(comp.checked()).toBe(true);

        preCheckedEl.remove();
    });

    it('should project slotted label content', () => {
        const labeledEl = document.createElement('switch-button');
        labeledEl.innerHTML = 'I am switch button!';
        document.body.appendChild(labeledEl);

        const labelSpan = labeledEl.querySelector('.switch-label');
        expect(labelSpan).not.toBeNull();
        expect(labelSpan?.textContent?.trim()).toBe('I am switch button!');

        labeledEl.remove();
    });
});
