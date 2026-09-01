import { describe, it, expect, beforeEach } from 'vitest';
import { PopoverSampleComponent } from './popover-sample.component';

describe('PopoverSampleComponent', () => {
    let component: PopoverSampleComponent;

    beforeEach(() => {
        component = new PopoverSampleComponent();
    });

    it('should initialize with default telemetry state', () => {
        expect(component.popoverTriggerCount()).toBe(0);
        expect(component.lastActionLog()).toContain('Hover over any target');
    });

    it('should update state and action log when openProgrammatic is called', () => {
        component.openProgrammatic();
        expect(component.popoverTriggerCount()).toBe(1);
        expect(component.lastActionLog()).toContain('open()');
    });

    it('should update state and action log when closeProgrammatic is called', () => {
        component.closeProgrammatic();
        expect(component.lastActionLog()).toContain('close()');
    });

    it('should update state and action log when toggleProgrammatic is called', () => {
        component.toggleProgrammatic();
        expect(component.popoverTriggerCount()).toBe(1);
        expect(component.lastActionLog()).toContain('toggle()');
    });
});
