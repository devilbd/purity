import { Component, signal } from '@purity/core';
import '@directives/highlight/highlight.directive';
import './directive-sample.component.scss';

@Component({
    selector: 'directive-sample',
    templateUrl: './src/app/pages/directive-sample/directive-sample.component.html',
})
export class DirectiveSampleComponent {
    highlightVariant = signal('green');
    selectedDropdownItem = signal<string>('None selected yet');

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

    onParentWhereIsConsumedClick(itemName: string) {
        this.selectedDropdownItem.set(itemName);
    }
}
