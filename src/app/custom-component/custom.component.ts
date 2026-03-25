import { effect, signal } from '../../framework/core';
import './custom.component.scss';

export class CustomComponent extends HTMLElement {
    customProperty = signal<string | null>(null);

    constructor() {
        super();
        effect(() => {
            this.render();
        });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="custom-component" onclick="app.customComponent.onCustomPropertyClicked(this)">
                Custom component ${this.customProperty()}
            </div>
        `;
    }

    onCustomPropertyClicked(e: MouseEvent) {
        console.log(e);
    }
}

customElements.define('custom-component', CustomComponent);