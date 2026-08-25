import { Component, ViewChild } from '@purity/core';
import './analogue-clock-sample.component.scss';
import '@widgets/analogue-clock/analogue-clock.component';
import type { AnalogueClockComponent } from '@widgets/analogue-clock/analogue-clock.component';

@Component({
    selector: 'analogue-clock-sample',
    templateUrl: './src/app/pages/analogue-clock-sample/analogue-clock-sample.component.html',
})
export class AnalogueClockSampleComponent {
    @ViewChild('#sample-main-clock')
    mainClock?: AnalogueClockComponent | null;

    @ViewChild('#sample-london-clock')
    londonClock?: AnalogueClockComponent | null;

    @ViewChild('#sample-tokyo-clock')
    tokyoClock?: AnalogueClockComponent | null;

    protected onInit() {
        // Configure secondary world clocks
        if (this.londonClock) {
            this.londonClock.timezone.set('Europe/London');
            this.londonClock.size.set(200);
            this.londonClock.showNumbers.set(false);
        }

        if (this.tokyoClock) {
            this.tokyoClock.timezone.set('Asia/Tokyo');
            this.tokyoClock.size.set(200);
            this.tokyoClock.showNumbers.set(false);
        }
    }
}
