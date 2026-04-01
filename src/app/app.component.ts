import {
    Component,
    defineComponent,
    effect,
    signal,
    updateStyles,
    updateTargets,
    updateValues,
} from '../framework/core';
import './app.component.scss';
import './custom-component/custom.component';
import type { CustomComponent } from './custom-component/custom.component';
import './header/header.component';

export class AppComponent extends Component {
    templateUrl = './src/app/app.component.html';

    loggedUser = signal<string | null>(null);

    resultContainer!: HTMLElement;
    usernameField!: HTMLInputElement;
    customComponent!: CustomComponent;

    get loginStatus() {
        if (this.loggedUser()?.includes('custom_user')) {
            return 'warn';
        } else if (this.loggedUser()) {
            return 'success';
        } else {
            return 'error';
        }
    }

    constructor() {
        super();
    }

    protected onInit() {
        this.domInitializer();

        effect(() => {
            updateValues([this.usernameField], this.loggedUser());
            updateTargets(
                [this.resultContainer],
                this.loggedUser(),
                'Not signed in.',
            );
            updateStyles([this.resultContainer], this.loginStatus);
        });

        // register app to the global window object
        (window as any).app = this;
    }

    domInitializer() {
        this.resultContainer = this.querySelector('#result') as HTMLElement;
        this.usernameField = this.querySelector(
            '#username',
        ) as HTMLInputElement;
        this.customComponent = this.querySelector(
            'custom-component',
        ) as CustomComponent;
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
        this.customComponent.customProperty.set(this.loggedUser());
    }
}

defineComponent('app-component', AppComponent);
