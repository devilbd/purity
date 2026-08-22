import { Component, signal } from '@purity/core';
import './modal-view.component.scss';

@Component({
    selector: 'modal-view',
    templateUrl: './src/app/shared/components/modal/modal-view.component.html',
})
export class ModalViewComponent {
    isOpen = signal<boolean>(false);
    isMaximized = signal<boolean>(false);
    title = signal<string>('Purity Modal Dialog');

    private keydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.isOpen()) {
            this.close();
        }
    };

    protected onInit() {
        (window as any).modal = this;

        // Always prepend to document.body so it sits above all other DOM elements
        document.body.prepend(this as any);
        
        window.addEventListener('keydown', this.keydownHandler);
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this.keydownHandler);
    }

    open(options?: { title?: string }) {
        if (options?.title) {
            this.title.set(options.title);
        }
        this.isOpen.set(true);

        const host = this as any as HTMLElement;
        const currentScrollY = window.scrollY || window.pageYOffset || 0;
        const dialog = host.querySelector?.('.modal-dialog') as HTMLElement | null;
        if (dialog) {
            dialog.style.marginTop = `${Math.max(40, currentScrollY + 60)}px`;
        }
    }

    close() {
        this.isOpen.set(false);
    }

    maximize() {
        this.isMaximized.update((val) => !val);
        const host = this as any as HTMLElement;
        const currentScrollY = window.scrollY || window.pageYOffset || 0;
        const dialog = host.querySelector?.('.modal-dialog') as HTMLElement | null;
        if (dialog) {
            if (this.isMaximized()) {
                dialog.style.marginTop = `${Math.max(20, currentScrollY + 20)}px`;
            } else {
                dialog.style.marginTop = `${Math.max(40, currentScrollY + 60)}px`;
            }
        }
    }

    onBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            this.close();
        }
    }
}
