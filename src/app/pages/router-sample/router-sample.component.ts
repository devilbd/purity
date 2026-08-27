import { Component, signal, effect, inject, type Route, Router, type QueryParams } from '@purity/core';
import './router-sample.component.scss';
import { RouterHomeViewComponent } from './home-view.component';
import { RouterUserViewComponent } from './user-view.component';

/**
 * Main Router Showcase Component (<router-sample>)
 */
@Component({
    selector: 'router-sample',
    templateUrl: './src/app/pages/router-sample/router-sample.component.html',
})
export class RouterSampleComponent {
    public router = inject(Router);

    customUserId = signal<string>('charlie');
    activeUrl = signal<string>('/');
    activeParamsJson = signal<string>('{}');
    activeQueryParamsJson = signal<string>('{}');

    public sampleRoutes: Route[] = [
        { path: '/', component: RouterHomeViewComponent, title: '..::: Purity :::..' },
        { path: '/users/:id', component: RouterUserViewComponent, title: '..::: Purity :::..' },
    ];

    protected onInit() {
        // If routes are not configured yet, configure them with the sample routes
        if (this.router.getRoutes().length === 0) {
            this.router.configureRoutes(this.sampleRoutes, {
                mode: 'history',
                scrollRestoration: false,
            });
        }

        // Synchronize inspector signals reactively whenever router state updates
        effect(() => {
            this.activeUrl.set(this.router.url());
            this.activeParamsJson.set(JSON.stringify(this.router.params()));
            this.activeQueryParamsJson.set(JSON.stringify(this.router.queryParams()));
        });
    }

    onNavigate(path: string, queryParams?: QueryParams) {
        this.router.navigate(path, { queryParams });
    }

    onCustomUserNavigate() {
        const id = this.customUserId().trim() || 'guest';
        this.onNavigate(`/users/${encodeURIComponent(id)}`);
    }

    onCustomUserIdInput(el: HTMLInputElement) {
        this.customUserId.set(el.value);
    }

    onRefreshRoute() {
        this.router.navigateByUrl(this.router.url());
    }

    onBack() {
        this.router.back();
    }

    onForward() {
        this.router.forward();
    }
}
