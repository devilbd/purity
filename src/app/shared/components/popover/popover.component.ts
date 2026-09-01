import { Component, Directive, BaseDirective, signal } from '@purity/core';
import './popover.component.scss';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
    selector: 'popover-component',
    templateUrl: './src/app/shared/components/popover/popover.component.html',
})
export class PopoverComponent {
    // Signals
    public isOpen = signal<boolean>(false);
    public targetFor = signal<string>('');
    public position = signal<PopoverPosition>('bottom');
    public effectivePosition = signal<PopoverPosition>('bottom');

    public offset = 8;
    public closeDelay = 120;

    private _portalEl: HTMLElement | null = null;
    private _targetEl: HTMLElement | null = null;
    private _closeTimer: any = null;
    private _boundOnTargetEnter = () => this.handleTargetEnter();
    private _boundOnTargetLeave = () => this.handleTargetLeave();
    private _boundOnPopoverEnter = () => this.handlePopoverEnter();
    private _boundOnPopoverLeave = () => this.handlePopoverLeave();
    private _boundOnWindowChange = () => {
        if (this.isOpen()) {
            this.updatePosition();
        }
    };

    protected onInit(): void {
        const host = this as unknown as HTMLElement;

        // 1. Read attribute bindings from host DOM element
        const targetAttr = host.getAttribute?.('target-for') || host.getAttribute?.('target');
        if (targetAttr) {
            const cleanTarget = targetAttr.replace(/^['"]|['"]$/g, '').trim();
            this.targetFor.set(cleanTarget);
        }

        const posAttr = host.getAttribute?.('position');
        if (posAttr) {
            const cleanPos = posAttr.replace(/^['"]|['"]$/g, '').trim() as PopoverPosition;
            if (['top', 'bottom', 'left', 'right'].includes(cleanPos)) {
                this.position.set(cleanPos);
                this.effectivePosition.set(cleanPos);
            }
        }

        const offsetAttr = host.getAttribute?.('offset');
        if (offsetAttr) {
            const parsed = parseInt(offsetAttr, 10);
            if (!isNaN(parsed)) this.offset = parsed;
        }

        // 2. Setup DOM portal & body teleportation
        this._portalEl = host.querySelector?.('.purity-popover-portal') as HTMLElement | null;
        if (this._portalEl && this._portalEl.parentElement !== document.body) {
            document.body.appendChild(this._portalEl);
        }

        if (this._portalEl) {
            this._portalEl.addEventListener('mouseenter', this._boundOnPopoverEnter);
            this._portalEl.addEventListener('mouseleave', this._boundOnPopoverLeave);
        }

        // 3. Attach listeners to target DOM element
        this.bindTargetListeners();

        // 4. Reposition on scroll and resize
        window.addEventListener('resize', this._boundOnWindowChange, { passive: true });
        window.addEventListener('scroll', this._boundOnWindowChange, { passive: true, capture: true });
    }

    public onDestroy(): void {
        this.clearCloseTimer();
        this.unbindTargetListeners();

        if (this._portalEl) {
            this._portalEl.removeEventListener('mouseenter', this._boundOnPopoverEnter);
            this._portalEl.removeEventListener('mouseleave', this._boundOnPopoverLeave);
            if (this._portalEl.parentElement === document.body) {
                this._portalEl.remove();
            }
        }
        this._portalEl = null;
        this._targetEl = null;

        window.removeEventListener('resize', this._boundOnWindowChange);
        window.removeEventListener('scroll', this._boundOnWindowChange, true);
    }

    public disconnectedCallback(): void {
        this.onDestroy();
    }

    public bindTargetListeners(): void {
        const selector = this.targetFor();
        if (!selector || typeof document === 'undefined') return;

        this.unbindTargetListeners();

        const target = document.querySelector(selector) as HTMLElement | null;
        if (target) {
            this._targetEl = target;
            target.addEventListener('mouseenter', this._boundOnTargetEnter);
            target.addEventListener('mouseleave', this._boundOnTargetLeave);
        }
    }

    public unbindTargetListeners(): void {
        if (this._targetEl) {
            this._targetEl.removeEventListener('mouseenter', this._boundOnTargetEnter);
            this._targetEl.removeEventListener('mouseleave', this._boundOnTargetLeave);
            this._targetEl = null;
        }
    }

    public setTargetFor(selector: string): void {
        this.targetFor.set(selector.replace(/^['"]|['"]$/g, '').trim());
        this.bindTargetListeners();
    }

    public setPosition(pos: PopoverPosition): void {
        if (['top', 'bottom', 'left', 'right'].includes(pos)) {
            this.position.set(pos);
            this.effectivePosition.set(pos);
            if (this.isOpen()) {
                this.updatePosition();
            }
        }
    }

    public open(customTarget?: HTMLElement | string): void {
        this.clearCloseTimer();

        if (customTarget) {
            if (typeof customTarget === 'string') {
                const el = document.querySelector(customTarget) as HTMLElement | null;
                if (el) this._targetEl = el;
            } else if (customTarget instanceof HTMLElement) {
                this._targetEl = customTarget;
            }
        }

        if (!this._targetEl && this.targetFor()) {
            this._targetEl = document.querySelector(this.targetFor()) as HTMLElement | null;
        }

        if (!this._portalEl) {
            const host = this as unknown as HTMLElement;
            this._portalEl = host?.querySelector?.('.purity-popover-portal') || document.querySelector('.purity-popover-portal');
            if (this._portalEl && this._portalEl.parentElement !== document.body) {
                document.body.appendChild(this._portalEl);
            }
        }

        this.isOpen.set(true);
        if (this._portalEl) {
            this._portalEl.classList.remove('is-closed');
            this._portalEl.classList.add('is-open');
        }

        requestAnimationFrame(() => {
            this.updatePosition();
        });
    }

    public close(): void {
        this.clearCloseTimer();
        this.isOpen.set(false);
        if (this._portalEl) {
            this._portalEl.classList.remove('is-open');
            this._portalEl.classList.add('is-closed');
        }
    }

    public toggle(customTarget?: HTMLElement | string): void {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open(customTarget);
        }
    }

    public updatePosition(): void {
        const portal = this._portalEl;
        const target = this._targetEl || (this.targetFor() ? (document.querySelector(this.targetFor()) as HTMLElement | null) : null);

        if (!portal || !target || typeof window === 'undefined') return;

        const targetRect = target.getBoundingClientRect();
        const popoverRect = portal.getBoundingClientRect();

        const popoverWidth = popoverRect.width || 200;
        const popoverHeight = popoverRect.height || 80;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 8;
        const offset = this.offset;

        let desiredPos = this.position();
        let top = 0;
        let left = 0;

        // Auto-flip if overflowing boundaries
        if (desiredPos === 'bottom') {
            const wouldOverflowBottom = targetRect.bottom + offset + popoverHeight > viewportHeight - margin;
            const canFitTop = targetRect.top - offset - popoverHeight >= margin;

            if (wouldOverflowBottom && canFitTop) {
                desiredPos = 'top';
            }
        } else if (desiredPos === 'top') {
            const wouldOverflowTop = targetRect.top - offset - popoverHeight < margin;
            const canFitBottom = targetRect.bottom + offset + popoverHeight <= viewportHeight - margin;

            if (wouldOverflowTop && canFitBottom) {
                desiredPos = 'bottom';
            }
        } else if (desiredPos === 'left') {
            const wouldOverflowLeft = targetRect.left - offset - popoverWidth < margin;
            const canFitRight = targetRect.right + offset + popoverWidth <= viewportWidth - margin;

            if (wouldOverflowLeft && canFitRight) {
                desiredPos = 'right';
            }
        } else if (desiredPos === 'right') {
            const wouldOverflowRight = targetRect.right + offset + popoverWidth > viewportWidth - margin;
            const canFitLeft = targetRect.left - offset - popoverWidth >= margin;

            if (wouldOverflowRight && canFitLeft) {
                desiredPos = 'left';
            }
        }

        // Coordinate calculations with boundary clamping
        if (desiredPos === 'bottom') {
            top = targetRect.bottom + offset;
            left = targetRect.left + (targetRect.width - popoverWidth) / 2;
        } else if (desiredPos === 'top') {
            top = targetRect.top - popoverHeight - offset;
            left = targetRect.left + (targetRect.width - popoverWidth) / 2;
        } else if (desiredPos === 'left') {
            top = targetRect.top + (targetRect.height - popoverHeight) / 2;
            left = targetRect.left - popoverWidth - offset;
        } else if (desiredPos === 'right') {
            top = targetRect.top + (targetRect.height - popoverHeight) / 2;
            left = targetRect.right + offset;
        }

        // Clamp inside window viewport
        left = Math.max(margin, Math.min(left, viewportWidth - popoverWidth - margin));
        top = Math.max(margin, Math.min(top, viewportHeight - popoverHeight - margin));

        portal.style.top = `${Math.round(top)}px`;
        portal.style.left = `${Math.round(left)}px`;

        portal.classList.remove('pos-top', 'pos-bottom', 'pos-left', 'pos-right');
        portal.classList.add(`pos-${desiredPos}`);

        this.effectivePosition.set(desiredPos);
    }

    public handleTargetEnter(): void {
        this.open();
    }

    public handleTargetLeave(): void {
        this.scheduleClose();
    }

    public handlePopoverEnter(): void {
        this.clearCloseTimer();
    }

    public handlePopoverLeave(): void {
        this.scheduleClose();
    }

    private scheduleClose(): void {
        this.clearCloseTimer();
        this._closeTimer = setTimeout(() => {
            this.close();
        }, this.closeDelay);
    }

    private clearCloseTimer(): void {
        if (this._closeTimer) {
            clearTimeout(this._closeTimer);
            this._closeTimer = null;
        }
    }
}

/**
 * Directive that enhances `<popover>` tags or `[popover]` elements to act as a PopoverComponent
 */
@Directive('popover')
export class PopoverDirective extends BaseDirective {
    private instance?: PopoverComponent;

    public onInit(): void {
        const host = this.element;
        if (!host || host.hasAttribute('data-popover-ready')) return;
        host.setAttribute('data-popover-ready', 'true');
        host.style.display = 'none';

        // Create the portal container inside document.body
        const portal = document.createElement('div');
        portal.className = 'purity-popover-portal is-closed pos-bottom';
        portal.innerHTML = `
            <div class="popover-arrow"></div>
            <div class="popover-surface"></div>
        `;
        const surface = portal.querySelector('.popover-surface')!;

        // Move child nodes from host to surface
        while (host.firstChild) {
            surface.appendChild(host.firstChild);
        }

        document.body.appendChild(portal);

        // Instantiate Popover controller
        const comp = new PopoverComponent();
        (comp as any)._portalEl = portal;

        const targetAttr = host.getAttribute('target-for') || host.getAttribute('target');
        if (targetAttr) {
            comp.setTargetFor(targetAttr);
        }

        const posAttr = host.getAttribute('position');
        if (posAttr) {
            comp.setPosition(posAttr.replace(/^['"]|['"]$/g, '') as PopoverPosition);
        }

        portal.addEventListener('mouseenter', () => comp.handlePopoverEnter());
        portal.addEventListener('mouseleave', () => comp.handlePopoverLeave());

        // Forward methods to host element for ViewChild compatibility
        (host as any).open = (target?: any) => comp.open(target);
        (host as any).close = () => comp.close();
        (host as any).toggle = (target?: any) => comp.toggle(target);
        (host as any).isOpen = () => comp.isOpen();
        (host as any).setPosition = (p: any) => comp.setPosition(p);
        (host as any).setTargetFor = (s: any) => comp.setTargetFor(s);
        (host as any).targetFor = comp.targetFor;
        (host as any).position = comp.position;
        (host as any).effectivePosition = comp.effectivePosition;

        this.instance = comp;
    }

    public onDestroy(): void {
        this.instance?.onDestroy();
    }
}
