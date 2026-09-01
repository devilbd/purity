export interface CodePreset {
    id: string;
    name: string;
    description: string;
    ts: string;
    html: string;
    scss: string;
    spec?: string;
    isCustom?: boolean;
    createdAt?: number;
}

export const PLAYGROUND_PRESETS: CodePreset[] = [
    {
        id: 'loader-async',
        name: '⏳ Dynamic Components & Loader',
        description: 'Multi-component architecture, dynamic sub-components, and <loader-component>.',
        ts: `import { Component, signal, effect, ViewChild } from '@purity/core';
import type { LoaderComponent } from '@components/loader/loader.component';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    @ViewChild()
    private loader?: LoaderComponent | null;

    @ViewChild()
    private testDemoComponent?: TestDemoComponent | null;

    selectedUser = signal('');
    users = signal([
        'Alice Smith',
        'Bob Johnson',
        'Charlie Brown'
    ]);

    onSelectUser(event: Event, user: string) {
        this.loader?.show(\`Loading profile for \${user}...\`);
        setTimeout(() => {
            this.loader?.hide();
            this.selectedUser.set(user);
        }, 1200);
    }
}

@Component({
    selector: 'test-demo-component',
    template: '<div class="test-badge">✨ Dynamic Sub-Component Active</div>',
})
export class TestDemoComponent {}`,
        html: `<div class="user-select-card window">
    <h3>👤 Select User Profile</h3>
    
    <!-- Purity UI Loader Component (Implicitly resolved by @ViewChild) -->
    <loader-component></loader-component>

    <!-- Dynamic Sub-Component (Implicitly resolved by @ViewChild) -->
    <test-demo-component></test-demo-component>

    <div class="user-list">
        <div for="let user of users" class="user-item">
            <button
                type="button"
                class="button-secondary user-btn"
                onclick="onSelectUser(event, user)"
            >
                Select {{user}}
            </button>
        </div>
    </div>

    <div class="selected-result">
        <span>Active User: <strong>{{selectedUser() || 'None selected'}}</strong></span>
    </div>
</div>`,
        scss: `.user-select-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border: 1px solid rgba(130, 170, 255, 0.2);
    border-radius: 12px;
    color: #eeffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

    h3 {
        margin: 0;
        color: #82aaff;
    }

    .test-badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        background: rgba(130, 170, 255, 0.15);
        border: 1px dashed rgba(130, 170, 255, 0.4);
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        color: #82aaff;
    }

    .user-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .user-btn {
        width: 100%;
        text-align: left;
        padding: 10px 14px;
        border-radius: 8px;
        background: #292d3e;
        color: #eeffff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
            background: #32374d;
            border-color: #82aaff;
            transform: translateX(4px);
        }
    }

    .selected-result {
        padding: 12px 16px;
        background: #292d3e;
        border-radius: 8px;
        border-left: 4px solid #82aaff;
        font-size: 14px;

        strong {
            color: #c3e88d;
        }
    }
}`,
        spec: `import { describe, it, expect, beforeEach } from 'vitest';

describe('Loader & Dynamic Sub-Component Spec', () => {
    let component: PlaygroundDemoComponent;

    beforeEach(() => {
        component = new PlaygroundDemoComponent();
    });

    it('should instantiate PlaygroundDemoComponent', () => {
        expect(component).toBeDefined();
        expect(typeof component.onSelectUser).toBe('function');
    });

    it('should initialize with users list signal', () => {
        expect(component.users()).toHaveLength(3);
        expect(component.users()).toContain('Alice Smith');
        expect(component.users()).toContain('Bob Johnson');
        expect(component.users()).toContain('Charlie Brown');
    });

    it('should initialize with empty selectedUser', () => {
        expect(component.selectedUser()).toBe('');
    });
});`,
    },
    {
        id: 'counter',
        name: '🔢 Reactive Counter & Computed',
        description: 'Fine-grained signals, computed values, and synchronous DOM reactivity.',
        ts: `import { Component, signal, computed } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    count = signal(0);
    step = signal(1);

    // Derived reactive computed values
    doubleCount = computed(() => this.count() * 2);
    isEven = computed(() => this.count() % 2 === 0);
    isNegative = computed(() => this.count() < 0);

    increment() {
        this.count.update(n => n + this.step());
    }

    decrement() {
        this.count.update(n => n - this.step());
    }

    reset() {
        this.count.set(0);
    }

    setStep(val: number) {
        this.step.set(val);
    }
}`,
        html: `<div class="counter-card window">
    <h2>⚡ Fine-Grained Reactive Counter</h2>
    <p class="subtitle">Updates with sub-microsecond synchronous precision without Virtual DOM.</p>

    <div class="display-grid">
        <div class="stat-box primary">
            <span class="stat-label">Current Count</span>
            <span class="stat-value {{isNegative() ? 'negative' : ''}}">{{count()}}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Double (Computed)</span>
            <span class="stat-value">{{doubleCount()}}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Parity</span>
            <span class="stat-value badge {{isEven() ? 'even' : 'odd'}}">
                {{isEven() ? 'EVEN' : 'ODD'}}
            </span>
        </div>
    </div>

    <!-- Step Controller -->
    <div class="step-selector">
        <span class="step-label">Step Size:</span>
        <button type="button" class="step-btn {{step() === 1 ? 'active' : ''}}" onclick="setStep(1)">1x</button>
        <button type="button" class="step-btn {{step() === 5 ? 'active' : ''}}" onclick="setStep(5)">5x</button>
        <button type="button" class="step-btn {{step() === 10 ? 'active' : ''}}" onclick="setStep(10)">10x</button>
    </div>

    <!-- Action Buttons -->
    <div class="button-group">
        <button type="button" class="action-btn dec-btn" onclick="decrement()">- Decrement</button>
        <button type="button" class="action-btn reset-btn" onclick="reset()">Reset</button>
        <button type="button" class="action-btn inc-btn" onclick="increment()">+ Increment</button>
    </div>
</div>`,
        scss: `.counter-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: #232635;
    border: 1px solid rgba(199, 146, 234, 0.25);
    border-radius: 12px;
    color: #eeffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

    h2 {
        margin: 0;
        font-size: 1.35rem;
        color: #c792ea;
    }

    .subtitle {
        margin: 0;
        font-size: 13px;
        color: #89ddff;
        opacity: 0.8;
    }

    .display-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
    }

    .stat-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 14px;
        background: #292d3e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        gap: 6px;

        &.primary {
            border-color: rgba(199, 146, 234, 0.4);
            background: rgba(199, 146, 234, 0.08);
        }

        .stat-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #89ddff;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #c792ea;

            &.negative {
                color: #ff5370;
            }

            &.badge {
                font-size: 12px;
                padding: 4px 10px;
                border-radius: 999px;

                &.even {
                    background: rgba(195, 232, 141, 0.2);
                    color: #c3e88d;
                }

                &.odd {
                    background: rgba(255, 203, 107, 0.2);
                    color: #ffcb6b;
                }
            }
        }
    }

    .step-selector {
        display: flex;
        align-items: center;
        gap: 8px;

        .step-label {
            font-size: 13px;
            color: #89ddff;
        }

        .step-btn {
            padding: 4px 12px;
            border-radius: 6px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: #292d3e;
            color: #eeffff;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;

            &.active {
                background: #c792ea;
                color: #1a1a24;
                border-color: #c792ea;
            }
        }
    }

    .button-group {
        display: flex;
        gap: 10px;

        .action-btn {
            flex: 1;
            padding: 10px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: transform 0.15s ease;

            &:active {
                transform: scale(0.97);
            }

            &.inc-btn {
                background: #c792ea;
                color: #1a1a24;
            }

            &.dec-btn {
                background: #292d3e;
                color: #eeffff;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            &.reset-btn {
                background: transparent;
                color: #89ddff;
                border: 1px dashed rgba(137, 221, 255, 0.4);
            }
        }
    }
}`,
        spec: `import { describe, it, expect, beforeEach } from 'vitest';

describe('Reactive Counter & Computed Signals Spec', () => {
    let component: PlaygroundDemoComponent;

    beforeEach(() => {
        component = new PlaygroundDemoComponent();
    });

    it('should initialize count to 0 and default step to 1', () => {
        expect(component.count()).toBe(0);
        expect(component.step()).toBe(1);
    });

    it('should increment and decrement count by step', () => {
        component.increment();
        expect(component.count()).toBe(1);

        component.setStep(5);
        component.increment();
        expect(component.count()).toBe(6);

        component.decrement();
        expect(component.count()).toBe(1);
    });

    it('should compute doubleCount reactively', () => {
        component.count.set(5);
        expect(component.doubleCount()).toBe(10);
        component.count.set(-4);
        expect(component.doubleCount()).toBe(-8);
    });

    it('should derive isEven and isNegative signals accurately', () => {
        component.count.set(4);
        expect(component.isEven()).toBe(true);
        expect(component.isNegative()).toBe(false);

        component.count.set(-3);
        expect(component.isEven()).toBe(false);
        expect(component.isNegative()).toBe(true);
    });

    it('should reset count to 0', () => {
        component.count.set(42);
        component.reset();
        expect(component.count()).toBe(0);
    });
});`,
    },
    {
        id: 'pipes',
        name: '🚰 Transform Pipes & Expressions',
        description: 'Handlebars data transformers with pipe chaining and dynamic arguments.',
        ts: `import { Component, signal, Pipe, BasePipe } from '@purity/core';

@Pipe('currency')
export class CurrencyPipe extends BasePipe {
    transform(val: number, symbol = '$', decimals = 2): string {
        if (typeof val !== 'number') return String(val);
        return \`\${symbol}\${val.toFixed(decimals)}\`;
    }
}

@Pipe('truncate')
export class TruncatePipe extends BasePipe {
    transform(val: string, maxLen = 20, suffix = '...'): string {
        if (!val || typeof val !== 'string') return '';
        return val.length > maxLen ? val.slice(0, maxLen) + suffix : val;
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    productName = signal('Purity Reactive Framework Pro Edition');
    price = signal(149.95);
    currencySymbol = signal('€');
    currentDate = signal(new Date().toLocaleDateString());

    setDollar() {
        this.currencySymbol.set('$');
    }

    setEuro() {
        this.currencySymbol.set('€');
    }

    setYen() {
        this.currencySymbol.set('¥');
    }
}`,
        html: `<div class="pipe-card window">
    <h2>🚰 Transform Pipes Demo</h2>

    <div class="pipe-row">
        <span class="label">Original Name:</span>
        <span class="val">{{productName()}}</span>
    </div>

    <div class="pipe-row">
        <span class="label">Uppercase Pipe:</span>
        <span class="val highlight">{{productName() | uppercase}}</span>
    </div>

    <div class="pipe-row">
        <span class="label">Truncate Pipe:</span>
        <span class="val">{{productName() | truncate: 18 : ' →'}}</span>
    </div>

    <div class="pipe-row">
        <span class="label">Formatted Price:</span>
        <span class="val price">{{price() | currency: currencySymbol() : 2}}</span>
    </div>

    <!-- Currency Switcher -->
    <div class="currency-actions">
        <button type="button" class="curr-btn {{currencySymbol() === '$' ? 'active' : ''}}" onclick="setDollar()">$ USD</button>
        <button type="button" class="curr-btn {{currencySymbol() === '€' ? 'active' : ''}}" onclick="setEuro()">€ EUR</button>
        <button type="button" class="curr-btn {{currencySymbol() === '¥' ? 'active' : ''}}" onclick="setYen()">¥ JPY</button>
    </div>
</div>`,
        scss: `.pipe-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border: 1px solid rgba(247, 140, 108, 0.25);
    border-radius: 12px;
    color: #eeffff;

    h2 {
        margin: 0;
        color: #f78c6c;
        font-size: 1.3rem;
    }

    .pipe-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        background: #292d3e;
        border-radius: 8px;
        font-size: 13px;

        .label {
            color: #89ddff;
            font-weight: 600;
        }

        .val {
            color: #eeffff;
            font-family: monospace;

            &.highlight {
                color: #c3e88d;
                font-weight: 700;
            }

            &.price {
                color: #ffcb6b;
                font-size: 16px;
                font-weight: 700;
            }
        }
    }

    .currency-actions {
        display: flex;
        gap: 8px;
        margin-top: 4px;

        .curr-btn {
            flex: 1;
            padding: 8px;
            background: #292d3e;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            color: #eeffff;
            cursor: pointer;
            font-weight: 600;

            &.active {
                background: #f78c6c;
                color: #1a1a24;
                border-color: #f78c6c;
            }
        }
    }
}`,
        spec: `import { describe, it, expect, beforeEach } from 'vitest';

describe('Transform Pipes & Component Spec', () => {
    let component: PlaygroundDemoComponent;

    beforeEach(() => {
        component = new PlaygroundDemoComponent();
    });

    it('should initialize component signals', () => {
        expect(component.productName()).toBe('Purity Reactive Framework Pro Edition');
        expect(component.price()).toBe(149.95);
        expect(component.currencySymbol()).toBe('€');
    });

    it('should switch currency symbols', () => {
        component.setDollar();
        expect(component.currencySymbol()).toBe('$');

        component.setYen();
        expect(component.currencySymbol()).toBe('¥');

        component.setEuro();
        expect(component.currencySymbol()).toBe('€');
    });

    it('should transform price using CurrencyPipe', () => {
        const pipe = new CurrencyPipe();
        expect(pipe.transform(149.95, '$', 2)).toBe('$149.95');
        expect(pipe.transform(149.95, '€', 2)).toBe('€149.95');
    });

    it('should truncate strings using TruncatePipe', () => {
        const pipe = new TruncatePipe();
        expect(pipe.transform('Purity Reactive Framework Pro Edition', 18, ' →')).toBe('Purity Reactive Fr →');
    });
});`,
    },
    {
        id: 'array-loop',
        name: '🔁 Structural Array Repeater (for)',
        description: 'Nested loops, index projection, and fine-grained array updates.',
        ts: `import { Component, signal } from '@purity/core';

export interface Task {
    id: number;
    title: string;
    completed: boolean;
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    newTaskTitle = signal('');
    tasks = signal<Task[]>([
        { id: 1, title: 'Learn Purity Signals', completed: true },
        { id: 2, title: 'Build Web Component UI', completed: false },
        { id: 3, title: 'Write Vitest Suite', completed: false },
    ]);

    onInputChange(e: Event) {
        const target = e.target as HTMLInputElement;
        this.newTaskTitle.set(target.value);
    }

    addTask() {
        const title = this.newTaskTitle().trim();
        if (!title) return;
        this.tasks.update(list => [
            ...list,
            { id: Date.now(), title, completed: false }
        ]);
        this.newTaskTitle.set('');
    }

    toggleTask(taskId: number) {
        this.tasks.update(list =>
            list.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        );
    }

    deleteTask(taskId: number) {
        this.tasks.update(list => list.filter(t => t.id !== taskId));
    }
}`,
        html: `<div class="todo-card window">
    <h2>📋 Structural Array Repeater (for)</h2>

    <!-- Input Add Bar -->
    <div class="input-bar">
        <input
            type="text"
            class="input-primary"
            placeholder="Add new task..."
            value="{{newTaskTitle()}}"
            oninput="onInputChange(event)"
        />
        <button type="button" class="button-primary add-btn" onclick="addTask()">+ Add</button>
    </div>

    <!-- Reactive Task Repeater Loop -->
    <div class="task-list">
        <div for="let task, index of tasks" class="task-item {{task.completed ? 'is-done' : ''}}">
            <span class="task-index">#{{index + 1}}</span>
            <span class="task-title" onclick="toggleTask(task.id)">{{task.title}}</span>
            <button type="button" class="delete-btn" onclick="deleteTask(task.id)">✕</button>
        </div>
    </div>
</div>`,
        scss: `.todo-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border: 1px solid rgba(137, 221, 255, 0.25);
    border-radius: 12px;
    color: #eeffff;

    h2 {
        margin: 0;
        color: #89ddff;
        font-size: 1.3rem;
    }

    .input-bar {
        display: flex;
        gap: 8px;

        input {
            flex: 1;
            padding: 10px 14px;
            background: #292d3e;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #eeffff;
            outline: none;

            &:focus {
                border-color: #89ddff;
            }
        }

        .add-btn {
            padding: 10px 18px;
            background: #89ddff;
            color: #1a1a24;
            font-weight: 700;
            border-radius: 8px;
            border: none;
            cursor: pointer;
        }
    }

    .task-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .task-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        background: #292d3e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        transition: all 0.2s ease;

        &.is-done {
            opacity: 0.6;

            .task-title {
                text-decoration: line-through;
                color: #89ddff;
            }
        }

        .task-index {
            font-size: 11px;
            font-weight: 700;
            color: #82aaff;
        }

        .task-title {
            flex: 1;
            cursor: pointer;
            font-size: 13.5px;
        }

        .delete-btn {
            background: transparent;
            border: none;
            color: #ff5370;
            cursor: pointer;
            font-size: 14px;
            padding: 4px;
        }
    }
}`,
        spec: `import { describe, it, expect, beforeEach } from 'vitest';

describe('Structural Array Repeater (for) Spec', () => {
    let component: PlaygroundDemoComponent;

    beforeEach(() => {
        component = new PlaygroundDemoComponent();
    });

    it('should initialize with default tasks list', () => {
        expect(component.tasks()).toHaveLength(3);
        expect(component.tasks()[0].title).toBe('Learn Purity Signals');
        expect(component.tasks()[0].completed).toBe(true);
    });

    it('should add a new task when addTask is called', () => {
        component.newTaskTitle.set('Test in playground');
        component.addTask();

        expect(component.tasks()).toHaveLength(4);
        expect(component.tasks()[3].title).toBe('Test in playground');
        expect(component.tasks()[3].completed).toBe(false);
        expect(component.newTaskTitle()).toBe('');
    });

    it('should toggle task completion state', () => {
        const firstTaskId = component.tasks()[0].id;
        expect(component.tasks()[0].completed).toBe(true);

        component.toggleTask(firstTaskId);
        expect(component.tasks()[0].completed).toBe(false);
    });

    it('should delete task by ID', () => {
        const targetId = component.tasks()[1].id;
        component.deleteTask(targetId);

        expect(component.tasks()).toHaveLength(2);
        expect(component.tasks().find(t => t.id === targetId)).toBeUndefined();
    });
});`,
    },
    {
        id: 'conditional',
        name: '🔀 Structural Conditionals (if, else-if, else)',
        description: 'Multi-branch conditional hierarchy with deferred component mounting.',
        ts: `import { Component, signal } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    role = signal<'admin' | 'moderator' | 'guest'>('guest');

    setRole(newRole: 'admin' | 'moderator' | 'guest') {
        this.role.set(newRole);
    }
}`,
        html: `<div class="auth-card window">
    <h2>🔀 Structural Conditionals</h2>

    <!-- Role Switcher -->
    <div class="role-selector">
        <button type="button" class="role-btn {{role() === 'admin' ? 'active' : ''}}" onclick="setRole('admin')">Admin</button>
        <button type="button" class="role-btn {{role() === 'moderator' ? 'active' : ''}}" onclick="setRole('moderator')">Moderator</button>
        <button type="button" class="role-btn {{role() === 'guest' ? 'active' : ''}}" onclick="setRole('guest')">Guest</button>
    </div>

    <!-- Conditional Branches -->
    <div if="role() === 'admin'" class="panel admin-panel">
        <h3>🛡️ Administrator Console</h3>
        <p>Full read/write/delete system permissions granted.</p>
    </div>
    <div else-if="role() === 'moderator'" class="panel mod-panel">
        <h3>⚖️ Moderator Tools</h3>
        <p>User flagging and message curation access enabled.</p>
    </div>
    <div else class="panel guest-panel">
        <h3>👤 Guest Visitor</h3>
        <p>Read-only public view. Please log in for privileges.</p>
    </div>
</div>`,
        scss: `.auth-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    background: #232635;
    border: 1px solid rgba(195, 232, 141, 0.25);
    border-radius: 12px;
    color: #eeffff;

    h2 {
        margin: 0;
        color: #c3e88d;
        font-size: 1.3rem;
    }

    .role-selector {
        display: flex;
        gap: 8px;

        .role-btn {
            flex: 1;
            padding: 8px;
            background: #292d3e;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            color: #eeffff;
            cursor: pointer;
            font-weight: 600;

            &.active {
                background: #c3e88d;
                color: #1a1a24;
                border-color: #c3e88d;
            }
        }
    }

    .panel {
        padding: 16px;
        border-radius: 8px;

        h3 {
            margin: 0 0 6px 0;
        }

        p {
            margin: 0;
            font-size: 13px;
            opacity: 0.9;
        }

        &.admin-panel {
            background: rgba(255, 83, 112, 0.15);
            border: 1px solid rgba(255, 83, 112, 0.4);
            color: #ff5370;
        }

        &.mod-panel {
            background: rgba(255, 203, 107, 0.15);
            border: 1px solid rgba(255, 203, 107, 0.4);
            color: #ffcb6b;
        }

        &.guest-panel {
            background: rgba(137, 221, 255, 0.15);
            border: 1px solid rgba(137, 221, 255, 0.4);
            color: #89ddff;
        }
    }
}`,
        spec: `import { describe, it, expect, beforeEach } from 'vitest';

describe('Structural Conditionals Spec', () => {
    let component: PlaygroundDemoComponent;

    beforeEach(() => {
        component = new PlaygroundDemoComponent();
    });

    it('should initialize with guest role', () => {
        expect(component.role()).toBe('guest');
    });

    it('should update role when setRole is called', () => {
        component.setRole('admin');
        expect(component.role()).toBe('admin');

        component.setRole('moderator');
        expect(component.role()).toBe('moderator');

        component.setRole('guest');
        expect(component.role()).toBe('guest');
    });
});`,
    },
    {
        id: 'dropdown',
        name: '🔽 Glassmorphic Dropdown Directive',
        description: 'Native dropdown directive with portal teleportation and keyboard navigation.',
        ts: `import { Component, signal } from '@purity/core';
import '@directives/dropdown/dropdown.directive';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    selectedCategory = signal('Web Components');
    selectedFramework = signal('Purity Core');
    lastActionLog = signal('Ready');

    onSelectCategory(category: string) {
        this.selectedCategory.set(category);
        this.lastActionLog.set(\`Category selected: \${category}\`);
    }

    onSelectFramework(framework: string) {
        this.selectedFramework.set(framework);
        this.lastActionLog.set(\`Framework selected: \${framework}\`);
    }

    onReset() {
        this.selectedCategory.set('Web Components');
        this.selectedFramework.set('Purity Core');
        this.lastActionLog.set('Selections reset to defaults');
    }
}`,
        html: `<div class="dropdown-demo-card">
    <div class="demo-header">
        <h3>🔽 Glassmorphic Dropdowns</h3>
        <p class="demo-subtitle">Demonstrating declarative dropdown directives with keyboard navigation.</p>
    </div>

    <div class="dropdowns-grid">
        <div class="dropdown-panel">
            <label class="panel-label">Technology</label>
            <dropdown label="{{selectedCategory()}}" class="custom-dd">
                <ul>
                    <li onclick="onSelectCategory('Web Components')">
                        <span class="item-icon">🧩</span>
                        <span class="item-text">Web Components</span>
                    </li>
                    <li onclick="onSelectCategory('Fine-Grained Signals')">
                        <span class="item-icon">⚡</span>
                        <span class="item-text">Fine-Grained Signals</span>
                    </li>
                    <li onclick="onSelectCategory('Custom Elements v1')">
                        <span class="item-icon">🚀</span>
                        <span class="item-text">Custom Elements v1</span>
                    </li>
                </ul>
            </dropdown>
        </div>

        <div class="dropdown-panel">
            <label class="panel-label">Module / Service</label>
            <dropdown label="{{selectedFramework()}}" class="custom-dd">
                <ul>
                    <li onclick="onSelectFramework('Purity Core')">
                        <span class="item-icon">📦</span>
                        <span class="item-text">@purity/core</span>
                    </li>
                    <li onclick="onSelectFramework('Theme Engine')">
                        <span class="item-icon">🌓</span>
                        <span class="item-text">Theme Engine</span>
                    </li>
                    <li onclick="onSelectFramework('Signal Router')">
                        <span class="item-icon">🗺️</span>
                        <span class="item-text">Signal Router</span>
                    </li>
                </ul>
            </dropdown>
        </div>
    </div>

    <div class="status-output">
        <div class="status-row">
            <span class="status-key">Active Selection:</span>
            <span class="status-pill">{{selectedCategory()}} / {{selectedFramework()}}</span>
        </div>
        <div class="status-row">
            <span class="status-key">Event Log:</span>
            <span class="status-text">{{lastActionLog()}}</span>
        </div>
    </div>

    <div class="demo-actions">
        <button type="button" class="button-secondary" onclick="onReset()">
            🔄 Reset Selections
        </button>
    </div>
</div>`,
        scss: `.dropdown-demo-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
    border-radius: 12px;
    background: #232635;
    border: 1px solid rgba(130, 170, 255, 0.2);
    color: #eeffff;

    .demo-header {
        h3 {
            margin: 0 0 6px 0;
            color: #82aaff;
        }

        .demo-subtitle {
            margin: 0;
            font-size: 13px;
            color: #89ddff;
            opacity: 0.8;
        }
    }

    .dropdowns-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .dropdown-panel {
            display: flex;
            flex-direction: column;
            gap: 6px;

            .panel-label {
                font-size: 12px;
                font-weight: 600;
                color: #89ddff;
            }
        }
    }

    .status-output {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 8px;
        background: #292d3e;
        border: 1px solid rgba(255, 255, 255, 0.08);

        .status-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;

            .status-key {
                font-weight: 600;
                color: #89ddff;
            }

            .status-pill {
                color: #c3e88d;
                font-weight: 700;
            }

            .status-text {
                color: #eeffff;
            }
        }
    }

    .demo-actions {
        display: flex;
        justify-content: flex-end;

        button {
            padding: 8px 16px;
            background: #292d3e;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            color: #eeffff;
            cursor: pointer;
        }
    }
}`,
        spec: `import { describe, it, expect, beforeEach } from 'vitest';

describe('Dropdown Directive Demo Spec', () => {
    let component: PlaygroundDemoComponent;

    beforeEach(() => {
        component = new PlaygroundDemoComponent();
    });

    it('should initialize default selections and status log', () => {
        expect(component.selectedCategory()).toBe('Web Components');
        expect(component.selectedFramework()).toBe('Purity Core');
        expect(component.lastActionLog()).toBe('Ready');
    });

    it('should update category and action log', () => {
        component.onSelectCategory('Custom Elements v1');
        expect(component.selectedCategory()).toBe('Custom Elements v1');
        expect(component.lastActionLog()).toContain('Custom Elements v1');
    });

    it('should update framework and action log', () => {
        component.onSelectFramework('Signal Router');
        expect(component.selectedFramework()).toBe('Signal Router');
        expect(component.lastActionLog()).toContain('Signal Router');
    });

    it('should reset selections to defaults', () => {
        component.onSelectCategory('Fine-Grained Signals');
        component.onReset();
        expect(component.selectedCategory()).toBe('Web Components');
        expect(component.selectedFramework()).toBe('Purity Core');
    });
});`,
    },
];
