import { effect, signal, updateValues } from '../../framework/core';
import './custom.component.scss';

export class CustomComponent extends HTMLElement {
    customProperty = signal<string | null>(null);
    input1!: HTMLInputElement;

    constructor() {
        super();
        this.render();
        this.domInitializer();

        effect(() => {
            updateValues([this.input1], this.customProperty());
        });
    }

    domInitializer() {
        this.input1 = this.querySelector('#input1') as HTMLInputElement;
    }

    render() {
        this.innerHTML = `
            <div class="custom-component" onclick="app.customComponent.onCustomPropertyClicked(this)">
                Custom component ${this.customProperty()}
                <input id="input1" class="input-primary" type="text" />
                <button class="button-primary" onclick="app.customComponent.onClear()">Clear</button>
            </div>
        `;
    }

    onCustomPropertyClicked(e: MouseEvent) {
        console.log(e);
    }

    onClear() {
        this.customProperty.set(null);
    }
}

if (!customElements.get('custom-component')) {
    customElements.define('custom-component', CustomComponent);
}