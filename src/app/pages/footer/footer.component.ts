import { Component, signal } from '@purity/core';
import { environment } from '@environments/environment';
import './footer.component.scss';

@Component({
    selector: 'footer-component',
    templateUrl: './src/app/pages/footer/footer.component.html',
})
export class FooterComponent {
    public currentYear = signal<number>(new Date().getFullYear());
    public version = signal<string>(environment.version);
    public buildVersion = signal<string>(environment.buildVersion || environment.version);
    public isProduction = signal<boolean>(environment.production);
}
