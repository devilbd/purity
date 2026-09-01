import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NotificationComponent } from './notification.component';
import { NotifyService } from '@data/notify.service';
import { inject, container } from '@purity/core';

describe('NotificationComponent', () => {
    let element: HTMLElement;
    let component: NotificationComponent;
    let notifyService: NotifyService;

    beforeEach(() => {
        // Clear any DI state / notifications from previous runs
        notifyService = inject(NotifyService);
        notifyService.clear();

        element = document.createElement('notification-component');
        document.body.appendChild(element);
        component = element as unknown as NotificationComponent;
    });

    afterEach(() => {
        notifyService.clear();
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        container.clear();
    });

    it('should initialize with empty position groups', () => {
        expect(component.positionGroups()).toEqual([]);
    });

    it('should group single notification by position', () => {
        notifyService.info('Hello', 'Purity Notification', { position: 'top-right', duration: 0 });

        const groups = component.positionGroups();
        expect(groups.length).toBe(1);
        expect(groups[0].position).toBe('top-right');
        expect(groups[0].items.length).toBe(1);
        expect(groups[0].items[0].title).toBe('Hello');
    });

    it('should group multiple notifications with same position into one group', () => {
        notifyService.success('Task 1', 'Success 1', { position: 'bottom-right', duration: 0 });
        notifyService.error('Task 2', 'Error 2', { position: 'bottom-right', duration: 0 });

        const groups = component.positionGroups();
        expect(groups.length).toBe(1);
        expect(groups[0].position).toBe('bottom-right');
        expect(groups[0].items.length).toBe(2);
        expect(groups[0].items[0].title).toBe('Task 1');
        expect(groups[0].items[1].title).toBe('Task 2');
    });

    it('should create separate groups for different positions', () => {
        notifyService.info('Top Left Msg', '', { position: 'top-left', duration: 0 });
        notifyService.warn('Center Msg', '', { position: 'center', duration: 0 });
        notifyService.error('Bottom Left Msg', '', { position: 'bottom-left', duration: 0 });

        const groups = component.positionGroups();
        expect(groups.length).toBe(3);

        const positions = groups.map((g) => g.position);
        expect(positions).toContain('top-left');
        expect(positions).toContain('center');
        expect(positions).toContain('bottom-left');
    });

    it('should dismiss notification via component method', () => {
        const id1 = notifyService.info('Dismiss Me', '', { position: 'top-right', duration: 0 });
        const id2 = notifyService.info('Keep Me', '', { position: 'top-right', duration: 0 });

        expect(component.positionGroups()[0].items.length).toBe(2);

        component.dismiss(id1);

        const groups = component.positionGroups();
        expect(groups.length).toBe(1);
        expect(groups[0].items.length).toBe(1);
        expect(groups[0].items[0].id).toBe(id2);
    });

    it('should remove group completely when all notifications in it are dismissed', () => {
        const id = notifyService.info('Temporary', '', { position: 'top-center', duration: 0 });
        expect(component.positionGroups().length).toBe(1);

        component.dismiss(id);
        expect(component.positionGroups().length).toBe(0);
    });
});
