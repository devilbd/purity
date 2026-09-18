import { Component, signal, effect } from '@purity/core';
import './switch-button.component.scss';

@Component({
    selector: 'switch-button',
    templateUrl: './switch-button.component.html',
})
export class SwitchButtonComponent {
    /** Reactive signal property for the switch state */
    public isOn = signal<boolean>(false);

    /** Alias pointing to the exact same signal instance for standard checkbox/switch convention */
    public checked = this.isOn;

    /** Reactive signal for disabled state */
    public disabled = signal<boolean>(false);

    private handleClick = (event: MouseEvent): void => {
        if (this.disabled()) return;
        const target = event.target as HTMLElement | null;
        if (target?.closest('a, button, input, textarea, select')) {
            return;
        }
        this.toggle();
    };

    private handleKeydown = (event: KeyboardEvent): void => {
        if (this.disabled()) return;
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this.toggle();
        }
    };

    protected onInit(): void {
        const host = this as unknown as HTMLElement;

        if (host && typeof host.getAttribute === 'function') {
            const checkedAttr = host.getAttribute('checked');
            const isOnAttr = host.getAttribute('is-on');
            const isInitialOn =
                (checkedAttr !== null && checkedAttr !== 'false' && checkedAttr !== 'null' && checkedAttr !== '0') ||
                (isOnAttr !== null && isOnAttr !== 'false' && isOnAttr !== 'null' && isOnAttr !== '0');
            if (isInitialOn) {
                this.isOn.set(true);
            }

            const disAttr = host.getAttribute('disabled');
            const isDis = disAttr !== null && disAttr !== 'false' && disAttr !== 'null' && disAttr !== '0';
            if (isDis) {
                this.disabled.set(true);
            }

            if (!host.hasAttribute('role')) {
                host.setAttribute('role', 'switch');
            }

            if (!host.hasAttribute('tabindex')) {
                host.setAttribute('tabindex', this.disabled() ? '-1' : '0');
            }

            host.addEventListener('click', this.handleClick);
            host.addEventListener('keydown', this.handleKeydown);
        }

        // Keep host classes and accessibility attributes synchronized with signals
        effect(() => {
            const on = this.isOn();
            const el = this as unknown as HTMLElement;
            if (el && el.classList) {
                el.classList.toggle('is-on', on);
                el.classList.toggle('is-checked', on);
                el.setAttribute('aria-checked', String(on));
            }
        });

        effect(() => {
            const dis = this.disabled();
            const el = this as unknown as HTMLElement;
            if (el && el.classList) {
                el.classList.toggle('is-disabled', dis);
                if (dis) {
                    el.setAttribute('aria-disabled', 'true');
                    el.setAttribute('tabindex', '-1');
                } else {
                    el.removeAttribute('aria-disabled');
                    el.setAttribute('tabindex', '0');
                }
            }
        });
    }

    protected onDestroy(): void {
        const host = this as unknown as HTMLElement;
        if (host && typeof host.removeEventListener === 'function') {
            host.removeEventListener('click', this.handleClick);
            host.removeEventListener('keydown', this.handleKeydown);
        }
    }

    /**
     * Turns the switch ON (state = true).
     */
    public switchOn(): void {
        if (this.disabled()) return;
        if (!this.isOn()) {
            this.isOn.set(true);
            this.dispatchChangeEvent();
        }
    }

    /**
     * Turns the switch OFF (state = false).
     */
    public switchOff(): void {
        if (this.disabled()) return;
        if (this.isOn()) {
            this.isOn.set(false);
            this.dispatchChangeEvent();
        }
    }

    /**
     * Toggles the switch between ON and OFF states.
     */
    public toggle(): void {
        if (this.disabled()) return;
        const next = !this.isOn();
        this.isOn.set(next);
        this.dispatchChangeEvent();
    }

    private dispatchChangeEvent(): void {
        const host = this as unknown as HTMLElement;
        if (host && typeof host.dispatchEvent === 'function') {
            host.dispatchEvent(
                new CustomEvent('change', {
                    detail: { checked: this.isOn(), isOn: this.isOn() },
                    bubbles: true,
                    composed: true,
                }),
            );
        }
    }
}
