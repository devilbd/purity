import { Component, signal } from '../../../../framework/core';
import '../../directives/highlight.directive';
import './directive-sample.component.scss';

@Component({
    selector: 'directive-sample',
    templateUrl: './src/app/shared/components/directive-sample/directive-sample.component.html',
})
export class DirectiveSampleComponent {
    highlightVariant = signal('green');

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
