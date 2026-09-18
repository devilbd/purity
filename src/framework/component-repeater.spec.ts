import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Component, signal } from './core';
import '@components/expander/expander.component';
import '@components/switch-button/switch-button.component';
import '@widgets/analogue-clock/analogue-clock.component';
import '@components/loader/loader.component';
import '@components/modal/modal-view.component';
import type { ExpanderComponent } from '@components/expander/expander.component';
import type { SwitchButtonComponent } from '@components/switch-button/switch-button.component';

interface Item {
    id: number;
    title: string;
    body: string;
}

interface Task {
    id: string;
    name: string;
    priority: string;
    notes: string;
}

interface Setting {
    key: string;
    label: string;
    enabled: boolean;
}

interface AccordionItem {
    id: number;
    heading: string;
    open: boolean;
}

interface Process {
    name: string;
    status: string;
    loading: boolean;
}

interface ModalConfig {
    title: string;
    open: boolean;
}

@Component({
    selector: 'test-direct-expander-repeater',
    template: `
        <div class="list">
            <expander for="let item, idx of items" class="item-expander">
                <div class="title">{{ item.title }} (#{{ idx + 1 }})</div>
                <div class="body">{{ item.body }}</div>
            </expander>
        </div>
    `,
})
export class TestDirectExpanderRepeater {
    public items = signal<Item[]>([
        { id: 1, title: 'Alpha Feature', body: 'Alpha details and documentation' },
        { id: 2, title: 'Beta Feature', body: 'Beta details and documentation' },
        { id: 3, title: 'Gamma Feature', body: 'Gamma details and documentation' },
    ]);
}

@Component({
    selector: 'test-nested-expander-repeater',
    template: `
        <div class="tasks-container">
            <div for="let task of tasks" class="task-card">
                <span class="badge">{{ task.priority }}</span>
                <expander class="task-expander">
                    <div class="title">{{ task.name }}</div>
                    <div class="body">{{ task.notes }}</div>
                </expander>
            </div>
        </div>
    `,
})
export class TestNestedExpanderRepeater {
    public tasks = signal<Task[]>([
        { id: 't1', name: 'Write Tests', priority: 'High', notes: 'Ensure 100% coverage' },
        { id: 't2', name: 'Refactor Core', priority: 'Medium', notes: 'Simplify repeater engine' },
    ]);
}

@Component({
    selector: 'test-switch-repeater',
    template: `
        <div class="settings-list">
            <div for="let s of settings" class="setting-row">
                <span class="setting-label">{{ s.label }}</span>
                <switch-button checked="{{ s.enabled }}" class="setting-switch"></switch-button>
            </div>
        </div>
    `,
})
export class TestSwitchRepeater {
    public settings = signal<Setting[]>([
        { key: 'notifications', label: 'Push Notifications', enabled: true },
        { key: 'darkMode', label: 'Dark Mode', enabled: false },
        { key: 'autoSync', label: 'Background Sync', enabled: true },
    ]);
}

@Component({
    selector: 'test-direct-switch-repeater',
    template: `
        <div class="switches-container">
            <switch-button for="let active of states" checked="{{ active }}"></switch-button>
        </div>
    `,
})
export class TestDirectSwitchRepeater {
    public states = signal<boolean[]>([false, true, false]);
}

@Component({
    selector: 'test-reactive-expander-state',
    template: `
        <div class="accordion">
            <expander for="let item of items" is-expanded="{{ item.open }}">
                <div class="title">{{ item.heading }}</div>
                <div class="body">Content for {{ item.heading }}</div>
            </expander>
        </div>
    `,
})
export class TestReactiveExpanderState {
    public items = signal<AccordionItem[]>([
        { id: 1, heading: 'Section 1', open: true },
        { id: 2, heading: 'Section 2', open: false },
    ]);
}

@Component({
    selector: 'test-loader-repeater',
    template: `
        <div class="processes">
            <div for="let p of processes" class="process-card">
                <span class="name">{{ p.name }}</span>
                <loader-component message="{{ p.status }}" is-loading="{{ p.loading }}"></loader-component>
            </div>
        </div>
    `,
})
export class TestLoaderRepeater {
    public processes = signal<Process[]>([
        { name: 'Build', status: 'Compiling...', loading: true },
        { name: 'Lint', status: 'Passed', loading: false },
    ]);
}

