import { Injectable, signal } from '@purity/core';

export type NotificationType = 'error' | 'warn' | 'info' | 'success';

export type NotificationPosition =
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'center';

export interface NotificationOptions {
    id?: string;
    type?: NotificationType;
    title: string;
    subtitle?: string;
    position?: NotificationPosition;
    duration?: number; // Duration in ms. 0 means persistent until closed manually.
    width?: string;
    height?: string;
    dismissible?: boolean;
    onClose?: () => void;
}

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    subtitle: string;
    position: NotificationPosition;
    duration: number;
    remainingSeconds: number;
    width: string;
    height: string;
    dismissible: boolean;
    createdAt: number;
    onClose?: () => void;
}

@Injectable('NotifyService')
export class NotifyService {
    public notifications = signal<NotificationItem[]>([]);
    private timers = new Map<string, any>();
    private tickerInterval: any = null;

    private ensureTicker(): void {
        if (this.tickerInterval || typeof window === 'undefined') return;
        this.tickerInterval = setInterval(() => {
            const current = this.notifications();
            if (current.length === 0) {
                clearInterval(this.tickerInterval);
                this.tickerInterval = null;
                return;
            }

            let hasUpdates = false;
            const updated = current.map((item) => {
                if (item.duration > 0 && item.remainingSeconds > 0) {
                    hasUpdates = true;
                    return { ...item, remainingSeconds: Math.max(0, item.remainingSeconds - 1) };
                }
                return item;
            });

            if (hasUpdates) {
                this.notifications.set(updated);
            }
        }, 1000);
    }

    /**
     * Dispatches a new notification toast.
     */
    public notify(options: NotificationOptions): string {
        const id = options.id || `notify_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        // Default downtime countdown duration is 10 seconds (10000ms)
        const duration = options.duration !== undefined ? options.duration : 10000;
        const remainingSeconds = duration > 0 ? Math.ceil(duration / 1000) : 0;

        const item: NotificationItem = {
            id,
            type: options.type || 'info',
            title: options.title,
            subtitle: options.subtitle || '',
            position: options.position || 'top-right',
            duration,
            remainingSeconds,
            width: options.width || '',
            height: options.height || '',
            dismissible: options.dismissible !== false,
            createdAt: Date.now(),
            onClose: options.onClose,
        };

        this.notifications.update((list) => [...list, item]);

        // Auto-dismiss timer if duration is specified and greater than 0
        if (duration > 0 && typeof window !== 'undefined') {
            const timer = setTimeout(() => {
                this.dismiss(id);
            }, duration);
            this.timers.set(id, timer);
            this.ensureTicker();
        }

        return id;
    }

    /**
     * Dispatches a success notification.
     */
    public success(title: string, subtitle?: string, options?: Partial<NotificationOptions>): string {
        return this.notify({
            ...options,
            type: 'success',
            title,
            subtitle,
        });
    }

    /**
     * Dispatches an error notification.
     */
    public error(title: string, subtitle?: string, options?: Partial<NotificationOptions>): string {
        return this.notify({
            ...options,
            type: 'error',
            title,
            subtitle,
        });
    }

    /**
     * Dispatches a warning notification.
     */
    public warn(title: string, subtitle?: string, options?: Partial<NotificationOptions>): string {
        return this.notify({
            ...options,
            type: 'warn',
            title,
            subtitle,
        });
    }

    /**
     * Dispatches an informational notification.
     */
    public info(title: string, subtitle?: string, options?: Partial<NotificationOptions>): string {
        return this.notify({
            ...options,
            type: 'info',
            title,
            subtitle,
        });
    }

    /**
     * Dismisses an active notification by ID.
     */
    public dismiss(id: string): void {
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(id);
        }

        const current = this.notifications();
        const target = current.find((item) => item.id === id);
        if (target && target.onClose) {
            try {
                target.onClose();
            } catch (err) {
                console.error('[NotifyService] Error in onClose handler:', err);
            }
        }

        const remaining = current.filter((item) => item.id !== id);
        if (remaining.length === 0 && this.tickerInterval) {
            clearInterval(this.tickerInterval);
            this.tickerInterval = null;
        }
        this.notifications.set(remaining);
    }

    /**
     * Clears all active notifications.
     */
    public clear(): void {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
        if (this.tickerInterval) {
            clearInterval(this.tickerInterval);
            this.tickerInterval = null;
        }
        this.notifications.set([]);
    }
}
