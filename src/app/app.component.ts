import {
    Component,
    defineComponent,
    inject,
    signal,
} from '../framework/core';
import { DataService } from '../data/data.service';
import './app.component.scss';
import './shared/components/header/header.component';
import './shared/components/custom/custom.component';
import './shared/components/raw-template/raw-template.component';
import './shared/components/forms-validation/forms-validation.component';
import './shared/components/directive-sample/directive-sample.component';
import type { CustomComponent } from './shared/components/custom/custom.component';
import type { RawTemplateComponent } from './shared/components/raw-template/raw-template.component';
import type { FormsValidationComponent } from './shared/components/forms-validation/forms-validation.component';
import { drag } from './shared/behaviors/draggable/draggable';
import { droppable } from './shared/behaviors/droppable/droppable';

export class AppComponent extends Component {
    templateUrl = './src/app/app.component.html';

    private dataService = inject(DataService);
    loggedUser = signal<string | null>(null);

    private dragCleanup?: { destroy: () => void };
    private dropCleanup?: { destroy: () => void };

    get customComponent1(): CustomComponent | null {
        return this.querySelector('#component1');
    }

    get customComponent2(): CustomComponent | null {
        return this.querySelector('#component2');
    }

    get rawTemplateComponent(): RawTemplateComponent | null {
        return this.querySelector('#raw-template');
    }

    get formsValidation(): FormsValidationComponent | null {
        return this.querySelector('#forms-validation');
    }

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
        // register app to the global window object
        (window as any).app = this;

        this.droppableBehavior();
        this.draggableBehavior();
    }

    disconnectedCallback() {
        this.dragCleanup?.destroy();
        this.dropCleanup?.destroy();
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
        };
        this.dropCleanup = droppable(dropOptions);
    }

    onTextInput(element: HTMLInputElement) {
        this.loggedUser.set(element.value);
    }

    onLogin() {
        const user = this.dataService.login('some user');
        this.loggedUser.set(user.name);
    }

    onLogout() {
        this.dataService.logout();
        this.loggedUser.set(null);
    }

    setDefaultLogin() {
        this.customComponent1?.customProperty.set(this.loggedUser());
        this.customComponent2?.customProperty.set(this.loggedUser());
        this.rawTemplateComponent?.customProperty.update((val) => val + 1);
    }
}

defineComponent('app-component', AppComponent);