@Component({
    selector: 'test-modal-repeater',
    template: `
        <div class="modals">
            <modal-view for="let m of modals" title="{{ m.title }}" is-open="{{ m.open }}">
                <p class="modal-content">Dialog content for {{ m.title }}</p>
            </modal-view>
        </div>
    `,
})
export class TestModalRepeater {
    public modals = signal<ModalConfig[]>([
        { title: 'Confirm Delete', open: false },
        { title: 'Welcome Dialog', open: true },
    ]);
}

@Component({
    selector: 'test-mutation-repeater',
    template: `
        <div class="list">
            <expander for="let name of names">
                <div class="title">{{ name }}</div>
                <div class="body">Body for {{ name }}</div>
            </expander>
        </div>
    `,
})
export class TestMutationRepeater {
    public names = signal<string[]>(['First', 'Second']);
}

const recordedDeletedIds: number[] = [];

@Component({
    selector: 'test-event-repeater',
    template: `
        <div class="items-list">
            <div for="let item of items" class="row">
                <expander class="row-expander">
                    <div class="title">{{ item.name }}</div>
                    <div class="body">
                        <button type="button" class="del-btn" onclick="onDelete(item.id)">Delete</button>
                    </div>
                </expander>
            </div>
        </div>
    `,
})
export class TestEventRepeater {
    public items = signal([
        { id: 101, name: 'Item A' },
        { id: 202, name: 'Item B' },
    ]);

    public onDelete(id: number) {
        recordedDeletedIds.push(id);
    }
}

