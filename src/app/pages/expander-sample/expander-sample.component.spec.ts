import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExpanderSampleComponent } from './expander-sample.component';

describe('ExpanderSampleComponent', () => {
    let element: HTMLElement;
    let sampleComponent: ExpanderSampleComponent;

    beforeEach(() => {
        element = document.createElement('expander-sample');
        document.body.appendChild(element);
        sampleComponent = element as unknown as ExpanderSampleComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    it('should initialize and resolve basicExpander via @ViewChild', () => {
        expect(sampleComponent.basicExpander).toBeDefined();
        expect(sampleComponent.isBasicExpanded).toBe(false);
        expect(sampleComponent.lastAction()).toContain('Ready');
    });

    it('should expand basicExpander and update telemetry when expand() is called', () => {
        sampleComponent.expand();
        expect(sampleComponent.isBasicExpanded).toBe(true);
        expect(sampleComponent.basicExpander?.isExpanded()).toBe(true);
        expect(sampleComponent.lastAction()).toContain('expand() invoked via @ViewChild');
    });

    it('should collapse basicExpander and update telemetry when collapse() is called', () => {
        sampleComponent.expand();
        expect(sampleComponent.isBasicExpanded).toBe(true);

        sampleComponent.collapse();
        expect(sampleComponent.isBasicExpanded).toBe(false);
        expect(sampleComponent.basicExpander?.isExpanded()).toBe(false);
        expect(sampleComponent.lastAction()).toContain('collapse() invoked via @ViewChild');
    });

    it('should toggle basicExpander and update telemetry when toggle() is called', () => {
        expect(sampleComponent.isBasicExpanded).toBe(false);

        sampleComponent.toggle();
        expect(sampleComponent.isBasicExpanded).toBe(true);
        expect(sampleComponent.basicExpander?.isExpanded()).toBe(true);
        expect(sampleComponent.lastAction()).toContain('toggle() invoked via @ViewChild');

        sampleComponent.toggle();
        expect(sampleComponent.isBasicExpanded).toBe(false);
        expect(sampleComponent.basicExpander?.isExpanded()).toBe(false);
    });

    it('should handle icon expander state changes and return appropriate icon classes', () => {
        expect(sampleComponent.expandOrCollapseIcon()).toBe('icon-expand');

        sampleComponent.onIconExpanderChange(new CustomEvent('change', { detail: { isExpanded: true } }));
        expect(sampleComponent.isIconExpanded()).toBe(true);
        expect(sampleComponent.expandOrCollapseIcon()).toBe('icon-collapse');
        expect(sampleComponent.lastAction()).toContain('expanded');

        sampleComponent.onIconExpanderChange(new CustomEvent('change', { detail: { isExpanded: false } }));
        expect(sampleComponent.isIconExpanded()).toBe(false);
        expect(sampleComponent.expandOrCollapseIcon()).toBe('icon-expand');
        expect(sampleComponent.lastAction()).toContain('collapsed');
    });

    it('should react when an expander header is clicked directly and preserve body text', () => {
        const basicExpander = element.querySelector('#basic-expander') as HTMLElement;
        expect(basicExpander).not.toBeNull();

        const title = basicExpander.querySelector('.title') as HTMLElement;
        const body = basicExpander.querySelector('.body') as HTMLElement;

        expect(body.style.display).toBe('none');

        title.click();
        expect(body.style.display).toBe('block');
        expect(body.textContent?.trim()).toBe('Expander body.');

        title.click();
        expect(body.style.display).toBe('none');
    });
});
