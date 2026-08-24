import './style.scss';
import { bootstrapApplication } from '@purity/core';
import { AppComponent } from '@app/app.component';
import { environment } from '@environments/environment';
import { FirebaseService, initGoogleAnalytics } from '@data/firebase';
import { ThemeService, initTheme } from '@data/theme.service';

// Initialize theme on HTML document before render (Dark is base)
initTheme();

bootstrapApplication(AppComponent, {
    environment,
    providers: [FirebaseService, ThemeService],
}).then(() => {
    initGoogleAnalytics();
}).catch((err) => {
    console.error('Failed to bootstrap Purity application:', err);
});
