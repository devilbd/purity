import { Component, signal } from '@purity/core';
import './loader.component.scss';

@Component({
    selector: 'loader-component',
    templateUrl: './src/app/shared/components/loader/loader.component.html',
})
export class LoaderComponent {
    public isLoading = signal<boolean>(false);
    public message = signal<string>('Loading...');

    protected onInit(): void {
        (this as any)._component = this;
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
