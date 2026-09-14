import { describe, it, expect, beforeEach } from 'vitest';
import { SwitchButtonSampleComponent } from './switch-button-sample.component';

describe('SwitchButtonSampleComponent', () => {
    let component: SwitchButtonSampleComponent;

    beforeEach(() => {
        component = new SwitchButtonSampleComponent();
    });

    it('should initialize with default telemetry state', () => {
        expect(component.mainSwitchState()).toBe(false);
        expect(component.lastActionLog()).toContain('Ready');
    });

    it('should update state and action log when onProgrammaticSwitchOn is called', () => {
        component.onProgrammaticSwitchOn();
        expect(component.lastActionLog()).toContain('switchOn()');
    });

    it('should update state and action log when onProgrammaticSwitchOff is called', () => {
        component.onProgrammaticSwitchOff();
        expect(component.lastActionLog()).toContain('switchOff()');
    });

    it('should update state and action log when onProgrammaticToggle is called', () => {
        component.onProgrammaticToggle();
        expect(component.lastActionLog()).toContain('toggle()');
    });
});
