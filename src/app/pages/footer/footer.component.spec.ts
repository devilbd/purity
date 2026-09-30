import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FooterComponent } from './footer.component';
import packageJson from '@package';

describe('FooterComponent', () => {
    let element: HTMLElement;
    let footerComponent: FooterComponent;

    beforeEach(() => {
        element = document.createElement('footer-component');
        document.body.appendChild(element);
        footerComponent = element as unknown as FooterComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    it('should instantiate component and initialize signals', () => {
        expect(footerComponent).toBeDefined();
        expect(footerComponent.currentYear()).toBe(new Date().getFullYear());
    });

    it('should read the version directly from package.json', () => {
        expect(packageJson.version).toBeDefined();
        expect(typeof packageJson.version).toBe('string');
        expect(footerComponent.version()).toBe(packageJson.version);
    });

    it('should render the version badge in the DOM matching package.json', () => {
        const versionBadge = element.querySelector('.version-badge');
        expect(versionBadge).not.toBeNull();
        expect(versionBadge?.textContent?.trim()).toBe(`v${packageJson.version}`);
    });
});
