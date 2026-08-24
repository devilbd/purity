import './style.scss';
import { bootstrapApplication } from '@purity/core';
import { AppComponent } from '@app/app.component';
import { environment } from '@environments/environment';
import { FirebaseService, initGoogleAnalytics } from '@data/firebase';
import { ThemeService } from '@data/theme.service';
import { LoggingInterceptor } from '@interceptors/logging.interceptor';
import { AuthInterceptor } from '@interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
    environment,
    providers: [FirebaseService, ThemeService],
    interceptors: [LoggingInterceptor, AuthInterceptor],
}).then(() => {
    initGoogleAnalytics();
}).catch((err) => {
    console.error('Failed to bootstrap Purity application:', err);
});
