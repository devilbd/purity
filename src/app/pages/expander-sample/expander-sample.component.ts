import { Component, signal, ViewChild } from '@purity/core';
import './expander-sample.component.scss';
import '@components/expander/expander.component';
import type { ExpanderComponent } from '@components/expander/expander.component';

@Component({
    selector: 'expander-sample',
    templateUrl: './expander-sample.component.html',
})
export class ExpanderSampleComponent {
    @ViewChild('#basic-expander')
    public basicExpander?: (ExpanderComponent & HTMLElement) | null;

    @ViewChild('#icon-expander')
    public iconExpander?: (ExpanderComponent & HTMLElement) | null;

    public isIconExpanded = signal<boolean>(false);
    public lastAction = signal<string>('Ready. Click expander headers directly or use @ViewChild controls.');

    public expandOrCollapseIcon(): string {
        return this.isIconExpanded() ? 'icon-collapse' : 'icon-expand';
    }

    public onIconExpanderChange(event: CustomEvent): void {
        const isExp = event?.detail?.isExpanded ?? false;
        this.isIconExpanded.set(isExp);
        this.lastAction.set(`Icon expander state changed to ${isExp ? 'expanded' : 'collapsed'}`);
    }

    public get isBasicExpanded(): boolean {
        return this.basicExpander?.isExpanded() ?? false;
    }

    public expand(): void {
        this.basicExpander?.expand();
        this.lastAction.set('expand() invoked via @ViewChild');
    }

    public collapse(): void {
        this.basicExpander?.collapse();
        this.lastAction.set('collapse() invoked via @ViewChild');
    }

    public toggle(): void {
        this.basicExpander?.toggle();
        this.lastAction.set('toggle() invoked via @ViewChild');
    }
}
