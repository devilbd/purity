import { Component, signal } from '@purity/core';
import './radial-context-menu.component.scss';

export interface MenuItem {
    name: string;
    image?: string; // Emoji, SVG icon URL, or text symbol
    children?: MenuItem[];
    data?: any;
    disabled?: boolean;
}

@Component({
    selector: 'radial-context-menu',
    templateUrl: './src/app/shared/components/radial-context-menu/radial-context-menu.component.html',
})
export class RadialContextMenuComponent {
    // Signals
    public itemsSource = signal<MenuItem[]>([]);
    public navigationStack = signal<MenuItem[]>([]);
    public isOpen = signal<boolean>(false);
    public coords = signal<{ x: number; y: number }>({ x: 0, y: 0 });
    public radius = signal<number>(150);
    public activeHoverItem = signal<MenuItem | null>(null);
    public selector = signal<string | null>(null);
    public enableBlur = signal<boolean>(true);

    // Callbacks
    public onSelectItem?: (item: MenuItem) => void;
    public onHover?: (item: MenuItem | null) => void;
    public onOpen?: () => void;
    public onClose?: () => void;
    public onNavigate?: (item: MenuItem | null, depth: number) => void;

    // Internal DOM Elements attached to document.body
    private menuEl: HTMLElement | null = null;
    private titlePopEl: HTMLElement | null = null;
    private centerBtnEl: HTMLButtonElement | null = null;
    private itemsContainerEl: HTMLElement | null = null;
    private _openedAt = 0;

    private _boundContextMenu?: (e: MouseEvent) => void;
    private _boundClick?: (e: MouseEvent) => void;
    private _boundKeydown?: (e: KeyboardEvent) => void;

    protected onInit(): void {
        this._boundContextMenu = (e: MouseEvent) => this.onDocumentContextMenu(e);
        this._boundClick = (e: MouseEvent) => this.onDocumentClick(e);
        this._boundKeydown = (e: KeyboardEvent) => this.onDocumentKeydown(e);

        this.createMenuDOM();
        document.addEventListener('contextmenu', this._boundContextMenu);
        document.addEventListener('click', this._boundClick);
        window.addEventListener('keydown', this._boundKeydown);
    }

    public onDestroy(): void {
        if (this._boundContextMenu) document.removeEventListener('contextmenu', this._boundContextMenu);
        if (this._boundClick) document.removeEventListener('click', this._boundClick);
        if (this._boundKeydown) window.removeEventListener('keydown', this._boundKeydown);

        if (this.menuEl && this.menuEl.parentNode) {
            this.menuEl.parentNode.removeChild(this.menuEl);
        }
        this.menuEl = null;
        this.titlePopEl = null;
        this.centerBtnEl = null;
        this.itemsContainerEl = null;
    }

    public disconnectedCallback(): void {
        this.onDestroy();
    }

