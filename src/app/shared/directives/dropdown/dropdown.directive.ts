import { Directive, BaseDirective } from '@purity/core';
import './dropdown.directive.scss';

export interface DropdownSelectDetail {
    item: HTMLElement;
    value: string | null;
    label: string | null;
}

@Directive('dropdown')
export class DropdownDirective extends BaseDirective {
    public isOpen = false;
    private triggerEl: HTMLElement | null = null;
    private labelEl: HTMLElement | null = null;
    private bodyEl: HTMLElement | null = null;
    private boundDocClick?: (e: MouseEvent) => void;
    private boundKeydown?: (e: KeyboardEvent) => void;
    private boundTriggerClick?: (e: MouseEvent) => void;
    private boundBodyClick?: (e: MouseEvent) => void;
    private boundResize?: () => void;
    private boundScroll?: () => void;
    private isCustomTrigger = false;
    private openedAt = 0;

    public onInit(): void {
        const host = this.element;
        if (!host || host.hasAttribute('data-dropdown-ready')) return;
        host.setAttribute('data-dropdown-ready', 'true');
        host.classList.add('p-dropdown');

        this.setupDOM();
        this.bindEvents();
    }

    public onChanges(newValue: any): void {
        if (newValue !== undefined && newValue !== null && !this.isCustomTrigger && this.labelEl) {
            this.labelEl.textContent = String(newValue);
        }
    }

    public onDOMChange(recordOrEvent: MutationRecord | Event): void {
        if (!this.element) return;

        if (recordOrEvent instanceof MutationRecord) {
            if (recordOrEvent.attributeName === 'label' || recordOrEvent.attributeName === 'placeholder') {
                const newLabel = this.element.getAttribute('label') || this.element.getAttribute('placeholder');
                if (newLabel && this.labelEl && !this.isCustomTrigger) {
                    this.labelEl.textContent = newLabel;
                }
            } else if (recordOrEvent.attributeName === 'disabled') {
                const isDisabled = this.element.hasAttribute('disabled') && this.element.getAttribute('disabled') !== 'false';
                if (this.triggerEl) {
                    if (isDisabled) {
                        this.triggerEl.setAttribute('disabled', '');
                    } else {
                        this.triggerEl.removeAttribute('disabled');
                    }
                }
            } else if (recordOrEvent.attributeName === 'align') {
                if (this.isOpen) {
                    this.updatePosition();
                }
            }
        }
    }

    public open(): void {
        if (this.isOpen || this.isDisabled()) return;
        if (!this.bodyEl) return;

        // Ensure bodyEl is attached to document.body for top-level stacking context
        if (this.bodyEl.parentElement !== document.body) {
            document.body.appendChild(this.bodyEl);
        }

        this.openedAt = Date.now();
        this.isOpen = true;
        this.element.classList.add('dropdown-open', 'p-dropdown--open');

        if (this.triggerEl) {
            this.triggerEl.setAttribute('aria-expanded', 'true');
        }

        this.bodyEl.classList.add('is-open');
        this.updatePosition();
    }

    public close(): void {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.element.classList.remove('dropdown-open', 'p-dropdown--open');

        if (this.triggerEl) {
            this.triggerEl.setAttribute('aria-expanded', 'false');
        }

        if (this.bodyEl) {
            this.bodyEl.classList.remove('is-open');
        }
    }

    public toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    public setLabel(text: string): void {
        if (this.labelEl) {
            this.labelEl.textContent = text;
        }
    }

