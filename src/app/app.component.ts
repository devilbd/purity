import {
    Component,
    signal,
    ViewChild,
} from '@purity/core';
import './app.component.scss';
import './shared/components/intro/intro.component';
import './shared/components/header/header.component';
import './shared/components/demo/demo.component';
import type { DemoComponent } from './shared/components/demo/demo.component';

@Component({
    selector: 'app-component',
    templateUrl: './src/app/app.component.html',
})
export class AppComponent {
    showDemo = signal<boolean>(false);

    @ViewChild('#demo-window')
    demoComponent?: (DemoComponent & HTMLElement) | null;

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

    toggleDemo() {
        this.showDemo.update((v) => !v);
    }
}
