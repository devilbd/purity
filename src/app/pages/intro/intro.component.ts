import { Component } from '@purity/core';
import './intro.component.scss';

@Component({
    selector: 'intro-component',
    templateUrl: './src/app/pages/intro/intro.component.html',
})
export class IntroComponent {
    onGoToPlayground() {
        const playground = document.querySelector('playground-view');
        playground?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    onTryIt() {
        const demo = document.querySelector('demo-component');
        if (demo) {
            demo.classList.remove('demo-hidden');
            demo.classList.add('demo-visible');
            setTimeout(() => {
                demo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }
    }
}
