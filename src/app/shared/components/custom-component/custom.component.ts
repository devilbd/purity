import {
    Component,
    defineComponent,
    effect,
    signal,
    updateTargets,
    updateValues,
} from '../../../../framework/core';
import './custom.component.scss';

export class CustomComponent extends Component {
    templateUrl =
        './src/app/shared/components/custom-component/custom.component.html';

    customProperty = signal<string | null>(null);
    input1!: HTMLInputElement;
    displaySpan!: HTMLElement;
    rootElement!: HTMLElement;
    clearBtn!: HTMLButtonElement;

    constructor() {
        super();
    }

    protected onInit() {
        this.domInitializer();

        effect(() => {
            updateValues([this.input1], this.customProperty());
            updateTargets([this.displaySpan], this.customProperty());
        });

        // Add event listeners to the current instance elements
        this.rootElement.addEventListener('click', (e) =>
            this.onCustomPropertyClicked(e),
        );
        this.clearBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering rootElement click
            this.onClear();
        });
    }

    domInitializer() {
        this.rootElement = this.querySelector(
            '.custom-component-root',
        ) as HTMLElement;
        this.clearBtn = this.querySelector('.clear-btn') as HTMLButtonElement;
        this.input1 = this.querySelector('.input1') as HTMLInputElement;
        this.displaySpan = this.querySelector(
            '#custom-property-display',
        ) as HTMLElement;
    }

    onCustomPropertyClicked(e: MouseEvent) {
        console.log('Custom component clicked:', this.customProperty(), e);
    }

    onClear() {
        this.customProperty.set(null);
    }
}

defineComponent('custom-component', CustomComponent);
