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
    elementsMap = new Map<string, HTMLElement>();

    get name() {
        return this.getAttribute('name') || '';
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.domInitializer();

        effect(() => {
            const propVal = this.customProperty();
            const input = this.elementsMap.get('input');
            const display = this.elementsMap.get('display');

            if (input) updateValues([input], propVal);
            if (display) updateTargets([display], propVal);
        });
    }

    domInitializer() {
        const rootEl = getElement(`[name="${this.name}"]`);
        if (rootEl) {
            this.elementsMap = getElements(
                {
                    input: '.input1',
                    display: '.custom-property-display',
                    clearBtn: '.clear-button',
                },
                rootEl,
            );

            this.elementsMap.get('clearBtn')?.addEventListener('click', () => {
                this.onClear();
            });
        }
    }

    onClear() {
        this.customProperty.set(null);
    }
}

defineComponent('custom-component', CustomComponent);
