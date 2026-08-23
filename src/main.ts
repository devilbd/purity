import { bootstrapApplication } from '@purity/core';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import './data/firebase';

bootstrapApplication(AppComponent, {
    environment,
}).catch((err) => {
    console.error('Failed to bootstrap Purity application:', err);
});
