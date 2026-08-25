import { Component, signal, ViewChild } from '@purity/core';
import './modal-sample.component.scss';
import '@components/modal/modal-view.component';
import type { ModalViewComponent } from '@components/modal/modal-view.component';
import '@pages/custom/custom.component';

@Component({
    selector: 'modal-sample',
    templateUrl: './src/app/pages/modal-sample/modal-sample.component.html',
})
export class ModalSampleComponent {
    activeModalType = signal<string>('idle');

    @ViewChild('#sample-standard-modal')
    private standardModal?: ModalViewComponent | null;

    @ViewChild('#sample-projected-modal')
    private projectedModal?: ModalViewComponent | null;

    get modalStatusText(): string {
        switch (this.activeModalType()) {
            case 'standard':
                return 'Standard Modal Active';
            case 'projected':
                return 'Projected Modal Active';
            case 'maximized':
                return 'Maximized Modal Active';
            default:
                return 'Ready';
        }
    }

    get modalStatusClass(): string {
        return this.activeModalType() !== 'idle' ? 'is-active' : '';
    }

    openStandardModal(): void {
        this.activeModalType.set('standard');
        const modal = this.standardModal || (document.querySelector('#sample-standard-modal') as any);
        modal?.open({ title: 'Standard Purity Modal Dialog' });
    }

    openProjectedModal(): void {
        this.activeModalType.set('projected');
        const modal = this.projectedModal || (document.querySelector('#sample-projected-modal') as any);
        modal?.open({ title: 'Projected Content Modal' });
    }

    openMaximizedModal(): void {
        this.activeModalType.set('maximized');
        const modal = this.standardModal || (document.querySelector('#sample-standard-modal') as any);
        modal?.open({ title: 'Maximized Purity Modal Dialog' });
        if (modal && !modal.isMaximized()) {
            modal.maximize();
        }
    }
}
