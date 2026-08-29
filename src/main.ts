import './style.scss';
import '@directives/dropdown.directive';
import { bootstrapApplication, SeoService } from '@purity/core';
import { AppComponent } from '@app/app.component';
import { environment } from '@environments/environment';
import { FirebaseService, initGoogleAnalytics } from '@data/firebase';
import { ThemeService } from '@data/theme.service';
import { NotifyService } from '@data/notify.service';
import { LoggingInterceptor } from '@interceptors/logging.interceptor';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { RouterHomeViewComponent } from '@pages/router-sample/home-view.component';
import { RouterUserViewComponent } from '@pages/router-sample/user-view.component';

bootstrapApplication(AppComponent, {
    environment,
    providers: [FirebaseService, ThemeService, NotifyService, SeoService],
    interceptors: [LoggingInterceptor, AuthInterceptor],
    routes: [
        {
            path: '/',
            component: RouterHomeViewComponent,
            title: 'Purity Framework - Native TypeScript Framework with Signals',
            seo: {
                title: 'Purity Framework - Lightweight Native TypeScript Frontend Framework',
                description: 'A lightweight, native TypeScript frontend framework powered by fine-grained signals, native Web Components, Dependency Injection, HTTP interceptors, and GNOME Adwaita theming.',
                canonical: 'https://purity-world.dev/',
                keywords: ['typescript', 'signals', 'web components', 'reactive', 'gnome adwaita', 'custom elements'],
            },
        },
        {
            path: '/users/:id',
            component: RouterUserViewComponent,
            title: (params) => `User #${params.id} Profile - Purity`,
            seo: (params) => ({
                title: `User #${params.id} Profile - Purity Framework`,
                description: `View user profile details for account #${params.id} on Purity Framework.`,
                canonical: `https://purity-world.dev/users/${params.id}`,
            }),
        },
    ],
    routerOptions: {
        mode: 'history',
        scrollRestoration: false,
    },
}).then(() => {
    initGoogleAnalytics();
}).catch((err) => {
    console.error('Failed to bootstrap Purity application:', err);
});
