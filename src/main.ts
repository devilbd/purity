import './style.scss';
import '@directives/dropdown.directive';
import { bootstrapApplication } from '@purity/core';
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
    providers: [FirebaseService, ThemeService, NotifyService],
    interceptors: [LoggingInterceptor, AuthInterceptor],
    routes: [
        { path: '/', component: RouterHomeViewComponent, title: '..::: Purity :::..' },
        { path: '/users/:id', component: RouterUserViewComponent, title: '..::: Purity :::..' },
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
