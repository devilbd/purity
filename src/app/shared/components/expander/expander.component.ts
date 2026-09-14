import { Component, signal, effect, type Signal } from '@purity/core';
import './expander.component.scss';

@Component({
    selector: 'expander',
    templateUrl: './expander.component.html',
})
export class ExpanderComponent {
    /** Reactive signal tracking whether the expander body is open or closed */
    public isExpanded: Signal<boolean> = signal<boolean>(false);

    private hostEl: HTMLElement | null = null;
    private titleEl: HTMLElement | null = null;
    private cleanupEffect?: () => void;

    private handleTitleClick = (event: MouseEvent): void => {
        const target = event.target as HTMLElement | null;
        if (target?.closest('a, button, input, textarea, select')) {
            return;
        }
        this.toggle();
    };

    private handleTitleKeydown = (event: KeyboardEvent): void => {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this.toggle();
        }
    };

    /**
     * Initializes the expander behavior and DOM bindings on the given host element.
     */
    public initOnHost(host: HTMLElement): void {
        this.hostEl = host;

        if (
            host.hasAttribute('is-expanded') ||
            host.getAttribute('is-expanded') === 'true' ||
            host.hasAttribute('expanded') ||
            host.getAttribute('expanded') === 'true'
        ) {
            this.isExpanded.set(true);
        }

        this.titleEl = host.querySelector('.title') as HTMLElement | null;
        if (this.titleEl) {
            if (!this.titleEl.hasAttribute('role')) {
                this.titleEl.setAttribute('role', 'button');
            }
            if (!this.titleEl.hasAttribute('tabindex')) {
                this.titleEl.setAttribute('tabindex', '0');
            }
            this.titleEl.addEventListener('click', this.handleTitleClick);
            this.titleEl.addEventListener('keydown', this.handleTitleKeydown);
        }

        const bodyEl = host.querySelector('.body') as HTMLElement | null;
        if (bodyEl && !bodyEl.hasAttribute('role')) {
            bodyEl.setAttribute('role', 'region');
        }

        // Keep DOM classes, styles, and accessibility attributes reactively synchronized
        this.cleanupEffect = effect(() => {
            const expanded = this.isExpanded();
            host.classList.toggle('is-expanded', expanded);
            host.classList.toggle('is-collapsed', !expanded);
            host.setAttribute('aria-expanded', String(expanded));

            const currentBody = host.querySelector('.body') as HTMLElement | null;
            if (currentBody) {
                currentBody.style.display = expanded ? 'block' : 'none';
                currentBody.setAttribute('aria-hidden', String(!expanded));
                currentBody.classList.toggle('is-expanded', expanded);
                currentBody.classList.toggle('is-collapsed', !expanded);
            }

            const currentTitle = host.querySelector('.title') as HTMLElement | null;
            if (currentTitle) {
                currentTitle.setAttribute('aria-expanded', String(expanded));
            }
        });

        // Forward methods & signal to host DOM element for direct access and @ViewChild compatibility
        if (host !== (this as unknown as HTMLElement)) {
            (host as any).toggle = () => this.toggle();
            (host as any).expand = () => this.expand();
            (host as any).collapse = () => this.collapse();
            (host as any).isExpanded = this.isExpanded;
            (host as any).expandOrCollapseIcon = () => this.expandOrCollapseIcon();
        }
    }

    protected onInit(): void {
        const host = this as unknown as HTMLElement;
        if (host && typeof host.querySelector === 'function') {
            this.initOnHost(host);
        }
    }

    public destroy(): void {
        if (this.titleEl) {
            this.titleEl.removeEventListener('click', this.handleTitleClick);
            this.titleEl.removeEventListener('keydown', this.handleTitleKeydown);
            this.titleEl = null;
        }
        if (this.cleanupEffect) {
            this.cleanupEffect();
            this.cleanupEffect = undefined;
        }
        this.hostEl = null;
    }

    protected onDestroy(): void {
        this.destroy();
    }

    /**
     * Toggles the expander between expanded and collapsed states.
     */
    public toggle(): void {
        this.isExpanded.update((v) => !v);
        this.dispatchToggleEvent();
    }

    /**
     * Expands the expander body (shows content).
     */
    public expand(): void {
        if (!this.isExpanded()) {
            this.isExpanded.set(true);
            this.dispatchToggleEvent();
        }
    }

    /**
     * Collapses the expander body (hides content).
     */
    public collapse(): void {
        if (this.isExpanded()) {
            this.isExpanded.set(false);
            this.dispatchToggleEvent();
        }
    }

    /**
     * Helper returning standard icon classes based on expansion state.
     */
    public expandOrCollapseIcon(): string {
        return this.isExpanded() ? 'icon-collapse' : 'icon-expand';
    }

    private dispatchToggleEvent(): void {
        const target = this.hostEl || (this as unknown as HTMLElement);
        if (target && typeof target.dispatchEvent === 'function') {
            target.dispatchEvent(
                new CustomEvent('change', {
                    detail: { isExpanded: this.isExpanded() },
                    bubbles: true,
                    composed: true,
                }),
            );
        }
    }
}
