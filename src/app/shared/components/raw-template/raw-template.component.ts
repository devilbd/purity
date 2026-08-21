import {
    Component,
    effect,
    signal,
} from '../../../../framework/core';
import './raw-template.component.scss';

@Component({
    selector: 'raw-template',
})
export class RawTemplateComponent {
    customProperty = signal(0);
    declare render: (content: string) => void;

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

    onInit() {
        effect(() => {
            this.render(this.template);
        });
    }
}
