import { Component, signal } from '../../../../framework/core';
import './custom.component.scss';

@Component({
    selector: 'custom-component',
    templateUrl: './src/app/shared/components/custom/custom.component.html',
})
export class CustomComponent {
    customProperty = signal<string | null>(null);

    get name(): string {
        return (this as any).getAttribute?.('name') || '';
    }

    onInput(element: HTMLInputElement) {
        this.customProperty.set(element.value);
    }

    onClear() {
        this.customProperty.set(null);
    }
}
