import { Component, signal } from '@purity/core';
import './custom.component.scss';

@Component({
    selector: 'custom-component',
    templateUrl: './src/app/pages/custom/custom.component.html',
})
export class CustomComponent {
    customProperty = signal<string | null>(null);

    onInput(element: HTMLInputElement) {
        this.customProperty.set(element.value);
    }

    onClear() {
        this.customProperty.set(null);
    }
}
