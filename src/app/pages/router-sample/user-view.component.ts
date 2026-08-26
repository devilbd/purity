import { Component, signal, effect, inject, Router, type RouteParams } from '@purity/core';

@Component({
    selector: 'router-user-view',
    template: `
        <div class="route-subview user-subview">
            <div class="subview-header">
                <span class="subview-icon">👤</span>
                <h4>User Profile: <code>{{userId()}}</code></h4>
            </div>
            <p class="subview-desc">
                Dynamic route parameter extracted reactively from <code>/users/:id</code>:
            </p>
            <div class="user-details-card">
                <div class="user-avatar">{{avatarLetter()}}</div>
                <div class="user-meta">
                    <div class="user-meta-row">
                        <span class="meta-label">User ID:</span>
                        <strong class="meta-val">{{userId()}}</strong>
                    </div>
                    <div class="user-meta-row">
                        <span class="meta-label">Role:</span>
                        <span class="meta-val">{{userRole()}}</span>
                    </div>
                    <div class="user-meta-row">
                        <span class="meta-label">Route Status:</span>
                        <span class="badge-success">Active &amp; Bound</span>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class RouterUserViewComponent {
    private router = inject(Router);

    userId = signal<string>('unknown');
    userRole = signal<string>('Member');
    avatarLetter = signal<string>('U');

    protected onInit() {
        effect(() => {
            const params = this.router.params();
            this.syncParams(params);
        });
    }

    private syncParams(params: RouteParams) {
        const id = params.id || 'anonymous';
        this.userId.set(id);
        this.avatarLetter.set(id.charAt(0).toUpperCase());
        this.userRole.set(
            id.toLowerCase() === 'alice'
                ? 'System Administrator'
                : id.toLowerCase() === 'bob'
                  ? 'Lead Architect'
                  : 'Standard Member',
        );
    }
}