describe('Repeater with Components (for & virtual-for)', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    it('should repeat <expander> components directly with "for" and bind repeated item context in slot', () => {
        const compEl = document.createElement('test-direct-expander-repeater');
        container.appendChild(compEl);

        const expanders = Array.from(compEl.querySelectorAll('expander')) as (ExpanderComponent & HTMLElement)[];
        expect(expanders.length).toBe(3);

        // Check projected title and body resolution from item context
        const titles = expanders.map((exp) => exp.querySelector('.title')?.textContent?.trim());
        expect(titles[0]).toBe('Alpha Feature (#1)');
        expect(titles[1]).toBe('Beta Feature (#2)');
        expect(titles[2]).toBe('Gamma Feature (#3)');

        const bodies = expanders.map((exp) => exp.querySelector('.body')?.textContent?.trim());
        expect(bodies[0]).toBe('Alpha details and documentation');
        expect(bodies[1]).toBe('Beta details and documentation');
        expect(bodies[2]).toBe('Gamma details and documentation');

        // Verify independent component state
        expect(expanders[0].isExpanded()).toBe(false);
        expect(expanders[1].isExpanded()).toBe(false);

        // Toggle first expander by clicking its title
        const firstTitle = expanders[0].querySelector('.title') as HTMLElement;
        firstTitle.click();

        expect(expanders[0].isExpanded()).toBe(true);
        expect(expanders[1].isExpanded()).toBe(false);
        expect(expanders[2].isExpanded()).toBe(false);

        // Toggle second expander via programmatic method
        expanders[1].expand();
        expect(expanders[1].isExpanded()).toBe(true);
        expect(expanders[2].isExpanded()).toBe(false);
    });

    it('should repeat nested <expander> inside container elements with "for"', () => {
        const compEl = document.createElement('test-nested-expander-repeater');
        container.appendChild(compEl);

        const taskCards = compEl.querySelectorAll('.task-card');
        expect(taskCards.length).toBe(2);

        const expanders = Array.from(compEl.querySelectorAll('expander')) as (ExpanderComponent & HTMLElement)[];
        expect(expanders.length).toBe(2);

        expect(expanders[0].querySelector('.title')?.textContent?.trim()).toBe('Write Tests');
        expect(expanders[0].querySelector('.body')?.textContent?.trim()).toBe('Ensure 100% coverage');

        expect(expanders[1].querySelector('.title')?.textContent?.trim()).toBe('Refactor Core');
        expect(expanders[1].querySelector('.body')?.textContent?.trim()).toBe('Simplify repeater engine');

        // Test interaction
        expanders[0].expand();
        expect(expanders[0].isExpanded()).toBe(true);
        expect(expanders[1].isExpanded()).toBe(false);
    });

    it('should repeat <switch-button> and synchronize boolean "checked" attribute to component signal', () => {
        const compEl = document.createElement('test-switch-repeater');
        container.appendChild(compEl);

        const switches = Array.from(compEl.querySelectorAll('switch-button')) as (SwitchButtonComponent & HTMLElement)[];
        expect(switches.length).toBe(3);

        expect(switches[0].isOn()).toBe(true);
        expect(switches[0].checked()).toBe(true);
        expect(switches[1].isOn()).toBe(false);
        expect(switches[1].checked()).toBe(false);
        expect(switches[2].isOn()).toBe(true);
        expect(switches[2].checked()).toBe(true);

        // Verify class synchronization
        expect(switches[0].classList.contains('is-on')).toBe(true);
        expect(switches[1].classList.contains('is-on')).toBe(false);
        expect(switches[2].classList.contains('is-on')).toBe(true);

        // Toggle switch #1 by clicking
        switches[1].click();
        expect(switches[1].isOn()).toBe(true);
        expect(switches[1].checked()).toBe(true);
        expect(switches[1].classList.contains('is-on')).toBe(true);
    });

    it('should support direct repeater on <switch-button for="let s of switches">', () => {
        const compEl = document.createElement('test-direct-switch-repeater');
        container.appendChild(compEl);

        const switches = Array.from(compEl.querySelectorAll('switch-button')) as (SwitchButtonComponent & HTMLElement)[];
        expect(switches.length).toBe(3);

        expect(switches[0].isOn()).toBe(false);
        expect(switches[1].isOn()).toBe(true);
        expect(switches[2].isOn()).toBe(false);
    });

    it('should synchronize reactive attributes (is-expanded) from repeated item to component signals', () => {
        const compEl = document.createElement('test-reactive-expander-state');
        container.appendChild(compEl);

        const expanders = Array.from(compEl.querySelectorAll('expander')) as (ExpanderComponent & HTMLElement)[];
        expect(expanders.length).toBe(2);

        expect(expanders[0].isExpanded()).toBe(true);
        expect(expanders[1].isExpanded()).toBe(false);
    });

    it('should synchronize attributes on repeated <loader-component>', () => {
        const compEl = document.createElement('test-loader-repeater');
        container.appendChild(compEl);

        const loaders = Array.from(compEl.querySelectorAll('loader-component')) as any[];
        expect(loaders.length).toBe(2);

        expect(loaders[0].message()).toBe('Compiling...');
        expect(loaders[0].isLoading()).toBe(true);
        expect(loaders[1].message()).toBe('Passed');
        expect(loaders[1].isLoading()).toBe(false);
    });

    it('should synchronize attributes on repeated <modal-view>', () => {
        const compEl = document.createElement('test-modal-repeater');
        container.appendChild(compEl);

        const modalViews = Array.from(compEl.querySelectorAll('modal-view')) as any[];
        expect(modalViews.length).toBe(2);

        expect(modalViews[0].title()).toBe('Confirm Delete');
        expect(modalViews[0].isOpen()).toBe(false);
        expect(modalViews[1].title()).toBe('Welcome Dialog');
        expect(modalViews[1].isOpen()).toBe(true);
    });

    it('should handle array mutations reactively with repeated components', () => {
        const compEl = document.createElement('test-mutation-repeater');
        container.appendChild(compEl);

        const hostInstance = (compEl as any);
        expect(compEl.querySelectorAll('expander').length).toBe(2);

        // Add an item dynamically
        hostInstance.names.update((arr: string[]) => [...arr, 'Third']);

        const expandersAfterAdd = Array.from(compEl.querySelectorAll('expander')) as (ExpanderComponent & HTMLElement)[];
        expect(expandersAfterAdd.length).toBe(3);
        expect(expandersAfterAdd[2].querySelector('.title')?.textContent?.trim()).toBe('Third');

        // Remove the second item
        hostInstance.names.update((arr: string[]) => arr.filter((n: string) => n !== 'Second'));

        const expandersAfterRemove = Array.from(compEl.querySelectorAll('expander')) as (ExpanderComponent & HTMLElement)[];
        expect(expandersAfterRemove.length).toBe(2);
        expect(expandersAfterRemove[0].querySelector('.title')?.textContent?.trim()).toBe('First');
        expect(expandersAfterRemove[1].querySelector('.title')?.textContent?.trim()).toBe('Third');
    });

    it('should bind repeated item in event handlers on or inside components', () => {
        recordedDeletedIds.length = 0;

        const compEl = document.createElement('test-event-repeater');
        container.appendChild(compEl);

        const deleteButtons = Array.from(compEl.querySelectorAll('.del-btn')) as HTMLButtonElement[];
        expect(deleteButtons.length).toBe(2);

        // Click delete on Item B
        deleteButtons[1].click();
        expect(recordedDeletedIds).toEqual([202]);

        // Click delete on Item A
        deleteButtons[0].click();
        expect(recordedDeletedIds).toEqual([202, 101]);
    });
});
