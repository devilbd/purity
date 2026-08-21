import { Directive, BaseDirective } from '../../../framework/core';
import './highlight.directive.scss';

@Directive('highlight')
export class HighlightDirective extends BaseDirective {
    private currentModifierClass = '';

    onInit() {
        this.element.classList.add('p-highlight');
        this.applyHighlightClass(this.value || 'blue');
    }

    onChanges(newValue: any) {
        this.applyHighlightClass(newValue);
    }

    onDOMChange(recordOrEvent: MutationRecord | Event) {
        if (recordOrEvent instanceof Event && recordOrEvent.type === 'input') {
            const input = this.element as HTMLInputElement;
            if (input.value && input.value.length > 5) {
                this.element.classList.add('p-highlight--valid');
            } else {
                this.element.classList.remove('p-highlight--valid');
            }
        }
    }

    onDestroy() {
        this.element.classList.remove('p-highlight', 'p-highlight--valid');
        if (this.currentModifierClass) {
            this.element.classList.remove(this.currentModifierClass);
        }
    }

    private applyHighlightClass(colorName: string | null | undefined) {
        if (this.currentModifierClass) {
            this.element.classList.remove(this.currentModifierClass);
            this.currentModifierClass = '';
        }

        if (colorName) {
            const cleanName = colorName.replace(/^#|rgba?.*$/, '').trim().toLowerCase();
            const modifier = cleanName.startsWith('p-highlight--')
                ? cleanName
                : `p-highlight--${cleanName || 'blue'}`;

            this.currentModifierClass = modifier;
            this.element.classList.add(modifier);
        }
    }
}
