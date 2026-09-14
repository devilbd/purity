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
    private mainSwitch?: SwitchButtonComponent | null;

    public mainSwitchState = signal<boolean>(false);
    public lastActionLog = signal<string>('Ready. Click switch directly or use programmatic buttons.');

    protected onInit(): void {
        const host = this as unknown as HTMLElement;
        const mainEl = host.querySelector?.('#demo-main-switch');
        if (mainEl) {
            mainEl.addEventListener('change', (e: any) => {
                const checked = e.detail?.checked ?? false;
                this.mainSwitchState.set(checked);
                this.lastActionLog.set(`User interacted with switch: state is now ${checked ? 'ON' : 'OFF'}`);
            });
        }
    }

    public onProgrammaticSwitchOn(): void {
        const sw = this.mainSwitch || (typeof document !== 'undefined' ? (document.querySelector('#demo-main-switch') as any) : null);
        sw?.switchOn();
        this.mainSwitchState.set(sw?.isOn ? sw.isOn() : true);
        this.lastActionLog.set('Programmatic switchOn() invoked via @ViewChild');
    }

    public onProgrammaticSwitchOff(): void {
        const sw = this.mainSwitch || (typeof document !== 'undefined' ? (document.querySelector('#demo-main-switch') as any) : null);
        sw?.switchOff();
        this.mainSwitchState.set(sw?.isOn ? sw.isOn() : false);
        this.lastActionLog.set('Programmatic switchOff() invoked via @ViewChild');
    }

    public onProgrammaticToggle(): void {
        const sw = this.mainSwitch || (typeof document !== 'undefined' ? (document.querySelector('#demo-main-switch') as any) : null);
        sw?.toggle();
        this.mainSwitchState.set(sw?.isOn ? sw.isOn() : !this.mainSwitchState());
        this.lastActionLog.set('Programmatic toggle() invoked via @ViewChild');
    }
}
