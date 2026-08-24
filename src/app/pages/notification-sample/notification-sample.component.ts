import { Component, inject, signal } from '@purity/core';
import { NotifyService, type NotificationPosition, type NotificationType } from '@data/notify.service';
import './notification-sample.component.scss';

@Component({
    selector: 'notification-sample',
    templateUrl: './src/app/pages/notification-sample/notification-sample.component.html',
})
export class NotificationSampleComponent {
    private notifyService = inject(NotifyService);

    public customTitle = signal<string>('Operation Successful');
    public customSubtitle = signal<string>('All reactive state updates and data changes have been applied.');
    public selectedPosition = signal<NotificationPosition>('top-right');
    public selectedDuration = signal<number>(10000);

    public onDurationInput(element: HTMLInputElement): void {
        const val = parseInt(element.value, 10);
        this.selectedDuration.set(isNaN(val) ? 0 : val);
    }

    public setPosition(pos: NotificationPosition): void {
        this.selectedPosition.set(pos);
    }

    public triggerSuccess(): void {
        this.notifyService.success(
            'Success Notification',
            'Your changes have been saved to local state successfully.',
            {
                position: this.selectedPosition(),
                duration: this.selectedDuration(),
            },
        );
    }

    public triggerError(): void {
        this.notifyService.error(
            'Network Request Failed',
            'Unable to reach server endpoint. Please verify your connection.',
            {
                position: this.selectedPosition(),
                duration: this.selectedDuration(),
            },
        );
    }

    public triggerWarn(): void {
        this.notifyService.warn(
            'Memory Threshold Alert',
            'Component cache is reaching recommended maximum limits.',
            {
                position: this.selectedPosition(),
                duration: this.selectedDuration(),
            },
        );
    }

    public triggerInfo(): void {
        this.notifyService.info(
            'System Update Available',
            'Purity Framework v1.0.0 is running in production mode.',
            {
                position: this.selectedPosition(),
                duration: this.selectedDuration(),
            },
        );
    }

    public triggerCustom(type: NotificationType): void {
        this.notifyService.notify({
            type,
            title: this.customTitle() || 'Notification',
            subtitle: this.customSubtitle() || '',
            position: this.selectedPosition(),
            duration: this.selectedDuration(),
        });
    }

    public clearAll(): void {
        this.notifyService.clear();
    }
}
