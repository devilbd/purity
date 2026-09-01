import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HighlightDirective } from './highlight.directive';

describe('HighlightDirective', () => {
    let element: HTMLElement;
    let directive: HighlightDirective;

    beforeEach(() => {
        element = document.createElement('div');
        document.body.appendChild(element);
    });

    afterEach(() => {
        if (directive) {
            directive.destroy();
        }
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    it('should initialize with default blue highlight class', () => {
        directive = new HighlightDirective(element);
        directive.onInit();

        expect(element.classList.contains('p-highlight')).toBe(true);
        expect(element.classList.contains('p-highlight--blue')).toBe(true);
    });

    it('should initialize with provided color value', () => {
        directive = new HighlightDirective(element, 'gold');
        directive.onInit();

        expect(element.classList.contains('p-highlight')).toBe(true);
        expect(element.classList.contains('p-highlight--gold')).toBe(true);
    });

    it('should update modifier class when value changes', () => {
        directive = new HighlightDirective(element, 'blue');
        directive.onInit();

        expect(element.classList.contains('p-highlight--blue')).toBe(true);

        directive.onChanges('green');
        expect(element.classList.contains('p-highlight--blue')).toBe(false);
        expect(element.classList.contains('p-highlight--green')).toBe(true);

        directive.onChanges('red');
        expect(element.classList.contains('p-highlight--green')).toBe(false);
        expect(element.classList.contains('p-highlight--red')).toBe(true);
    });

    it('should handle full modifier class names passed to onChanges', () => {
        directive = new HighlightDirective(element);
        directive.onInit();

        directive.onChanges('p-highlight--gold');
        expect(element.classList.contains('p-highlight--gold')).toBe(true);
    });

    it('should toggle valid highlight class on input event based on length', () => {
        const inputEl = document.createElement('input');
        document.body.appendChild(inputEl);

        const inputDirective = new HighlightDirective(inputEl, 'blue');
        inputDirective.onInit();

        inputEl.value = 'abc';
        inputDirective.onDOMChange(new Event('input'));
        expect(inputEl.classList.contains('p-highlight--valid')).toBe(false);

        inputEl.value = 'abcdefgh';
        inputDirective.onDOMChange(new Event('input'));
        expect(inputEl.classList.contains('p-highlight--valid')).toBe(true);

        inputEl.value = 'short';
        inputDirective.onDOMChange(new Event('input'));
        expect(inputEl.classList.contains('p-highlight--valid')).toBe(false);

        inputDirective.destroy();
        inputEl.remove();
    });

    it('should handle attribute mutation records', () => {
        directive = new HighlightDirective(element, 'blue');
        directive.onInit();

        element.setAttribute('highlight', 'red');
        const mutationRecord = {
            attributeName: 'highlight',
        } as unknown as MutationRecord;

        directive.onDOMChange(mutationRecord);
        expect(element.classList.contains('p-highlight--red')).toBe(true);
    });

    it('should clean up classes on destroy', () => {
        directive = new HighlightDirective(element, 'green');
        directive.onInit();
        element.classList.add('p-highlight--valid');

        expect(element.classList.contains('p-highlight')).toBe(true);
        expect(element.classList.contains('p-highlight--green')).toBe(true);

        directive.destroy();

        expect(element.classList.contains('p-highlight')).toBe(false);
        expect(element.classList.contains('p-highlight--green')).toBe(false);
        expect(element.classList.contains('p-highlight--valid')).toBe(false);
    });
});
