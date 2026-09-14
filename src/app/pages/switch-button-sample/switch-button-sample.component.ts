import { Component, signal, ViewChild } from '@purity/core';
import './switch-button-sample.component.scss';
import '@components/switch-button/switch-button.component';
import type { SwitchButtonComponent } from '@components/switch-button/switch-button.component';

@Component({
    selector: 'switch-button-sample',
    templateUrl: './switch-button-sample.component.html',
})
export class SwitchButtonSampleComponent {
    @ViewChild('#demo-main-switch')
    public mainSwitch?: SwitchButtonComponent | null;

    public lastAction = signal<string>('Ready. Click switch directly or use @ViewChild controls.');

    public get isSwitchOn(): boolean {
        return this.mainSwitch?.isOn() ?? false;
    }

    public switchOn(): void {
        this.mainSwitch?.switchOn();
        this.lastAction.set('switchOn() invoked via @ViewChild');
    }

    public switchOff(): void {
        this.mainSwitch?.switchOff();
        this.lastAction.set('switchOff() invoked via @ViewChild');
    }

    public toggle(): void {
        this.mainSwitch?.toggle();
        this.lastAction.set('toggle() invoked via @ViewChild');
    }
}
