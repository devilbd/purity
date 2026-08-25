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
}
