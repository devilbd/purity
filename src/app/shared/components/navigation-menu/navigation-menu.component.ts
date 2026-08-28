import { Component, signal, ViewChild } from '@purity/core';
import './navigation-menu.component.scss';
import '@components/radial-context-menu/radial-context-menu.component';
import type { RadialContextMenuComponent, MenuItem } from '@components/radial-context-menu/radial-context-menu.component';
import { drag } from '@behaviors/draggable/draggable';

@Component({
    selector: 'navigation-menu',
    templateUrl: './src/app/shared/components/navigation-menu/navigation-menu.component.html',
})
export class NavigationMenuComponent {
    public isOpen = signal<boolean>(false);

    @ViewChild('#nav-radial-menu')
    private radialMenu?: RadialContextMenuComponent | null;

    @ViewChild('#nav-ball')
    private navBallEl?: HTMLElement | null;

    private dragInstance?: { destroy: () => void } | null;
    private wasDragged = false;

    protected onInit(): void {
        this.initMenu();
        this.initDrag();
    }

    public onDestroy(): void {
        this.dragInstance?.destroy();
    }

    public disconnectedCallback(): void {
        this.onDestroy();
    }

    private initDrag(): void {
        // Pointer dragging with movement threshold to separate clicks from drags
        this.dragInstance = drag({
            selector: '#nav-ball',
            handle: '#nav-ball',
            onDragStart: () => {
                this.wasDragged = true;
                this.radialMenu?.close();
            },
            onDragEnd: () => {
                setTimeout(() => {
                    this.wasDragged = false;
                }, 100);
            },
        });
    }

    private initMenu(): void {
        const menuItems: MenuItem[] = [
            {
                name: 'Core',
                image: '⚡',
                children: [
                    { name: 'Signals & State', image: '🔄', data: { hash: '#component1' } },
                    { name: 'Signal Router', image: '🗺️', data: { hash: '#router-sample' } },
                    { name: 'Conditionals (if)', image: '🔀', data: { hash: '#if-sample' } },
                    { name: 'Array Repeater', image: '🔁', data: { hash: '#for-sample' } },
                    { name: 'Transform Pipes', image: '🏷️', data: { hash: '#pipe-sample' } },
                    { name: 'DOM Directives', image: '🎯', data: { hash: '#directive-sample' } },
                    { name: 'Form Validation', image: '📋', data: { hash: '#forms-validation' } },
                    { name: 'HTTP Client', image: '🌐', data: { hash: '#http-sample' } },
                    { name: 'Raw Template', image: '📄', data: { hash: '#raw-template' } },
                    { name: 'Drag & Drop', image: '🖐️', data: { hash: '#droppable-container' } },
                ],
            },
            {
                name: 'UI Components',
                image: '🧩',
                children: [
                    { name: 'Date Time Picker', image: '📅', data: { hash: '#date-time-picker-sample' } },
                    { name: 'Modal Dialog', image: '🪟', data: { hash: '#modal-sample' } },
                    { name: 'Toast Notify', image: '🔔', data: { hash: '#notification-sample' } },
                    { name: 'Radial Menu', image: '🔘', data: { hash: '#radial-context-menu-sample' } },
                    { name: 'Async Loader', image: '⏳', data: { hash: '#app-loader' } },
                ],
            },
            {
                name: 'Widgets',
                image: '⏱️',
                children: [
                    { name: 'Analogue Clock', image: '🕒', data: { hash: '#analogue-clock-sample' } },
                ],
            },
            {
                name: 'Playground',
                image: '🎮',
                data: { hash: '#playground-window' },
            },
            {
                name: 'Overview / Intro',
                image: '🏠',
                data: { hash: '.intro-component-root' },
            },
        ];

        // Configure radial context menu options
        if (this.radialMenu) {
            this.radialMenu.setItems(menuItems);
            this.radialMenu.radius.set(155);
            this.radialMenu.onSelectItem = (item: MenuItem) => this.handleNavigate(item);
            this.radialMenu.onOpen = () => this.isOpen.set(true);
            this.radialMenu.onClose = () => this.isOpen.set(false);
        } else {
            setTimeout(() => {
                if (this.radialMenu) {
                    this.radialMenu.setItems(menuItems);
                    this.radialMenu.radius.set(155);
                    this.radialMenu.onSelectItem = (item: MenuItem) => this.handleNavigate(item);
                    this.radialMenu.onOpen = () => this.isOpen.set(true);
                    this.radialMenu.onClose = () => this.isOpen.set(false);
                }
            }, 50);
        }
    }

    public onOrbClick(event: MouseEvent): void {
        event.stopPropagation();

        // Prevent opening menu if the user just completed a drag gesture
        if (this.wasDragged) {
            return;
        }

        if (!this.radialMenu) {
            return;
        }

        if (this.radialMenu.isOpen()) {
            this.radialMenu.close();
            return;
        }

        // Open radial menu centered at the navigation orb
        const trigger = (this.navBallEl || document.querySelector('#nav-ball')) as HTMLElement | null;
        let centerX = window.innerWidth - 60;
        let centerY = window.innerHeight - 60;

        if (trigger) {
            const rect = trigger.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
        }

        this.radialMenu.open(centerX, centerY);
    }

    public handleNavigate(item: MenuItem): void {
        const hash = item.data?.hash;
        if (!hash || typeof document === 'undefined') return;

        // Auto-expand demo container if target is inside Demo section
        const demoEl = document.querySelector('#demo-window') as HTMLElement | null;
        const targetInsideDemo = demoEl && demoEl.querySelector(hash);

        if (targetInsideDemo || hash.includes('sample') || hash.includes('component1') || hash.includes('forms') || hash.includes('droppable') || hash.includes('demo')) {
            if (demoEl) {
                demoEl.classList.remove('demo-hidden');
                demoEl.classList.add('demo-visible');
            }
        }

        // Update URL hashtag
        if (hash.startsWith('#')) {
            try {
                history.pushState(null, '', hash);
            } catch {
                window.location.hash = hash;
            }
        }

        // Smooth scroll to target element
        setTimeout(() => {
            const targetEl = document.querySelector(hash) as HTMLElement | null;
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Add GNOME flash highlight animation to the targeted section/card
                targetEl.classList.remove('p-nav-highlight');
                void targetEl.offsetHeight; // force reflow
                targetEl.classList.add('p-nav-highlight');
                setTimeout(() => {
                    targetEl.classList.remove('p-nav-highlight');
                }, 1900);
            }
        }, 120);
    }
}
