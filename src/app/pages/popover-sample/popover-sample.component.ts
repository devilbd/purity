import { Component, ViewChild, signal } from '@purity/core';
import './popover-sample.component.scss';
import '@components/popover/popover.component';
import type { PopoverComponent } from '@components/popover/popover.component';

@Component({
    selector: 'popover-sample',
    templateUrl: './src/app/pages/popover-sample/popover-sample.component.html',
})
export class PopoverSampleComponent {
    @ViewChild('#programmaticPopover')
    private programmaticPopover?: PopoverComponent | null;

    popoverTriggerCount = signal<number>(0);
    lastActionLog = signal<string>('Hover over any target element or click manual trigger buttons.');

    openProgrammatic() {
        this.programmaticPopover?.open('#manual-anchor-target');
        this.popoverTriggerCount.update(c => c + 1);
        this.lastActionLog.set('Programmatic open() invoked via @ViewChild');
    }

    closeProgrammatic() {
        this.programmaticPopover?.close();
        this.lastActionLog.set('Programmatic close() invoked via @ViewChild');
    }

    toggleProgrammatic() {
        this.programmaticPopover?.toggle('#manual-anchor-target');
        this.popoverTriggerCount.update(c => c + 1);
        this.lastActionLog.set('Programmatic toggle() invoked via @ViewChild');
    }
}