    public updatePosition(): void {
        if (!this.triggerEl || !this.bodyEl) return;

        const triggerRect = this.triggerEl.getBoundingClientRect();
        const bodyRect = this.bodyEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const bodyHeight = bodyRect.height || 220;
        const bodyWidth = bodyRect.width || triggerRect.width || 180;

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        const placementAttr = this.element.getAttribute('placement');
        let placeTop = false;

        if (placementAttr === 'top') {
            placeTop = true;
        } else if (placementAttr === 'bottom') {
            placeTop = false;
        } else {
            // Auto placement
            if (spaceBelow < 220 && spaceAbove > spaceBelow) {
                placeTop = true;
            }
        }

        this.bodyEl.classList.toggle('placement-top', placeTop);
        this.bodyEl.classList.toggle('placement-bottom', !placeTop);

        let top = placeTop
            ? triggerRect.top - bodyHeight - 6
            : triggerRect.bottom + 6;

        let left = triggerRect.left;
        const align = this.element.getAttribute('align');

        if (align === 'right' || left + bodyWidth > viewportWidth - 10) {
            left = Math.max(10, triggerRect.right - bodyWidth);
        }

        // Clamp to viewport boundaries
        if (top < 10) top = 10;
        if (top + bodyHeight > viewportHeight - 10) {
            top = Math.max(10, viewportHeight - bodyHeight - 10);
        }
        if (left < 10) left = 10;

        const minWidth = Math.max(triggerRect.width, 160);
        this.bodyEl.style.minWidth = `${minWidth}px`;
        this.bodyEl.style.top = `${Math.round(top)}px`;
        this.bodyEl.style.left = `${Math.round(left)}px`;
    }

    public onDestroy(): void {
        if (this.boundDocClick) {
            document.removeEventListener('pointerdown', this.boundDocClick);
        }
        if (this.boundKeydown) {
            window.removeEventListener('keydown', this.boundKeydown);
        }
        if (this.boundResize) {
            window.removeEventListener('resize', this.boundResize);
        }
        if (this.boundScroll) {
            window.removeEventListener('scroll', this.boundScroll, true);
        }

        if (this.triggerEl && this.boundTriggerClick) {
            this.triggerEl.removeEventListener('click', this.boundTriggerClick);
        }
        if (this.bodyEl && this.boundBodyClick) {
            this.bodyEl.removeEventListener('click', this.boundBodyClick);
        }

        if (this.bodyEl && this.bodyEl.parentElement) {
            this.bodyEl.parentElement.removeChild(this.bodyEl);
            this.bodyEl = null;
        }
    }

    private setupDOM(): void {
        const host = this.element;
        const initialChildren = Array.from(host.childNodes);

        // Check if user provided an explicit custom trigger (e.g. slot="trigger" or class="dropdown-trigger")
        let explicitTrigger: HTMLElement | null = null;
        for (const child of initialChildren) {
            if (child instanceof HTMLElement) {
                if (child.getAttribute('slot') === 'trigger' || child.classList.contains('dropdown-trigger')) {
                    explicitTrigger = child;
                    break;
                }
            }
        }

        if (explicitTrigger) {
            this.isCustomTrigger = true;
            this.triggerEl = explicitTrigger;
        } else {
            this.isCustomTrigger = false;
            const labelText = host.getAttribute('label') || host.getAttribute('placeholder') || 'Select option';

            const triggerBtn = document.createElement('button');
            triggerBtn.type = 'button';
            triggerBtn.className = 'dropdown-trigger';
            triggerBtn.setAttribute('aria-haspopup', 'true');
            triggerBtn.setAttribute('aria-expanded', 'false');

            if (this.isDisabled()) {
                triggerBtn.setAttribute('disabled', '');
            }

            const labelSpan = document.createElement('span');
            labelSpan.className = 'dropdown-label';
            labelSpan.textContent = labelText;

            const chevronSpan = document.createElement('span');
            chevronSpan.className = 'dropdown-chevron';
            chevronSpan.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

            triggerBtn.appendChild(labelSpan);
            triggerBtn.appendChild(chevronSpan);

            this.triggerEl = triggerBtn;
            this.labelEl = labelSpan;
        }

        // Create the glassmorphic body container
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'dropdown-body p-dropdown-body';
        bodyDiv.setAttribute('role', 'menu');
        bodyDiv.setAttribute('tabindex', '-1');

        // Move all content children (e.g. <ul>, <div>, etc.) into the body container
        for (const child of initialChildren) {
            if (child !== explicitTrigger) {
                bodyDiv.appendChild(child);
            }
        }

        // Clear host and attach trigger
        host.innerHTML = '';
        if (this.triggerEl) {
            host.appendChild(this.triggerEl);
        }

        // Prepend / attach body directly to document.body for global overlay layer
        document.body.appendChild(bodyDiv);
        this.bodyEl = bodyDiv;
    }

