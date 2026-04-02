import {
    Component,
    defineComponent,
    effect,
    signal,
    updateTargets,
    updateValues,
    getElement,
} from '../../../../framework/core';
import './custom.component.scss';

export class CustomComponent extends Component {
    templateUrl = './src/app/shared/components/custom/custom.component.html';

    customProperty = signal<string | null>(null);
    input1!: HTMLInputElement;
    displaySpan!: HTMLElement;
    clearButton!: HTMLButtonElement;

    get name() {
        return this.getAttribute('name') || '';
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.domInitializer();

        effect(() => {
            updateValues([this.input1], this.customProperty());
            updateTargets([this.displaySpan], this.customProperty());
        });
    }

    domInitializer() {
        // edge case
        const rootEl = getElement(`[name="${this.name}"]`);
        this.input1 = rootEl?.querySelector('.input1') as HTMLInputElement;
        this.displaySpan = rootEl?.querySelector(
            '.custom-property-display',
        ) as HTMLElement;
        this.clearButton = rootEl?.querySelector(
            '.clear-button',
        ) as HTMLButtonElement;
        this.clearButton.addEventListener('click', () => this.onClear());
    }

    onClear() {
        this.customProperty.set(null);
    }
}

defineComponent('custom-component', CustomComponent);
