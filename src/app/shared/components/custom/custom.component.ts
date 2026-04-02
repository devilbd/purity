import {
    Component,
    defineComponent,
    effect,
    signal,
    updateTargets,
    updateValues,
    getElements,
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
            updateValues([this.elements[1]], this.customProperty());
            updateTargets([this.elements[0]], this.customProperty());
        });
    }

    domInitializer() {
        // edge case
        // const rootEl = getElement(`[name="${this.name}"]`);
        this.elements = getElements(
            '.input1, .custom-property-display, .clear-button',
            this,
        );
    }

    onClear() {
        this.customProperty.set(null);
    }
}

defineComponent('custom-component', CustomComponent);
