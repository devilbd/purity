import {
    Component,
    defineComponent,
    signal,
} from '../../../../framework/core';
import './custom.component.scss';

export class CustomComponent extends Component {
    templateUrl = './src/app/shared/components/custom/custom.component.html';

    customProperty = signal<string | null>(null);

    get name() {
        return this.getAttribute('name') || '';
    }

    constructor() {
        super();
    }

    onInput(element: HTMLInputElement) {
        this.customProperty.set(element.value);
    }

    onClear() {
        this.customProperty.set(null);
    }
}

defineComponent('custom-component', CustomComponent);