    private createMenuDOM(): void {
        if (this.menuEl) return;

        const r = this.radius();
        this.menuEl = document.createElement('div');
        this.menuEl.className = 'radial-menu';
        if (this.enableBlur()) {
            this.menuEl.classList.add('blur-enabled');
        }
        this.menuEl.style.width = `${r * 2}px`;
        this.menuEl.style.height = `${r * 2}px`;
        this.menuEl.style.display = 'none';
        this.menuEl.setAttribute('role', 'menu');
        this.menuEl.setAttribute('aria-label', 'Radial Context Menu');

        // Title Pop (for hover preview)
        this.titlePopEl = document.createElement('div');
        this.titlePopEl.className = 'menu-title-pop';
        this.menuEl.appendChild(this.titlePopEl);

        // Center Button
        this.centerBtnEl = document.createElement('button');
        this.centerBtnEl.className = 'center-button';
        this.centerBtnEl.type = 'button';
        this.centerBtnEl.setAttribute('aria-label', 'Menu Center Action');
        this.centerBtnEl.innerHTML = '<span class="center-icon">×</span>';
        this.centerBtnEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.navigationStack().length > 0) {
                this.goBack();
            } else {
                this.close();
            }
        });
        this.menuEl.appendChild(this.centerBtnEl);

        document.body.appendChild(this.menuEl);
    }

    public get currentItems(): MenuItem[] {
        const stack = this.navigationStack();
        if (stack.length === 0) {
            return this.itemsSource();
        }
        return stack[stack.length - 1].children || [];
    }

    public get centerIcon(): string {
        return this.navigationStack().length > 0 ? '←' : '×';
    }

    public get centerTitle(): string {
        const hover = this.activeHoverItem();
        if (hover) {
            return hover.name;
        }
        const stack = this.navigationStack();
        if (stack.length > 0) {
            return stack[stack.length - 1].name;
        }
        return '';
    }

    private getPoint(deg: number, radiusPercent: number): { x: number; y: number } {
        const rad = (deg * Math.PI) / 180;
        return {
            x: 50 + radiusPercent * Math.cos(rad),
            y: 50 + radiusPercent * Math.sin(rad),
        };
    }

    // Public API
    public setItems(items: MenuItem[]): void {
        this.itemsSource.set(items);
        this.navigationStack.set([]);
        this.activeHoverItem.set(null);
        if (this.isOpen()) {
            this.renderSegments('in');
            this.updateCenterButton();
        }
    }

    public setSelector(selector: string | null): void {
        this.selector.set(selector);
    }

    public setBlur(enable: boolean): void {
        this.enableBlur.set(enable);
        if (this.menuEl) {
            if (enable) {
                this.menuEl.classList.add('blur-enabled');
            } else {
                this.menuEl.classList.remove('blur-enabled');
            }
        }
    }

    public open(x?: number, y?: number): void {
        if (!this.menuEl) {
            this.createMenuDOM();
        }
        if (!this.menuEl) return;

        const r = this.radius();
        const posX = x !== undefined ? x : window.innerWidth / 2;
        const posY = y !== undefined ? y : window.innerHeight / 2;

        // Viewport boundaries clamping so entire 300px circle stays visible
        const clampedX = Math.max(r + 12, Math.min(window.innerWidth - r - 12, posX));
        const clampedY = Math.max(r + 12, Math.min(window.innerHeight - r - 12, posY));

        this.coords.set({ x: clampedX, y: clampedY });
        this.navigationStack.set([]);
        this.activeHoverItem.set(null);
        this.isOpen.set(true);
        this._openedAt = Date.now();

        this.menuEl.style.left = `${clampedX - r}px`;
        this.menuEl.style.top = `${clampedY - r}px`;
        this.menuEl.style.width = `${r * 2}px`;
        this.menuEl.style.height = `${r * 2}px`;
        this.menuEl.style.display = 'block';

        if (this.enableBlur()) {
            this.menuEl.classList.add('blur-enabled');
        } else {
            this.menuEl.classList.remove('blur-enabled');
        }

        // Force browser layout reflow before triggering CSS opacity/transform transition
        void this.menuEl.offsetHeight;
        this.menuEl.classList.add('active');

        this.renderSegments('in');
        this.updateCenterButton();

        this.onOpen?.();
        this.emitEvent('menu-open', { x: clampedX, y: clampedY });
    }

    public close(): void {
        if (!this.menuEl) return;
        this.isOpen.set(false);
        this.activeHoverItem.set(null);
        this.menuEl.classList.remove('active');
        this.onClose?.();
        this.emitEvent('menu-close', {});

        setTimeout(() => {
            if (!this.isOpen() && this.menuEl && !this.menuEl.classList.contains('active')) {
                this.menuEl.style.display = 'none';
            }
        }, 300);
    }

    public navigateTo(item: MenuItem): void {
        if (item.children && item.children.length > 0) {
            this.navigationStack.update((stack) => [...stack, item]);
            this.activeHoverItem.set(null);
            this.renderSegments('in');
            this.updateCenterButton();
            this.onNavigate?.(item, this.navigationStack().length);
            this.emitEvent('menu-navigate', { item, depth: this.navigationStack().length });
        }
    }

    public goBack(): void {
        const stack = this.navigationStack();
        if (stack.length > 0) {
            this.navigationStack.update((s) => s.slice(0, -1));
            this.activeHoverItem.set(null);
            this.renderSegments('out');
            this.updateCenterButton();
            const current = this.navigationStack().length > 0
                ? this.navigationStack()[this.navigationStack().length - 1]
                : null;
            this.onNavigate?.(current, this.navigationStack().length);
            this.emitEvent('menu-back', { current, depth: this.navigationStack().length });
        } else {
            this.close();
        }
    }

    public updateCenterButton(): void {
        if (!this.centerBtnEl) return;
        const iconSpan = this.centerBtnEl.querySelector('.center-icon') as HTMLElement | null;

        if (iconSpan) {
            iconSpan.textContent = this.centerIcon;
            if (this.activeHoverItem()) {
                iconSpan.style.opacity = '0';
            } else {
                iconSpan.style.opacity = '1';
            }
        }

        if (this.titlePopEl) {
            const title = this.centerTitle;
            this.titlePopEl.textContent = title;
            if (this.activeHoverItem()) {
                this.titlePopEl.classList.add('visible');
            } else {
                this.titlePopEl.classList.remove('visible');
            }
        }
    }

    public renderSegments(direction: 'in' | 'out' = 'in'): void {
        if (!this.menuEl) return;

        const oldContainer = this.itemsContainerEl;
        const newContainer = document.createElement('div');
        newContainer.className = `items-container entering`;
        if (direction === 'out') {
            newContainer.className = `items-container exiting`;
        }

        const items = this.currentItems;
        const count = items.length;
        if (count > 0) {
            const angleWidth = 360 / count;
            items.forEach((item, index) => {
                const segment = this.createSegmentElement(item, index, angleWidth);
                newContainer.appendChild(segment);
            });
        }

        if (this.centerBtnEl) {
            this.menuEl.insertBefore(newContainer, this.centerBtnEl);
        } else {
            this.menuEl.appendChild(newContainer);
        }

        this.itemsContainerEl = newContainer;

        requestAnimationFrame(() => {
            if (oldContainer) {
                oldContainer.classList.add(direction === 'in' ? 'exiting' : 'entering');
                oldContainer.classList.remove('active');
                setTimeout(() => {
                    if (oldContainer.parentNode) {
                        oldContainer.parentNode.removeChild(oldContainer);
                    }
                }, 400);
            }
            newContainer.classList.remove('entering', 'exiting');
            newContainer.classList.add('active');
        });
    }

    private createSegmentElement(item: MenuItem, index: number, angleWidth: number): HTMLElement {
        const startAngle = index * angleWidth - 90;
        const endAngle = (index + 1) * angleWidth - 90;
        const midAngle = startAngle + angleWidth / 2;

        const segment = document.createElement('div');
        segment.className = 'menu-segment';
        if (item.children && item.children.length > 0) {
            segment.classList.add('has-children');
        }
        segment.style.zIndex = `${index + 1}`;

        const innerDist = 26;
        const outerDist = 49.5;
        const step = 0.5;
        const points: { x: number; y: number }[] = [];

        for (let a = startAngle; a <= endAngle; a += step) {
            points.push(this.getPoint(a, outerDist));
        }
        points.push(this.getPoint(endAngle, outerDist));

        for (let a = endAngle; a >= startAngle; a -= step) {
            points.push(this.getPoint(a, innerDist));
        }
        points.push(this.getPoint(startAngle, innerDist));

        const clipPathStr = `polygon(${points.map((p) => `${p.x.toFixed(4)}% ${p.y.toFixed(4)}%`).join(', ')})`;
        segment.style.clipPath = clipPathStr;
        (segment.style as any).webkitClipPath = clipPathStr;

        const glass = document.createElement('div');
        glass.className = 'segment-glass';
        segment.appendChild(glass);

        const shine = document.createElement('div');
        shine.className = 'segment-shine';
        segment.appendChild(shine);

        const label = document.createElement('span');
        label.className = 'segment-label';
        const labelPos = this.getPoint(midAngle, 38.5);
        label.style.left = `${labelPos.x.toFixed(2)}%`;
        label.style.top = `${labelPos.y.toFixed(2)}%`;

        if (item.image && typeof item.image === 'string') {
            const raw = item.image.trim();
            if (raw.startsWith('<svg')) {
                label.innerHTML = raw;
            } else if (
                raw.endsWith('.svg') ||
                raw.startsWith('data:image/svg') ||
                raw.startsWith('/') ||
                raw.startsWith('./') ||
                raw.startsWith('http')
            ) {
                const img = document.createElement('img');
                img.src = raw;
                img.className = 'segment-icon';
                img.alt = item.name;
                label.appendChild(img);
            } else {
                label.textContent = raw;
            }
        } else {
            label.textContent = item.name;
        }
        segment.appendChild(label);

        if (item.children && item.children.length > 0) {
            const indicator = document.createElement('div');
            indicator.className = 'submenu-indicator';
            const indicatorPos = this.getPoint(midAngle, 47.2);
            indicator.style.left = `${indicatorPos.x.toFixed(2)}%`;
            indicator.style.top = `${indicatorPos.y.toFixed(2)}%`;
            segment.appendChild(indicator);
        }

        segment.addEventListener('click', (e) => {
            e.stopPropagation();
            if (item.children && item.children.length > 0) {
                this.navigateTo(item);
            } else {
                this.onSelectItem?.(item);
                this.emitEvent('item-selected', { item });
                this.close();
            }
        });

        segment.addEventListener('mouseenter', () => {
            this.activeHoverItem.set(item);
            this.onHover?.(item);
            this.emitEvent('menu-hover', { item });
            this.updateCenterButton();
        });

        segment.addEventListener('mouseleave', () => {
            this.activeHoverItem.set(null);
            this.onHover?.(null);
            this.emitEvent('menu-hover', { item: null });
            this.updateCenterButton();
        });

        return segment;
    }

    private onDocumentContextMenu(e: MouseEvent): void {
        const targetSelector = this.selector();
        if (!targetSelector) return;

        const target = (e.target as HTMLElement)?.closest?.(targetSelector);
        if (!target) return;

        e.preventDefault();
        e.stopPropagation();

        this.open(e.clientX, e.clientY);
    }

    private onDocumentClick(e: MouseEvent): void {
        if (!this.isOpen()) return;

        // Prevent instant close if the click opened the menu in the same interaction
        if (Date.now() - this._openedAt < 150) return;

        if (this.menuEl) {
            const path = e.composedPath ? e.composedPath() : [];
            if (path.includes(this.menuEl)) return;

            const target = e.target as Node | null;
            if (target && typeof this.menuEl.contains === 'function' && this.menuEl.contains(target)) {
                return;
            }
        }

        this.close();
    }

    private onDocumentKeydown(e: KeyboardEvent): void {
        if (e.key === 'Escape' && this.isOpen()) {
            if (this.navigationStack().length > 0) {
                this.goBack();
            } else {
                this.close();
            }
        }
    }

    private emitEvent(name: string, detail: any): void {
        const host = this as unknown as HTMLElement;
        host?.dispatchEvent?.(
            new CustomEvent(name, {
                detail,
                bubbles: true,
                composed: true,
            }),
        );
    }
}
