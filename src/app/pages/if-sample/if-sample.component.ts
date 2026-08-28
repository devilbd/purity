import { Component, signal } from '@purity/core';
import './if-sample.component.scss';
import '@shared/widgets/analogue-clock/analogue-clock.component';
import '@pages/custom/custom.component';

export type UserRole = 'admin' | 'moderator' | 'member' | 'guest';

export interface TaskItem {
    id: number;
    title: string;
    isHighPriority: boolean;
    isCompleted: boolean;
}

@Component({
    selector: 'if-sample',
    templateUrl: './src/app/pages/if-sample/if-sample.component.html',
})
export class IfSampleComponent {
    // 1. Basic boolean conditional
    showSimpleBox = signal<boolean>(true);
    counter = signal<number>(0);

    // 2. Child component conditional loading
    showClock = signal<boolean>(false);
    showCustom = signal<boolean>(false);

    // 3. Multi-branch if / else-if / else
    activeRole = signal<UserRole>('admin');

    // 4. Structural loop with nested conditionals
    tasks = signal<TaskItem[]>([
        { id: 1, title: 'Implement Signal Reactivity Core', isHighPriority: true, isCompleted: true },
        { id: 2, title: 'Add KDE Plasma Breeze Animated Cursors', isHighPriority: false, isCompleted: true },
        { id: 3, title: 'Build Structural Conditional Directives (if/else)', isHighPriority: true, isCompleted: true },
        { id: 4, title: 'Deploy Purity Framework to Firebase Edge CDN', isHighPriority: false, isCompleted: false },
    ]);

    onlyHighPriority = signal<boolean>(false);

    get filteredTasks(): TaskItem[] {
        if (this.onlyHighPriority()) {
            return this.tasks().filter((t) => t.isHighPriority);
        }
        return this.tasks();
    }

    toggleSimpleBox() {
        this.showSimpleBox.update((v) => !v);
    }

    incrementCounter() {
        this.counter.update((c) => c + 1);
    }

    toggleClock() {
        this.showClock.update((v) => !v);
    }

    toggleCustom() {
        this.showCustom.update((v) => !v);
    }

    setRole(role: UserRole) {
        this.activeRole.set(role);
    }

    togglePriorityFilter() {
        this.onlyHighPriority.update((v) => !v);
    }

    toggleTaskStatus(id: number) {
        this.tasks.update((list) =>
            list.map((task) =>
                task.id === id ? { ...task, isCompleted: !task.isCompleted } : task,
            ),
        );
    }
}
