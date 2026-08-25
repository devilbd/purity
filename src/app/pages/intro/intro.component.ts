import { Component } from '@purity/core';
import './intro.component.scss';
import { getIntroSampleSnippet } from './intro-sample-snippets';
import type { PlaygroundComponent } from '@pages/playground/playground.component';

@Component({
    selector: 'intro-component',
    templateUrl: './src/app/pages/intro/intro.component.html',
})
export class IntroComponent {
    onGoToPlayground() {
        const playground = document.querySelector('playground-view');
        playground?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    onLoadSample(sampleId: string) {
        const snippet = getIntroSampleSnippet(sampleId);
        const playgroundEl = document.querySelector('playground-view') as (PlaygroundComponent & HTMLElement) | null;
        
        if (snippet && playgroundEl && typeof (playgroundEl as any).loadSnippet === 'function') {
            (playgroundEl as any).loadSnippet(snippet);
        } else if (snippet) {
            window.dispatchEvent(new CustomEvent('purity:load-playground-snippet', { detail: snippet }));
        }

        setTimeout(() => {
            const playground = document.querySelector('playground-view');
            playground?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
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
