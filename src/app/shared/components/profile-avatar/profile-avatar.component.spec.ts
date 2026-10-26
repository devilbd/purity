import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileAvatarComponent } from './profile-avatar.component';

describe('ProfileAvatarComponent', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        container.remove();
        document.querySelectorAll('profile-avatar').forEach((el) => el.remove());
        document.querySelectorAll('.purity-popover-portal').forEach((el) => el.remove());
    });

    it('should initialize with default greeting and avatar url', () => {
        const component = new ProfileAvatarComponent();
        expect(component.greeting()).toBe('Welcome to purity world...');
        expect(component.avatarUrl()).toBeTruthy();
    });

    it('should mount into the DOM and render avatar elements with circular frame', () => {
        const el = document.createElement('profile-avatar');
        container.appendChild(el);

        const circle = el.querySelector('.profile-avatar-circle');
        expect(circle).not.toBeNull();

        const img = el.querySelector('.profile-avatar-img') as HTMLImageElement | null;
        expect(img).not.toBeNull();
        expect(img?.getAttribute('src')).toBeTruthy();

        const aura = el.querySelector('.profile-avatar-aura');
        expect(aura).not.toBeNull();
    });

    it('should accept custom greeting and src attributes on mount', () => {
        const el = document.createElement('profile-avatar');
        el.setAttribute('greeting', 'Custom purity greeting');
        el.setAttribute('src', '/custom-vp.jpeg');
        container.appendChild(el);

        const comp = el as unknown as ProfileAvatarComponent;
        expect(comp.greeting()).toBe('Custom purity greeting');
        expect(comp.avatarUrl()).toBe('/custom-vp.jpeg');
    });

    it('should open and close popover with greeting message', () => {
        const el = document.createElement('profile-avatar');
        container.appendChild(el);

        const comp = el as unknown as ProfileAvatarComponent;
        expect(comp.openPopover).toBeDefined();

        comp.openPopover();
        const portals = document.querySelectorAll('.purity-popover-portal');
        expect(portals.length).toBeGreaterThan(0);

        const popoverText = document.body.textContent;
        expect(popoverText).toContain('Welcome to purity world...');
        expect(popoverText).toContain('👋');

        const handEl = document.querySelector('.popover-avatar-hand');
        expect(handEl).not.toBeNull();
        expect(handEl?.textContent?.trim()).toBe('👋');

        comp.closePopover();
    });
});
