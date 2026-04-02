import {
    Component,
    defineComponent,
    effect,
    signal,
    updateTargets,
    updateValues,
    getElements,
    getElement,
} from '../../../../framework/core';
import './custom.component.scss';

export class CustomComponent extends Component {
    templateUrl = './src/app/shared/components/custom/custom.component.html';

    customProperty = signal<string | null>(null);

    get name() {
        return this.getAttribute('name') || '';
    }

    elements: HTMLElement[] = [];

    constructor() {
        super();
    }

    protected onInit() {
        this.domInitializer();

        effect(() => {
            const propVal = this.customProperty();
            updateValues([this.elements[0]], propVal);
            updateTargets([this.elements[1]], propVal);
        });
    }

    domInitializer() {
        // edge case
        const rootEl = getElement(`[name="${this.name}"]`);
        this.elements = getElements(
            ['.input1', '.custom-property-display', '.clear-button'],
            rootEl!,
        );
        this.elements[2]?.addEventListener('click', () => {
            this.onClear();
        });
    }

    onClear() {
        this.customProperty.set(null);
    }
}

defineComponent('custom-component', CustomComponent);
