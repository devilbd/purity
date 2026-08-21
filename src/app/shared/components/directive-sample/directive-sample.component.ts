import { Component, defineComponent, signal } from '../../../../framework/core';
import '../../directives/highlight.directive';
import './directive-sample.component.scss';

export class DirectiveSampleComponent extends Component {
    templateUrl = './src/app/shared/components/directive-sample/directive-sample.component.html';

    highlightVariant = signal('green');

    constructor() {
        super();
    }

    setGreen() {
        this.highlightVariant.set('green');
    }

    setBlue() {
        this.highlightVariant.set('blue');
    }

    setGold() {
        this.highlightVariant.set('gold');
    }

    setRed() {
        this.highlightVariant.set('red');
    }
}

defineComponent('directive-sample', DirectiveSampleComponent);
