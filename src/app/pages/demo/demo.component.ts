import { Component } from '@purity/core';
import './demo.component.scss';

// Packaged Showcase / Sample Components
import '@pages/forms-validation/forms-validation.component';
import '@pages/directive-sample/directive-sample.component';
import '@pages/pipe-sample/pipe-sample.component';
import '@pages/for-sample/for-sample.component';
import '@pages/if-sample/if-sample.component';
import '@pages/virtual-for-sample/virtual-for-sample.component';
import '@pages/date-time-picker-sample/date-time-picker-sample.component';
import '@pages/analogue-clock-sample/analogue-clock-sample.component';
import '@pages/radial-context-menu-sample/radial-context-menu-sample.component';
import '@pages/http-sample/http-sample.component';
import '@pages/notification-sample/notification-sample.component';
import '@pages/modal-sample/modal-sample.component';
import '@pages/router-sample/router-sample.component';
import '@pages/empty-sample/empty-sample.component';
import '@components/loader/loader.component';

@Component({
    selector: 'demo-component',
    templateUrl: './src/app/pages/demo/demo.component.html',
})
export class DemoComponent {}
