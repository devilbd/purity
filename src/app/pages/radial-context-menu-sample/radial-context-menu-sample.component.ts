import { Component, signal, ViewChild } from '@purity/core';
import type { RadialContextMenuComponent, MenuItem } from '@components/radial-context-menu/radial-context-menu.component';
import '@components/radial-context-menu/radial-context-menu.component';
import { logAnalyticsEvent } from '@data/firebase';
import { emojiMenuItems, svgMenuItems } from './main-menu-data';
import './radial-context-menu-sample.component.scss';

@Component({
    selector: 'radial-context-menu-sample',
    templateUrl: './src/app/pages/radial-context-menu-sample/radial-context-menu-sample.component.html',
})
export class RadialContextMenuSampleComponent {
    // 1. Emoji Representation State
    public emojiLastSelected = signal<string>('None (right-click or use trigger buttons)');
    public emojiHovered = signal<string>('None');
    public emojiMenuState = signal<string>('Closed');
    public emojiBlur = signal<boolean>(true);

    // 2. SVG Vector Representation State
    public svgLastSelected = signal<string>('None (right-click or use trigger buttons)');
    public svgHovered = signal<string>('None');
    public svgMenuState = signal<string>('Closed');
    public svgBlur = signal<boolean>(true);

    @ViewChild('#emoji-radial-menu')
    public emojiRadialMenu?: (RadialContextMenuComponent & HTMLElement) | null;

    @ViewChild('#svg-radial-menu')
    public svgRadialMenu?: (RadialContextMenuComponent & HTMLElement) | null;

    private getEmojiMenu(): (RadialContextMenuComponent & HTMLElement) | null {
        const host = this as unknown as HTMLElement;
        return (
            this.emojiRadialMenu ||
            (host.querySelector?.('#emoji-radial-menu') as any) ||
            (document.querySelector('#emoji-radial-menu') as any) ||
            null
        );
    }

    private getSvgMenu(): (RadialContextMenuComponent & HTMLElement) | null {
        const host = this as unknown as HTMLElement;
        return (
            this.svgRadialMenu ||
            (host.querySelector?.('#svg-radial-menu') as any) ||
            (document.querySelector('#svg-radial-menu') as any) ||
            null
        );
    }

    protected onInit(): void {
        (window as any).radialSample = this;

        setTimeout(() => {
            // 1. Initialize Emoji Menu Instance
            const emojiMenu = this.getEmojiMenu();
            if (emojiMenu) {
                emojiMenu.setItems(emojiMenuItems);
                emojiMenu.setSelector('.emoji-interactive-zone');
                emojiMenu.setBlur(this.emojiBlur());

                const handleEmojiSelect = (item: MenuItem) => {
                    const icon = item.image ? `${item.image} ` : '';
                    this.emojiLastSelected.set(`${icon}${item.name}`);
                    logAnalyticsEvent('radial_menu_select', { item: item.name, variant: 'emoji' });
                };

                const handleEmojiHover = (item: MenuItem | null) => {
                    this.emojiHovered.set(item ? `${item.image || ''} ${item.name}` : 'None');
                };

                const handleEmojiOpen = () => {
                    this.emojiMenuState.set('Active (Open)');
                    logAnalyticsEvent('radial_menu_open', { variant: 'emoji' });
                };

                const handleEmojiClose = () => {
                    this.emojiMenuState.set('Closed');
                    this.emojiHovered.set('None');
                };

                // Direct component callbacks
                emojiMenu.onSelectItem = handleEmojiSelect;
                emojiMenu.onHover = handleEmojiHover;
                emojiMenu.onOpen = handleEmojiOpen;
                emojiMenu.onClose = handleEmojiClose;

                // DOM Custom Events
                emojiMenu.addEventListener('item-selected', ((e: CustomEvent) => {
                    if (e.detail?.item) handleEmojiSelect(e.detail.item);
                }) as EventListener);
                emojiMenu.addEventListener('menu-hover', ((e: CustomEvent) => {
                    handleEmojiHover(e.detail?.item ?? null);
                }) as EventListener);
                emojiMenu.addEventListener('menu-open', handleEmojiOpen);
                emojiMenu.addEventListener('menu-close', handleEmojiClose);
            }

            // 2. Initialize SVG Vector Menu Instance
            const svgMenu = this.getSvgMenu();
            if (svgMenu) {
                svgMenu.setItems(svgMenuItems);
                svgMenu.setSelector('.svg-interactive-zone');
                svgMenu.setBlur(this.svgBlur());

                const handleSvgSelect = (item: MenuItem) => {
                    this.svgLastSelected.set(item.name);
                    logAnalyticsEvent('radial_menu_select', { item: item.name, variant: 'svg' });
                };

                const handleSvgHover = (item: MenuItem | null) => {
                    this.svgHovered.set(item ? item.name : 'None');
                };

                const handleSvgOpen = () => {
                    this.svgMenuState.set('Active (Open)');
                    logAnalyticsEvent('radial_menu_open', { variant: 'svg' });
                };

                const handleSvgClose = () => {
                    this.svgMenuState.set('Closed');
                    this.svgHovered.set('None');
                };

                // Direct component callbacks
                svgMenu.onSelectItem = handleSvgSelect;
                svgMenu.onHover = handleSvgHover;
                svgMenu.onOpen = handleSvgOpen;
                svgMenu.onClose = handleSvgClose;

                // DOM Custom Events
                svgMenu.addEventListener('item-selected', ((e: CustomEvent) => {
                    if (e.detail?.item) handleSvgSelect(e.detail.item);
                }) as EventListener);
                svgMenu.addEventListener('menu-hover', ((e: CustomEvent) => {
                    handleSvgHover(e.detail?.item ?? null);
                }) as EventListener);
                svgMenu.addEventListener('menu-open', handleSvgOpen);
                svgMenu.addEventListener('menu-close', handleSvgClose);
            }
        }, 0);
    }

    // Emoji Menu Actions
    public openEmojiMenu(event?: MouseEvent): void {
        event?.stopPropagation();
        const menu = this.getEmojiMenu();
        const zone = document.querySelector('.emoji-interactive-zone') as HTMLElement | null;
        if (zone) {
            const rect = zone.getBoundingClientRect();
            menu?.open(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else {
            menu?.open(window.innerWidth / 2, window.innerHeight / 2);
        }
    }

    public toggleEmojiBlur(event?: MouseEvent): void {
        event?.stopPropagation();
        this.emojiBlur.update((v) => !v);
        this.getEmojiMenu()?.setBlur(this.emojiBlur());
    }

    // SVG Vector Menu Actions
    public openSvgMenu(event?: MouseEvent): void {
        event?.stopPropagation();
        const menu = this.getSvgMenu();
        const zone = document.querySelector('.svg-interactive-zone') as HTMLElement | null;
        if (zone) {
            const rect = zone.getBoundingClientRect();
            menu?.open(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else {
            menu?.open(window.innerWidth / 2, window.innerHeight / 2);
        }
    }

    public toggleSvgBlur(event?: MouseEvent): void {
        event?.stopPropagation();
        this.svgBlur.update((v) => !v);
        this.getSvgMenu()?.setBlur(this.svgBlur());
    }
}