    private bindEvents(): void {
        const host = this.element;

        // 1. Trigger click toggle
        this.boundTriggerClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        };
        this.triggerEl?.addEventListener('click', this.boundTriggerClick);

        // 2. Body items click & selection
        this.boundBodyClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            const item = target.closest('li, a, button, .dropdown-item') as HTMLElement | null;
            if (!item || !this.bodyEl?.contains(item)) return;

            if (item.hasAttribute('disabled') || item.classList.contains('disabled') || item.getAttribute('aria-disabled') === 'true') {
                return;
            }

            const itemText = item.textContent?.trim() || '';
            const itemValue = item.getAttribute('data-value') ?? item.getAttribute('value') ?? itemText;

            // Auto-update trigger label if enabled (default: true for auto-generated triggers)
            const autoLabel = host.getAttribute('auto-label') !== 'false';
            if (autoLabel && !this.isCustomTrigger && this.labelEl && itemText) {
                this.labelEl.textContent = itemText;
            }

            // Update selected class
            this.bodyEl.querySelectorAll('li, a, button, .dropdown-item').forEach((el) => {
                el.classList.remove('is-selected', 'active');
            });
            item.classList.add('is-selected');

            // Dispatch standard 'change' and 'select' events
            const detail: DropdownSelectDetail = {
                item,
                value: itemValue,
                label: itemText,
            };

            host.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail }));
            host.dispatchEvent(new CustomEvent('select', { bubbles: true, composed: true, detail }));

            // Auto-close unless keep-open is specified
            const keepOpen = host.getAttribute('keep-open') === 'true' || item.hasAttribute('data-keep-open');
            if (!keepOpen) {
                this.close();
            }
        };
        this.bodyEl?.addEventListener('click', this.boundBodyClick);

        // 3. Document pointerdown click-outside
        this.boundDocClick = (e: MouseEvent) => {
            if (!this.isOpen) return;
            if (Date.now() - this.openedAt < 100) return;

            const path = e.composedPath ? e.composedPath() : [];
            const target = e.target as Node | null;

            if (host && (path.includes(host) || (target && host.contains(target)))) {
                return;
            }
            if (this.bodyEl && (path.includes(this.bodyEl) || (target && this.bodyEl.contains(target)))) {
                return;
            }

            this.close();
        };
        document.addEventListener('pointerdown', this.boundDocClick);

        // 4. Window resize & scroll positioning
        this.boundResize = () => {
            if (this.isOpen) {
                this.updatePosition();
            }
        };
        this.boundScroll = () => {
            if (this.isOpen) {
                this.updatePosition();
            }
        };
        window.addEventListener('resize', this.boundResize);
        window.addEventListener('scroll', this.boundScroll, true);

        // 5. Keyboard navigation & accessibility
        this.boundKeydown = (e: KeyboardEvent) => {
            if (!this.isOpen) {
                if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') && document.activeElement === this.triggerEl) {
                    e.preventDefault();
                    this.open();
                }
                return;
            }

            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
                this.triggerEl?.focus();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateItems(e.key === 'ArrowDown' ? 1 : -1);
            }
        };
        host.addEventListener('keydown', this.boundKeydown);
    }

    private navigateItems(direction: number): void {
        if (!this.bodyEl) return;
        const items = Array.from(
            this.bodyEl.querySelectorAll<HTMLElement>('li, a, button, .dropdown-item:not(.disabled):not([disabled])'),
        );
        if (items.length === 0) return;

        const currentIndex = items.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
        let nextIndex = currentIndex + direction;

        if (nextIndex < 0) nextIndex = items.length - 1;
        if (nextIndex >= items.length) nextIndex = 0;

        items[nextIndex]?.focus();
    }

    private isDisabled(): boolean {
        return this.element.hasAttribute('disabled') && this.element.getAttribute('disabled') !== 'false';
    }
}
