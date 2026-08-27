import { Component, signal, effect, startLoadingCursor, stopLoadingCursor } from '@purity/core';
import './loader.component.scss';

@Component({
    selector: 'loader-component',
    templateUrl: './src/app/shared/components/loader/loader.component.html',
})
export class LoaderComponent {
    public isLoading = signal<boolean>(false);
    public message = signal<string>('Loading...');

    private isHoldingCursor = false;

    protected onInit(): void {
        // Reactively observe loader state to manage host CSS classes and animated Breeze cursor
        effect(() => {
            const loading = this.isLoading();
            const host = (this as any).element as HTMLElement | null;
            if (host) {
                host.classList.toggle('is-loading', loading);
            }

            if (loading && !this.isHoldingCursor) {
                this.isHoldingCursor = true;
                startLoadingCursor();
            } else if (!loading && this.isHoldingCursor) {
                this.isHoldingCursor = false;
                stopLoadingCursor();
            }
        });
    }

    protected onDestroy(): void {
        if (this.isHoldingCursor) {
            this.isHoldingCursor = false;
            stopLoadingCursor();
        }
    }


    /**
     * Shows the loader with default 'Loading...' text or custom text.
     */
    public show(msg: string = 'Loading...'): void {
        this.message.set(msg || 'Loading...');
        this.isLoading.set(true);
    }

    /**
     * Hides the loader.
     */
    public hide(): void {
        this.isLoading.set(false);
    }

    /**
     * Toggles the loader visibility.
     */
    public toggle(visible?: boolean, msg: string = 'Loading...'): void {
        this.message.set(msg || 'Loading...');
        if (visible !== undefined) {
            this.isLoading.set(visible);
        } else {
            this.isLoading.update((v) => !v);
        }
    }
}
