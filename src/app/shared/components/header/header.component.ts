import { Component, defineComponent } from '../../../../framework/core';
import './header.component.scss';

export class HeaderComponent extends Component {
    templateUrl = './src/app/shared/components/header/header.component.html';

    constructor() {
        super();
    }

    protected onInit() {
        this.domInitializer();
    }

    domInitializer() {}
}

defineComponent('header-component', HeaderComponent);
