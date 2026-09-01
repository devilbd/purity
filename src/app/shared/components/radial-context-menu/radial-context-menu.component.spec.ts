import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RadialContextMenuComponent, type MenuItem } from './radial-context-menu.component';

describe('RadialContextMenuComponent', () => {
    let element: HTMLElement;
    let menu: RadialContextMenuComponent;

    const mockItems: MenuItem[] = [
        {
            name: 'Item 1',
            image: '⚡',
            children: [
                { name: 'Sub Item 1.1', image: '🚀' },
                { name: 'Sub Item 1.2', image: '✨' },
            ],
        },
        { name: 'Item 2', image: '🔥' },
        { name: 'Item 3', image: '💎' },
    ];

    beforeEach(() => {
        element = document.createElement('radial-context-menu');
        document.body.appendChild(element);
        menu = element as unknown as RadialContextMenuComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        const menus = document.querySelectorAll('.radial-menu');
        menus.forEach((m) => m.remove());
    });

    it('should initialize with default states', () => {
        expect(menu.itemsSource()).toEqual([]);
        expect(menu.navigationStack()).toEqual([]);
        expect(menu.isOpen()).toBe(false);
        expect(menu.radius()).toBe(150);
        expect(menu.enableBlur()).toBe(true);
        expect(menu.selector()).toBeNull();
        expect(menu.activeHoverItem()).toBeNull();
    });

    it('should set items and return current items', () => {
        menu.setItems(mockItems);
        expect(menu.itemsSource()).toEqual(mockItems);
        expect(menu.currentItems).toEqual(mockItems);
    });

    it('should open and close the menu with callbacks and events', () => {
        const onOpenSpy = vi.fn();
        const onCloseSpy = vi.fn();
        const eventOpenSpy = vi.fn();
        const eventCloseSpy = vi.fn();

        menu.onOpen = onOpenSpy;
        menu.onClose = onCloseSpy;
        element.addEventListener('menu-open', eventOpenSpy);
        element.addEventListener('menu-close', eventCloseSpy);

        menu.setItems(mockItems);
        menu.open(400, 300);

        expect(menu.isOpen()).toBe(true);
        expect(onOpenSpy).toHaveBeenCalled();
        expect(eventOpenSpy).toHaveBeenCalled();

        menu.close();
        expect(menu.isOpen()).toBe(false);
        expect(onCloseSpy).toHaveBeenCalled();
        expect(eventCloseSpy).toHaveBeenCalled();
    });

    it('should clamp coordinates within viewport bounds', () => {
        // window.innerWidth and window.innerHeight in happy-dom default to 1024x768
        const r = menu.radius(); // 150
        menu.open(-50, -50);

        const coords = menu.coords();
        expect(coords.x).toBeGreaterThanOrEqual(r + 12);
        expect(coords.y).toBeGreaterThanOrEqual(r + 12);
    });

    it('should navigate into submenus and return child items', () => {
        const onNavigateSpy = vi.fn();
        const eventNavSpy = vi.fn();

        menu.onNavigate = onNavigateSpy;
        element.addEventListener('menu-navigate', eventNavSpy);

        menu.setItems(mockItems);
        menu.open(300, 300);

        const parentItem = mockItems[0];
        menu.navigateTo(parentItem);

        expect(menu.navigationStack().length).toBe(1);
        expect(menu.navigationStack()[0]).toBe(parentItem);
        expect(menu.currentItems).toEqual(parentItem.children);
        expect(menu.centerIcon).toBe('←');
        expect(menu.centerTitle).toBe('Item 1');
        expect(onNavigateSpy).toHaveBeenCalledWith(parentItem, 1);
        expect(eventNavSpy).toHaveBeenCalled();
    });

    it('should go back from submenu to parent level', () => {
        const onNavigateSpy = vi.fn();
        menu.onNavigate = onNavigateSpy;

        menu.setItems(mockItems);
        menu.open(300, 300);
        menu.navigateTo(mockItems[0]);

        expect(menu.navigationStack().length).toBe(1);

        menu.goBack();
        expect(menu.navigationStack().length).toBe(0);
        expect(menu.currentItems).toEqual(mockItems);
        expect(menu.centerIcon).toBe('×');
        expect(onNavigateSpy).toHaveBeenCalledWith(null, 0);
    });

    it('should close when goBack is called at root level', () => {
        menu.setItems(mockItems);
        menu.open(300, 300);
        expect(menu.isOpen()).toBe(true);

        menu.goBack();
        expect(menu.isOpen()).toBe(false);
    });

    it('should handle Escape key to navigate back or close', () => {
        menu.setItems(mockItems);
        menu.open(300, 300);
        menu.navigateTo(mockItems[0]);

        // Escape at submenu level -> navigates back
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(menu.navigationStack().length).toBe(0);
        expect(menu.isOpen()).toBe(true);

        // Escape at root level -> closes menu
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(menu.isOpen()).toBe(false);
    });

    it('should update center title on item hover', () => {
        menu.setItems(mockItems);
        menu.open(300, 300);

        menu.activeHoverItem.set(mockItems[1]);
        expect(menu.centerTitle).toBe('Item 2');

        menu.activeHoverItem.set(null);
        expect(menu.centerTitle).toBe('');
    });

    it('should toggle blur setting and update class', () => {
        menu.setBlur(false);
        expect(menu.enableBlur()).toBe(false);

        menu.setBlur(true);
        expect(menu.enableBlur()).toBe(true);
    });

    it('should open on contextmenu event when target matches selector', () => {
        const target = document.createElement('div');
        target.className = 'radial-trigger-area';
        document.body.appendChild(target);

        menu.setSelector('.radial-trigger-area');
        menu.setItems(mockItems);

        const contextMenuEvent = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            clientX: 250,
            clientY: 250,
        });

        target.dispatchEvent(contextMenuEvent);
        expect(menu.isOpen()).toBe(true);

        target.remove();
    });

    it('should clean up listeners and DOM elements on destroy', () => {
        menu.open(300, 300);
        expect(document.querySelector('.radial-menu')).not.toBeNull();

        element.remove();
        expect(document.querySelector('.radial-menu')).toBeNull();
    });
});
