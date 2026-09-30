import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IntroComponent } from './intro.component';
import { getIntroSampleSnippet, INTRO_SAMPLE_SNIPPETS } from './intro-sample-snippets';

describe('IntroComponent & Intro Sample Snippets', () => {
    let element: HTMLElement;
    let introComponent: IntroComponent;

    beforeEach(() => {
        element = document.createElement('intro-component');
        document.body.appendChild(element);
        introComponent = element as unknown as IntroComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    it('should mount intro-component in DOM', () => {
        expect(element).toBeDefined();
        expect(introComponent).toBeDefined();
    });

    it('should retrieve dropdown sample snippet correctly', () => {
        const snippet = getIntroSampleSnippet('dropdown');
        expect(snippet).toBeDefined();
        expect(snippet?.id).toBe('dropdown');
        expect(snippet?.title).toContain('Dropdown Directive');
        expect(snippet?.ts).toContain('@directives/dropdown/dropdown.directive');
        expect(snippet?.html).toContain('<dropdown');
        expect(snippet?.scss).toBeDefined();
    });

    it('should have dropdown registered in INTRO_SAMPLE_SNIPPETS', () => {
        expect(INTRO_SAMPLE_SNIPPETS['dropdown']).toBeDefined();
        expect(INTRO_SAMPLE_SNIPPETS['dropdown'].id).toBe('dropdown');
    });

    it('should dispatch custom event when onLoadSample is called without playground element', () => {
        let dispatchedDetail: any = null;
        const listener = (e: Event) => {
            dispatchedDetail = (e as CustomEvent).detail;
        };
        window.addEventListener('purity:load-playground-snippet', listener);

        introComponent.onLoadSample('dropdown');

        expect(dispatchedDetail).not.toBeNull();
        expect(dispatchedDetail.id).toBe('dropdown');
        window.removeEventListener('purity:load-playground-snippet', listener);
    });

    it('should call loadSnippet on playground-view if present', () => {
        const mockPlayground = document.createElement('playground-view') as any;
        mockPlayground.loadSnippet = vi.fn();
        document.body.appendChild(mockPlayground);

        try {
            introComponent.onLoadSample('dropdown');
            expect(mockPlayground.loadSnippet).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'dropdown' })
            );
        } finally {
            document.body.removeChild(mockPlayground);
        }
    });

    it('should handle onGoToPlayground and onTryIt without error', () => {
        expect(() => introComponent.onGoToPlayground()).not.toThrow();
        expect(() => introComponent.onTryIt()).not.toThrow();
    });

    it('should retrieve getting-started sample snippet correctly', () => {
        const snippet = getIntroSampleSnippet('getting-started');
        expect(snippet).toBeDefined();
        expect(snippet?.id).toBe('getting-started');
        expect(snippet?.title).toContain('Getting Started');
        expect(snippet?.ts).toContain('PlaygroundDemoComponent');
        expect(snippet?.html).toContain('Purity + Purity UI Setup');
        expect(snippet?.scss).toBeDefined();
    });

    it('should have getting-started registered in INTRO_SAMPLE_SNIPPETS', () => {
        expect(INTRO_SAMPLE_SNIPPETS['getting-started']).toBeDefined();
        expect(INTRO_SAMPLE_SNIPPETS['getting-started'].id).toBe('getting-started');
    });

    it('should call loadSnippet on playground-view when getting-started is loaded', () => {
        const mockPlayground = document.createElement('playground-view') as any;
        mockPlayground.loadSnippet = vi.fn();
        document.body.appendChild(mockPlayground);

        try {
            introComponent.onLoadSample('getting-started');
            expect(mockPlayground.loadSnippet).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'getting-started' })
            );
        } finally {
            document.body.removeChild(mockPlayground);
        }
    });

    it('should render Getting Started section and package overview in intro template', () => {
        const sectionTitle = element.querySelector('.intro-section-divider .section-title');
        expect(sectionTitle?.textContent).toContain('Getting Started');

        const pkgCards = element.querySelectorAll('.getting-started-pkg-grid .pkg-card');
        expect(pkgCards.length).toBe(2);

        const cardText = element.textContent;
        expect(cardText).toContain('purity-world');
        expect(cardText).toContain('purity-world-ui');
        expect(cardText).toContain('Step 1: 📦 Install Purity & Purity UI Packages');
    });
});
