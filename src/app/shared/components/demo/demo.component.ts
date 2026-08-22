import {
    Component,
    inject,
    signal,
    ViewChild,
} from '@purity/core';
import { DataService } from '../../../../data/data.service';
import './demo.component.scss';
import '../custom/custom.component';
import '../raw-template/raw-template.component';
import '../forms-validation/forms-validation.component';
import '../directive-sample/directive-sample.component';
import '../../validators/forms-validation.validator';
import type { CustomComponent } from '../custom/custom.component';
import type { RawTemplateComponent } from '../raw-template/raw-template.component';
import type { FormsValidationComponent } from '../forms-validation/forms-validation.component';
import { drag } from '../../behaviors/draggable/draggable';
import { droppable } from '../../behaviors/droppable/droppable';

@Component({
    selector: 'demo-component',
    templateUrl: './src/app/shared/components/demo/demo.component.html',
})
export class DemoComponent {
    private dataService = inject(DataService);
    loggedUser = signal<string | null>(null);

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
        (window as any).demo = this;

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
            },
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
            },
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
