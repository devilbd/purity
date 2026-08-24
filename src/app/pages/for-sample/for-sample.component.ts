import { Component, signal } from '@purity/core';
import './for-sample.component.scss';

export interface TeamMember {
    id: number;
    name: string;
    role: string;
    status: 'active' | 'busy' | 'offline';
    tags: string[];
}

@Component({
    selector: 'for-sample',
    templateUrl: './src/app/pages/for-sample/for-sample.component.html',
})
export class ForSampleComponent {
    newName = signal<string>('');
    newRole = signal<string>('');

    members = signal<TeamMember[]>([
        {
            id: 1,
            name: 'Alice Cooper',
            role: 'Lead Architect',
            status: 'active',
            tags: ['TypeScript', 'Reactivity', 'Custom Elements'],
        },
        {
            id: 2,
            name: 'Bob Dylan',
            role: 'Senior Frontend Engineer',
            status: 'busy',
            tags: ['SCSS', 'Adwaita Design', 'Pipes'],
        },
        {
            id: 3,
            name: 'Charlie Watts',
            role: 'UI/UX Specialist',
            status: 'offline',
            tags: ['Behaviors', 'Drag & Drop', 'Validation'],
        },
    ]);

    get memberCount() {
        return this.members().length;
    }

    protected onInit() {
        (window as any).forSample = this;
    }

    onNameInput(element: HTMLInputElement) {
        this.newName.set(element.value);
    }

    onRoleInput(element: HTMLInputElement) {
        this.newRole.set(element.value);
    }

    onAddMember() {
        const name = this.newName().trim();
        const role = this.newRole().trim() || 'Software Engineer';
        if (!name) return;

        const newEntry: TeamMember = {
            id: Date.now(),
            name,
            role,
            status: 'active',
            tags: ['New Member', 'Purity'],
        };

        this.members.update((list) => [...list, newEntry]);
        this.newName.set('');
        this.newRole.set('');
    }

    onRemoveMember(id: number) {
        this.members.update((list) => list.filter((m) => m.id !== id));
    }
}
