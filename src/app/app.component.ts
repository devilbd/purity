import { effect, getElement, signal, updateStyles, updateTargets, updateValues } from '../framework/core';
import '../style.scss';
import './custom-component/custom.component';
import type { CustomComponent } from './custom-component/custom.component';

export class AppComponent extends HTMLElement {
    loggedUser = signal<string | null>(null);

    resultContainer!: HTMLElement;
    usernameField!: HTMLInputElement;
    customComponent!: CustomComponent;

    get loginStatus() {
      if (this.loggedUser()?.includes('custom_user')) {
        return 'custom-user';
      } else if (this.loggedUser()) {
        return 'active';
      } else {
        return 'error';
      }
    }

    constructor() {
      super();
      this.render();
      this.domInitializer();

      effect(() => {
        updateValues([this.usernameField], this.loggedUser());
        updateTargets([this.resultContainer], this.loggedUser(), 'Not signed in.');
        updateStyles([this.resultContainer], this.loginStatus);
      });
    }

    // consider to rework it
    connectedCallback() {
      // this needs to be hooked somewhere here, 
      // the import of AppComponent and then the exection into the <app-component> will trigger the constructor twice
      // register app to the global window object
      (window as any).app = this;
    }

    render() {
        this.innerHTML = `
            <div id="result"></div>
            <input id="username" type="text" class="input-primary" />
            <input type="text" onkeyup="app.onTextInput(this)" class="input-primary" />
            <button class="button-primary" onclick="app.onLogin()">Login</button>
            <button class="button-primary" onclick="app.onLogout()">Logout</button>
            <button class="button-primary" onclick="app.setDefaultLogin()">
              Set explicitly value on login input
            </button>
            <custom-component></custom-component>
        `;
    }

    domInitializer() {
      this.resultContainer = getElement('#result') as HTMLElement;
      this.usernameField = getElement('#username') as HTMLInputElement;
      this.customComponent = getElement('custom-component') as CustomComponent;
    }

    onTextInput(element: HTMLInputElement) {
      this.loggedUser.set(element.value);
    }

    onLogin() {
      this.loggedUser.set('some user');
    }

    onLogout() {
      this.loggedUser.set(null);
    }

    setDefaultLogin() {
      this.loggedUser.set('custom_user');
      // setting custom property of custom component
      this.customComponent.customProperty.set(this.loggedUser());
    }
}

if (!customElements.get('app-component')) {
  customElements.define('app-component', AppComponent);
}