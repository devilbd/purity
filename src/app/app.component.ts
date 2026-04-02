import {
    Component,
    defineComponent,
    effect,
    getElement,
    signal,
    updateStyles,
    updateTargets,
    updateValues,
} from '../framework/core';
import './app.component.scss';
import './shared/components/header/header.component';
import './shared/components/custom/custom.component';
import './shared/components/raw-template/raw-template.component';
import type { CustomComponent } from './shared/components/custom/custom.component';
import type { RawTemplateComponent } from './shared/components/raw-template/raw-template.component';

export class AppComponent extends Component {
    templateUrl = './src/app/app.component.html';

    loggedUser = signal<string | null>(null);

    resultContainer!: HTMLElement;
    usernameField!: HTMLInputElement;
    customComponent1!: CustomComponent;
    customComponent2!: CustomComponent;
    rawTemplateComponent!: RawTemplateComponent;

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
        this.customComponent1 = this.querySelector(
            '#component1',
        ) as CustomComponent;
        this.customComponent2 = this.querySelector(
            '#component2',
        ) as CustomComponent;
        this.rawTemplateComponent = getElement(
            '#raw-template',
            this,
        ) as RawTemplateComponent;
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
        this.customComponent1.customProperty.set(this.loggedUser());
        this.customComponent2.customProperty.set(this.loggedUser());
        this.rawTemplateComponent.customProperty.update((val) => val + 1);
    }
}

defineComponent('app-component', AppComponent);
