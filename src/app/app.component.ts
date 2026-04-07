import {
    Component,
    defineComponent,
    effect,
    getElements,
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
import { drag } from './shared/behaviors/draggable/draggable';
import { droppable } from './shared/behaviors/droppable/droppable';

export class AppComponent extends Component {
    templateUrl = './src/app/app.component.html';

    loggedUser = signal<string | null>(null);

    resultContainer!: HTMLElement;
    usernameField!: HTMLInputElement;
    customComponent1!: CustomComponent;
    customComponent2!: CustomComponent;
    rawTemplateComponent!: RawTemplateComponent;

    private dragCleanup?: { destroy: () => void };
    private dropCleanup?: { destroy: () => void };

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

    disconnectedCallback() {
        this.dragCleanup?.destroy();
        this.dropCleanup?.destroy();
    }

    domInitializer() {
        const elementsMap = getElements(
            {
                result: '#result',
                username: '#username',
                component1: '#component1',
                component2: '#component2',
                rawTemplate: '#raw-template',
            },
            this,
        );

        this.resultContainer = elementsMap.get('result')!;
        this.usernameField = elementsMap.get('username') as HTMLInputElement;
        this.customComponent1 = elementsMap.get(
            'component1',
        ) as CustomComponent;
        this.customComponent2 = elementsMap.get(
            'component2',
        ) as CustomComponent;
        this.rawTemplateComponent = elementsMap.get(
            'rawTemplate',
        ) as RawTemplateComponent;

        this.droppableBehavior();
        this.draggableBehavior();
    }

    draggableBehavior() {
        const dragOptions = { 
            selector: '#component1', 
            constrainTo: 'body', 
            snapTo: '#droppable-container',
            handle: '.drag-handle',
            onDragStart: (el: HTMLElement) => {
                el.classList.add('dragging');
            },
            onDragEnd: (el: HTMLElement) => {
                el.classList.remove('dragging');
            }
        };
        this.dragCleanup = drag(dragOptions);
    }

    droppableBehavior() {
        const dropOptions = {
            selector: '#droppable-container',
            accepts: '#component1',
            hoverClass: 'droppable-hover',
            onDrop: (draggedEl: HTMLElement) => {
                draggedEl.remove();
            },
            onEnter: (draggedEl: HTMLElement) => {
                draggedEl.classList.add('droppable-hover');
            },
            onLeave: (draggedEl: HTMLElement) => {
                draggedEl.classList.remove('droppable-hover');
            }
        }
        this.dropCleanup = droppable(dropOptions);
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
