import { Component, inject, signal, effect } from '@purity/core';
import { NotifyService, type NotificationItem, type NotificationPosition } from '@data/notify.service';
import './notification.component.scss';

export interface PositionGroup {
    position: NotificationPosition;
    items: NotificationItem[];
}

const ALL_POSITIONS: NotificationPosition[] = [
    'top-right',
    'top-left',
    'top-center',
    'bottom-right',
    'bottom-left',
    'bottom-center',
    'center',
];

@Component({
    selector: 'notification-component',
    templateUrl: './src/app/shared/components/notification/notification.component.html',
})
export class NotificationComponent {
    private notifyService = inject(NotifyService);
    public positionGroups = signal<PositionGroup[]>([]);

    protected onInit(): void {
        (this as any)._component = this;
        (window as any).notificationComponent = this;

        // Teleport to document.body so notification overlays sit above all DOM stacking contexts
        if (typeof document !== 'undefined' && document.body) {
            document.body.prepend(this as any);
        }

        // Dynamically group active notifications by position
        effect(() => {
            const all = this.notifyService.notifications();
            const groups: PositionGroup[] = [];

            for (const pos of ALL_POSITIONS) {
                const items = all.filter((n) => n.position === pos);
                if (items.length > 0) {
                    groups.push({ position: pos, items });
                }
            }

            this.positionGroups.set(groups);
        });
    }

    public dismiss(id: string): void {
        this.notifyService.dismiss(id);
    }
}
