import {
    Component,
    signal,
    ViewChild,
} from '@purity/core';
import './app.component.scss';
import '@pages/intro/intro.component';
import '@pages/header/header.component';
import '@pages/playground/playground.component';
import '@pages/demo/demo.component';
import type { DemoComponent } from '@pages/demo/demo.component';
import type { PlaygroundComponent } from '@pages/playground/playground.component';

@Component({
    selector: 'app-component',
    templateUrl: './src/app/app.component.html',
})
export class AppComponent {
    showDemo = signal<boolean>(false);

    @ViewChild('#demo-window')
    demoComponent?: (DemoComponent & HTMLElement) | null;

    @ViewChild('#playground-window')
    playgroundComponent?: (PlaygroundComponent & HTMLElement) | null;

    get demoVisibilityClass(): string {
        return this.showDemo() ? 'demo-visible' : 'demo-hidden';
    }

    protected onInit() {
        (window as any).app = this;
    }

    onTryIt() {
        this.showDemo.set(true);
        setTimeout(() => {
            this.demoComponent?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }

    onGoToPlayground() {
        this.playgroundComponent?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    toggleDemo() {
        this.showDemo.update((v) => !v);
    }
}
