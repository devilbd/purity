import { effect, getElement, signal, updateStyles, updateTargets, updateValues } from './core';
import './style.scss';
import './custom-component/custom-component';
import type { CustomComponent } from './custom-component/custom-component';

export class App {
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
      this.domInitializer();
      effect(() => {
        updateValues([this.usernameField], this.loggedUser());
        updateTargets([this.resultContainer], this.loggedUser(), 'Not signed in.');
        updateStyles([this.resultContainer], this.loginStatus);

        // setting custom property of custom component
        this.customComponent.customProperty.set(this.loggedUser());
      });
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
    }
}

(window as any).app = new App();
