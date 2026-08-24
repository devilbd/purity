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
    }

    close() {
        this.isOpen.set(false);
    }

    maximize() {
        this.isMaximized.update((val) => !val);
    }

    onBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            this.close();
        }
    }
}
