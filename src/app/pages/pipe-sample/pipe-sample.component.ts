import { Component, signal } from '@purity/core';
import './pipe-sample.component.scss';
import '@pipes/transform-sample.pipe';
import '@pipes/uppercase.pipe';

@Component({
    selector: 'pipe-sample',
    templateUrl: './src/app/pages/pipe-sample/pipe-sample.component.html',
})
export class PipeSampleComponent {
    pipeValue = signal<string>('Purity Framework');
    isPipeUpper = signal<boolean>(true);

    onPipeInput(element: HTMLInputElement) {
        this.pipeValue.set(element.value);
    }

    onTogglePipeCase() {
        this.isPipeUpper.update((v) => !v);
    }
}
