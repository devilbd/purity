import { bootstrapApplication } from '@purity/core';
import { AppComponent } from '@app/app.component';
import { environment } from '@environments/environment';
import { FirebaseService, initGoogleAnalytics } from '@data/firebase';

bootstrapApplication(AppComponent, {
    environment,
    providers: [FirebaseService],
}).then(() => {
    initGoogleAnalytics();
}).catch((err) => {
    console.error('Failed to bootstrap Purity application:', err);
});
