import { Component, defineComponent } from '../../../../framework/core';
import './header.component.scss';

export class HeaderComponent extends Component {
    templateUrl = './src/app/shared/components/header/header.component.html';

    constructor() {
        super();
    }
}

defineComponent('header-component', HeaderComponent);
