import { Component, signal, ViewChild } from '@purity/core';
import './profile-avatar.component.scss';
import '@components/popover/popover.component';
import type { PopoverComponent } from '@components/popover/popover.component';
import avatarImg from '@app/assets/vp.jpeg';

@Component({
    selector: 'profile-avatar',
    templateUrl: './src/app/shared/components/profile-avatar/profile-avatar.component.html',
})
export class ProfileAvatarComponent {
    public avatarUrl = signal<string>(avatarImg || '/vp.jpeg');
    public greeting = signal<string>('Welcome to purity world...');

    @ViewChild('#profile-avatar-badge')
    public triggerEl?: HTMLElement | null;

    @ViewChild('#profile-avatar-popover')
    public popoverComponent?: (PopoverComponent & HTMLElement) | null;

    protected onInit(): void {
        const host = this as unknown as HTMLElement;
        const srcAttr = host.getAttribute?.('src') || host.getAttribute?.('image-src');
        if (srcAttr) {
            this.avatarUrl.set(srcAttr);
        }

        const greetingAttr = host.getAttribute?.('greeting');
        if (greetingAttr) {
            this.greeting.set(greetingAttr);
        }
    }

    public openPopover(): void {
        const target = this.triggerEl || ((this as unknown as HTMLElement).querySelector('#profile-avatar-badge') as HTMLElement | null);
        if (target && this.popoverComponent) {
            this.popoverComponent.open(target);
        }
    }

    public closePopover(): void {
        this.popoverComponent?.close();
    }
}
