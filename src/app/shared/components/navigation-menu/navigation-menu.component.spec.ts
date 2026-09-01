import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NavigationMenuComponent } from './navigation-menu.component';
import { ThemeService } from '@data/theme.service';
import { inject, container } from '@purity/core';

describe('NavigationMenuComponent', () => {
    let element: HTMLElement;
    let navMenu: NavigationMenuComponent;
    let themeService: ThemeService;

    beforeEach(() => {
        themeService = inject(ThemeService);
        themeService.setTheme('dark');

        element = document.createElement('navigation-menu');
        document.body.appendChild(element);
        navMenu = element as unknown as NavigationMenuComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        const radialMenus = document.querySelectorAll('.radial-menu');
        radialMenus.forEach((m) => m.remove());
        container.clear();
    });

    it('should initialize with default state', () => {
        expect(navMenu.isOpen()).toBe(false);
    });

    it('should toggle theme on navigation item with theme toggle', () => {
        expect(themeService.currentTheme()).toBe('dark');

        navMenu.handleNavigate({
            name: 'Toggle Theme',
            data: { theme: 'toggle' },
        });
        expect(themeService.currentTheme()).toBe('light');

        navMenu.handleNavigate({
            name: 'Toggle Theme',
            data: { theme: 'toggle' },
        });
        expect(themeService.currentTheme()).toBe('dark');
    });

    it('should set specific theme on navigation item with dark/light theme', () => {
        navMenu.handleNavigate({
            name: 'Light Theme',
            data: { theme: 'light' },
        });
        expect(themeService.currentTheme()).toBe('light');

        navMenu.handleNavigate({
            name: 'Dark Theme',
            data: { theme: 'dark' },
        });
        expect(themeService.currentTheme()).toBe('dark');
    });

    it('should handle hash navigation and auto-expand demo container', () => {
        const demoWindow = document.createElement('div');
        demoWindow.id = 'demo-window';
        demoWindow.className = 'demo-hidden';
        document.body.appendChild(demoWindow);

        const sampleTarget = document.createElement('div');
        sampleTarget.id = 'http-sample';
        demoWindow.appendChild(sampleTarget);

        navMenu.handleNavigate({
            name: 'HTTP Client',
            data: { hash: '#http-sample' },
        });

        expect(demoWindow.classList.contains('demo-visible')).toBe(true);
        expect(demoWindow.classList.contains('demo-hidden')).toBe(false);

        demoWindow.remove();
    });

    it('should handle onOrbClick without radial menu gracefully', () => {
        const mockEvent = {
            stopPropagation: vi.fn(),
        } as unknown as MouseEvent;

        expect(() => navMenu.onOrbClick(mockEvent)).not.toThrow();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should ignore onOrbClick if dragged', () => {
        (navMenu as any).wasDragged = true;
        const mockEvent = {
            stopPropagation: vi.fn(),
        } as unknown as MouseEvent;

        navMenu.onOrbClick(mockEvent);
        expect(navMenu.isOpen()).toBe(false);
    });

    it('should clean up drag instance on destroy', () => {
        const destroySpy = vi.fn();
        (navMenu as any).dragInstance = { destroy: destroySpy };

        navMenu.onDestroy();
        expect(destroySpy).toHaveBeenCalled();
    });
});
