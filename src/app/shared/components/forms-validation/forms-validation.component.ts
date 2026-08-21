import { Component, defineComponent } from '../../../../framework/core';
import './forms-validation.component.scss';

export class FormsValidationComponent extends Component {
    templateUrl = './src/app/shared/components/forms-validation/forms-validation.component.html';

    constructor() {
        super();
    }
}

defineComponent('forms-validation', FormsValidationComponent);
