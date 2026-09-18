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

    private _hostEl?: HTMLElement | null;
    private _backdropEl?: HTMLElement | null;

    private keydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.isOpen()) {
            this.close();
        }
    };

    protected onInit() {
        window.addEventListener('keydown', this.keydownHandler);
        const host = this as unknown as HTMLElement;
        this._hostEl = host;

        if (host && typeof host.getAttribute === 'function') {
            const titleAttr = host.getAttribute('title');
            if (titleAttr) this.title.set(titleAttr);

            const isOpenAttr = host.getAttribute('is-open') || host.getAttribute('open');
            if (isOpenAttr !== null && isOpenAttr !== 'false' && isOpenAttr !== 'null' && isOpenAttr !== '0') {
                this.isOpen.set(true);
            }
        }

        const backdrop = host.querySelector('.modal-backdrop') as HTMLElement | null;
        if (backdrop && backdrop.parentElement !== document.body) {
            this._backdropEl = backdrop;
            document.body.appendChild(backdrop);
        }
    }

    protected onDestroy() {
        window.removeEventListener('keydown', this.keydownHandler);
        if (this._backdropEl && this._backdropEl.parentElement === document.body) {
            this._backdropEl.remove();
        }
    }

    disconnectedCallback() {
        this.onDestroy();
    }

    open(options?: { title?: string }) {
        if (options?.title) {
            this.title.set(options.title);
        }

        const host = (this._hostEl || this) as unknown as HTMLElement;
        const backdrop = (this._backdropEl || host?.querySelector?.('.modal-backdrop')) as HTMLElement | null;
        if (backdrop && backdrop.parentElement !== document.body) {
            this._backdropEl = backdrop;
            document.body.appendChild(backdrop);
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
