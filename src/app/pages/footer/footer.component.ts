import { Component, signal } from '@purity/core';
import { environment } from '@environments/environment';
import packageJson from '@package';
import './footer.component.scss';

@Component({
    selector: 'footer-component',
    templateUrl: './src/app/pages/footer/footer.component.html',
})
export class FooterComponent {
    public currentYear = signal<number>(new Date().getFullYear());
    public version = signal<string>(packageJson.version);
    public buildVersion = signal<string>(environment.buildVersion || packageJson.version);
    public isProduction = signal<boolean>(environment.production);
}
