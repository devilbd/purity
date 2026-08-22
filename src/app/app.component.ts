import {
    Component,
    inject,
    signal,
    ViewChild,
} from '../framework/core';
import { DataService } from '../data/data.service';
import './app.component.scss';
import './shared/components/intro/intro.component';
import './shared/components/header/header.component';
import './shared/components/custom/custom.component';
import './shared/components/raw-template/raw-template.component';
import './shared/components/forms-validation/forms-validation.component';
import './shared/components/directive-sample/directive-sample.component';
import './shared/validators/forms-validation.validator';
import type { CustomComponent } from './shared/components/custom/custom.component';
import type { RawTemplateComponent } from './shared/components/raw-template/raw-template.component';
import type { FormsValidationComponent } from './shared/components/forms-validation/forms-validation.component';
import { drag } from './shared/behaviors/draggable/draggable';
import { droppable } from './shared/behaviors/droppable/droppable';

@Component({
    selector: 'app-component',
    templateUrl: './src/app/app.component.html',
})
export class AppComponent {
    private dataService = inject(DataService);
    loggedUser = signal<string | null>(null);
    showDemo = signal<boolean>(false);

    @ViewChild('#demo-window')
    demoWindow?: HTMLElement | null;

    @ViewChild('#component1')
    customComponent1?: CustomComponent | null;

    @ViewChild('#component2')
    customComponent2?: CustomComponent | null;

    @ViewChild('#raw-template')
    rawTemplateComponent?: RawTemplateComponent | null;

    @ViewChild('#forms-validation')
    formsValidation?: FormsValidationComponent | null;

    private dragCleanup?: { destroy: () => void };
    private dropCleanup?: { destroy: () => void };

    get demoVisibilityClass(): string {
        return this.showDemo() ? 'demo-visible' : 'demo-hidden';
    }

    onTryIt() {
        this.showDemo.set(true);
        setTimeout(() => {
            if (!this.dragCleanup) {
                this.draggableBehavior();
            }
            if (!this.dropCleanup) {
                this.droppableBehavior();
            }
            this.demoWindow?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    }

    toggleDemo() {
        this.showDemo.update((v) => !v);
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
        this.setDefaultLogin();
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
