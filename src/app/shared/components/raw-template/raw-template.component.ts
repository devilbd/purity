import {
    Component,
    defineComponent,
    effect,
    signal,
} from '../../../../framework/core';
import './raw-template.component.scss';

export class RawTemplateComponent extends Component {
    customProperty = signal(0);

    get status() {
        if (this.customProperty() % 2 === 0) {
            return 'success';
        }
        return 'error';
    }

    get template() {
        return `
            <div class="raw-template-component-root window">
                <h2>Raw Template Component</h2>
                <div class="${this.status}">${this.customProperty()}</div>
            </div>
        `;
    }

    constructor() {
        super();
    }

    protected onInit() {
        effect(() => {
            if (this.customProperty()) {
                this.render(this.template);
            }
        });
    }
}

defineComponent('raw-template', RawTemplateComponent);
