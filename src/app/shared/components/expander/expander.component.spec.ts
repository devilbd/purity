import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExpanderComponent } from './expander.component';

describe('ExpanderComponent', () => {
    let host: HTMLElement;
    let titleEl: HTMLElement;
    let bodyEl: HTMLElement;

    beforeEach(() => {
        host = document.createElement('expander');
        host.innerHTML = `
            <div class="title">
                Expander title
            </div>
            <div class="body">
                Expander body.
            </div>
        `;
        document.body.appendChild(host);
        titleEl = host.querySelector('.title') as HTMLElement;
        bodyEl = host.querySelector('.body') as HTMLElement;
    });

    afterEach(() => {
        if (host.parentNode) {
            host.parentNode.removeChild(host);
        }
    });

    it('should initialize with default collapsed state', () => {
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        expect(comp.isExpanded()).toBe(false);
        expect(host.classList.contains('is-collapsed')).toBe(true);
        expect(host.classList.contains('is-expanded')).toBe(false);
        expect(host.getAttribute('aria-expanded')).toBe('false');
        expect(bodyEl.style.display).toBe('none');
        expect(bodyEl.getAttribute('aria-hidden')).toBe('true');
        expect(titleEl.getAttribute('role')).toBe('button');
        expect(titleEl.getAttribute('tabindex')).toBe('0');
        expect(comp.expandOrCollapseIcon()).toBe('icon-expand');
    });

    it('should expand when expand() is called', () => {
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        const changeSpy = vi.fn();
        host.addEventListener('change', changeSpy);

        comp.expand();

        expect(comp.isExpanded()).toBe(true);
        expect(host.classList.contains('is-expanded')).toBe(true);
        expect(host.classList.contains('is-collapsed')).toBe(false);
        expect(host.getAttribute('aria-expanded')).toBe('true');
        expect(bodyEl.style.display).toBe('block');
        expect(bodyEl.getAttribute('aria-hidden')).toBe('false');
        expect(comp.expandOrCollapseIcon()).toBe('icon-collapse');
        expect(changeSpy).toHaveBeenCalledTimes(1);
    });

    it('should collapse when collapse() is called', () => {
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        comp.expand();
        expect(comp.isExpanded()).toBe(true);

        comp.collapse();

        expect(comp.isExpanded()).toBe(false);
        expect(host.classList.contains('is-collapsed')).toBe(true);
        expect(bodyEl.style.display).toBe('none');
        expect(bodyEl.getAttribute('aria-hidden')).toBe('true');
        expect(comp.expandOrCollapseIcon()).toBe('icon-expand');
    });

    it('should toggle state when toggle() is called', () => {
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        expect(comp.isExpanded()).toBe(false);

        comp.toggle();
        expect(comp.isExpanded()).toBe(true);
        expect(bodyEl.style.display).toBe('block');

        comp.toggle();
        expect(comp.isExpanded()).toBe(false);
        expect(bodyEl.style.display).toBe('none');
    });

    it('should toggle when clicking on .title element', () => {
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        expect(comp.isExpanded()).toBe(false);

        titleEl.click();
        expect(comp.isExpanded()).toBe(true);
        expect(bodyEl.style.display).toBe('block');

        titleEl.click();
        expect(comp.isExpanded()).toBe(false);
        expect(bodyEl.style.display).toBe('none');
    });

    it('should not toggle when clicking a child button or link in .title', () => {
        titleEl.innerHTML = `<span>Title</span><button id="inner-btn">Action</button>`;
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        const btn = host.querySelector('#inner-btn') as HTMLButtonElement;
        btn.click();

        expect(comp.isExpanded()).toBe(false);
    });

    it('should toggle on Enter and Space keydown events', () => {
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
        titleEl.dispatchEvent(enterEvent);
        expect(comp.isExpanded()).toBe(true);

        const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
        titleEl.dispatchEvent(spaceEvent);
        expect(comp.isExpanded()).toBe(false);
    });

    it('should honor is-expanded and expanded attributes on host', () => {
        host.setAttribute('is-expanded', 'true');
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        expect(comp.isExpanded()).toBe(true);
        expect(bodyEl.style.display).toBe('block');
    });

    it('should forward methods and signals directly to the host element', () => {
        const comp = new ExpanderComponent();
        comp.initOnHost(host);

        const hostAny = host as any;
        expect(typeof hostAny.toggle).toBe('function');
        expect(typeof hostAny.expand).toBe('function');
        expect(typeof hostAny.collapse).toBe('function');
        expect(typeof hostAny.isExpanded).toBe('function');
        expect(typeof hostAny.expandOrCollapseIcon).toBe('function');

        hostAny.expand();
        expect(hostAny.isExpanded()).toBe(true);

        hostAny.collapse();
        expect(hostAny.isExpanded()).toBe(false);
    });

    it('should retain body text content when icon variant classes are applied', () => {
        const iconExpander = document.createElement('expander');
        iconExpander.innerHTML = `
            <div class="title">
                <img class="icon-collapse" />
                Expander title
            </div>
            <div class="body icon-collapse">
                Expander body text must be visible and not replaced by icon.
            </div>
        `;
        document.body.appendChild(iconExpander);

        const comp = new ExpanderComponent();
        comp.initOnHost(iconExpander);
        comp.expand();

        const body = iconExpander.querySelector('.body') as HTMLElement;
        expect(body.textContent?.trim()).toContain('Expander body text must be visible and not replaced by icon.');
        expect(body.style.display).toBe('block');

        document.body.removeChild(iconExpander);
    });
});
