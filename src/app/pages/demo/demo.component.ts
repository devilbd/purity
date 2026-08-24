import {
    Component,
    inject,
    signal,
    ViewChild,
} from '@purity/core';
import { DataService } from '@data/data.service';
import './demo.component.scss';
import '@pages/custom/custom.component';
import '@pages/raw-template/raw-template.component';
import '@pages/forms-validation/forms-validation.component';
import '@pages/directive-sample/directive-sample.component';
import '@pages/pipe-sample/pipe-sample.component';
import '@pages/for-sample/for-sample.component';
import '@pages/date-time-picker-sample/date-time-picker-sample.component';
import '@pages/radial-context-menu-sample/radial-context-menu-sample.component';
import '@pages/http-sample/http-sample.component';
import '@pages/notification-sample/notification-sample.component';
import '@components/modal/modal-view.component';
import '@components/date-time-picker/date-time-picker.component';
import '@components/loader/loader.component';
import '@components/notification/notification.component';
import '@validators/forms-validation.validator';
import '@pipes/transform-sample.pipe';
import '@pipes/uppercase.pipe';
import '@pipes/date.pipe';
import type { CustomComponent } from '@pages/custom/custom.component';
import type { RawTemplateComponent } from '@pages/raw-template/raw-template.component';
import type { FormsValidationComponent } from '@pages/forms-validation/forms-validation.component';
import type { PipeSampleComponent } from '@pages/pipe-sample/pipe-sample.component';
import type { ForSampleComponent } from '@pages/for-sample/for-sample.component';
import type { ModalViewComponent } from '@components/modal/modal-view.component';
import type { LoaderComponent } from '@components/loader/loader.component';
import type { NotificationComponent } from '@components/notification/notification.component';
import type { DateTimePickerSampleComponent } from '@pages/date-time-picker-sample/date-time-picker-sample.component';
import type { RadialContextMenuSampleComponent } from '@pages/radial-context-menu-sample/radial-context-menu-sample.component';
import type { NotificationSampleComponent } from '@pages/notification-sample/notification-sample.component';
import { drag } from '@behaviors/draggable/draggable';
import { droppable } from '@behaviors/droppable/droppable';

@Component({
    selector: 'demo-component',
    templateUrl: './src/app/pages/demo/demo.component.html',
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

    @ViewChild('#pipe-sample')
    pipeSample?: PipeSampleComponent | null;

    @ViewChild('#for-sample')
    forSample?: ForSampleComponent | null;

    @ViewChild('#date-time-picker-sample')
    dateTimePickerSample?: DateTimePickerSampleComponent | null;

    @ViewChild('#radial-context-menu-sample')
    radialContextMenuSample?: RadialContextMenuSampleComponent | null;

    @ViewChild('#demo-modal')
    modalView?: ModalViewComponent | null;

    @ViewChild('#app-loader')
    loader?: LoaderComponent | null;

    @ViewChild('#notification-sample')
    notificationSample?: NotificationSampleComponent | null;

    @ViewChild('#notification-component')
    notificationComponent?: NotificationComponent | null;

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

    onOpenModal() {
        const modal = this.modalView || (document.querySelector('#demo-modal') as any) || (document.querySelector('modal-view') as any);
        modal?.open({ title: 'Purity Modal Dialog Showcase' });
    }

    setDefaultLogin() {
        this.customComponent1?.customProperty.set(this.loggedUser());
        this.customComponent2?.customProperty.set(this.loggedUser());
        this.rawTemplateComponent?.customProperty.update((val) => val + 1);
    }
}
