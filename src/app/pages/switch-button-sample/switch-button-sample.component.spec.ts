import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SwitchButtonSampleComponent } from './switch-button-sample.component';

describe('SwitchButtonSampleComponent', () => {
    let element: HTMLElement;
    let sampleComponent: SwitchButtonSampleComponent;

    beforeEach(() => {
        element = document.createElement('switch-button-sample');
        document.body.appendChild(element);
        sampleComponent = element as unknown as SwitchButtonSampleComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });

    it('should initialize and resolve mainSwitch via @ViewChild', () => {
        expect(sampleComponent.mainSwitch).toBeDefined();
        expect(sampleComponent.isSwitchOn).toBe(false);
        expect(sampleComponent.lastAction()).toContain('Ready');
    });

    it('should turn switch on and update telemetry when switchOn() is called', () => {
        sampleComponent.switchOn();
        expect(sampleComponent.isSwitchOn).toBe(true);
        expect(sampleComponent.mainSwitch?.isOn()).toBe(true);
        expect(sampleComponent.lastAction()).toContain('switchOn() invoked via @ViewChild');
    });

    it('should turn switch off and update telemetry when switchOff() is called', () => {
        sampleComponent.switchOn();
        expect(sampleComponent.isSwitchOn).toBe(true);

        sampleComponent.switchOff();
        expect(sampleComponent.isSwitchOn).toBe(false);
        expect(sampleComponent.mainSwitch?.isOn()).toBe(false);
        expect(sampleComponent.lastAction()).toContain('switchOff() invoked via @ViewChild');
    });

    it('should toggle switch state and update telemetry when toggle() is called', () => {
        expect(sampleComponent.isSwitchOn).toBe(false);

        sampleComponent.toggle();
        expect(sampleComponent.isSwitchOn).toBe(true);
        expect(sampleComponent.mainSwitch?.isOn()).toBe(true);
        expect(sampleComponent.lastAction()).toContain('toggle() invoked via @ViewChild');

        sampleComponent.toggle();
        expect(sampleComponent.isSwitchOn).toBe(false);
        expect(sampleComponent.mainSwitch?.isOn()).toBe(false);
    });

    it('should reactively reflect switch state when the switch button is clicked directly', () => {
        expect(sampleComponent.isSwitchOn).toBe(false);

        const switchEl = element.querySelector('#demo-main-switch') as HTMLElement;
        expect(switchEl).not.toBeNull();

        switchEl.click();
        expect(sampleComponent.isSwitchOn).toBe(true);

        switchEl.click();
        expect(sampleComponent.isSwitchOn).toBe(false);
    });
});
