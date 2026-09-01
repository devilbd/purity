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
        id: 'empty-starter',
        name: '✨ Empty Starter',
        description: 'Bare-bones blank template for starting a new component from scratch.',
        ts: `import { Component } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {}`,
        html: `<div class="empty-card window">
    <div class="header">
        <span class="badge">✨ Blank Starter</span>
        <h2>Empty Component</h2>
        <p>Start writing your component here.</p>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.empty-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    border-radius: var(--radius-window, 16px);
    background: var(--gnome-surface);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    box-shadow: var(--shadow-popup);
    max-width: 540px;
    margin: 0 auto;
    color: var(--text-main);

    .header {
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 10px;
            border-radius: var(--radius-pill, 999px);
            font-size: 11px;
            font-weight: 700;
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            margin-bottom: 8px;
        }

        h2 {
            margin: 0 0 6px 0;
            font-size: 1.35rem;
            color: var(--text-main);
        }

        p {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
        }
    }
}`,
        spec: `import { describe, it, expect } from 'vitest';

describe('PlaygroundDemoComponent', () => {
    it('should instantiate component', () => {
        const component = new PlaygroundDemoComponent();
        expect(component).toBeDefined();
    });
});`,
    },
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
    <div class="card-header">
        <span class="badge">⏳ Multi-Component</span>
        <h3>👤 Select User Profile</h3>
        <p>Dynamic sub-components and loading states with Purity signals.</p>
    </div>
    
    <!-- Purity UI Loader Component -->
    <loader-component></loader-component>

    <!-- Dynamic Sub-Component -->
    <test-demo-component></test-demo-component>

    <div class="user-list">
        <button
            for="let user of users"
            type="button"
            class="button-secondary user-btn"
            onclick="onSelectUser(event, user)"
        >
            <span>Select Profile:</span>
            <strong>{{user}}</strong>
        </button>
    </div>

    <div class="selected-result">
        <span>Active User: <strong>{{selectedUser() || 'None selected'}}</strong></span>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.user-select-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
    border-radius: var(--radius-window, 16px);
    background: var(--gnome-surface);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    box-shadow: var(--shadow-popup);
    max-width: 540px;
    margin: 0 auto;
    color: var(--text-main);

    .card-header {
        .badge {
            display: inline-flex;
            padding: 2px 10px;
            border-radius: var(--radius-pill, 999px);
            font-size: 11px;
            font-weight: 700;
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            margin-bottom: 6px;
        }

        h3 {
            margin: 0 0 4px 0;
            font-size: 1.3rem;
            color: var(--text-main);
        }

        p {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
        }
    }

    .test-badge {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        background: var(--accent-subtle);
        border: 1px dashed var(--accent);
        border-radius: var(--radius-control, 8px);
        font-size: 12px;
        font-weight: 600;
        color: var(--accent);
    }

    .user-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .user-btn {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        border-radius: var(--radius-control, 8px);
        width: 100%;
        text-align: left;
        font-size: 13px;
    }

    .selected-result {
        padding: 12px 16px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-left: 4px solid var(--accent);
        border-radius: var(--radius-control, 8px);
        font-size: 13.5px;
        color: var(--text-secondary);

        strong {
            color: var(--accent-green, #57e389);
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
    <div class="card-header">
        <span class="badge">⚡ Signals & Computed</span>
        <h2>Fine-Grained Reactive Counter</h2>
        <p class="subtitle">Sub-microsecond synchronous updates without Virtual DOM diffing.</p>
    </div>

    <div class="display-grid">
        <div class="stat-box primary">
            <span class="stat-label">Current Count</span>
            <span class="stat-value {{isNegative() ? 'negative' : ''}}">{{count()}}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">2x Double</span>
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
        <div class="step-buttons">
            <button type="button" class="button-secondary {{step() === 1 ? 'active' : ''}}" onclick="setStep(1)">1x</button>
            <button type="button" class="button-secondary {{step() === 5 ? 'active' : ''}}" onclick="setStep(5)">5x</button>
            <button type="button" class="button-secondary {{step() === 10 ? 'active' : ''}}" onclick="setStep(10)">10x</button>
        </div>
    </div>

    <!-- Action Buttons -->
    <div class="button-group">
        <button type="button" class="button-secondary" onclick="decrement()">- Decrement</button>
        <button type="button" class="button-secondary" onclick="reset()">Reset</button>
        <button type="button" class="button-primary" onclick="increment()">+ Increment</button>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.counter-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    border-radius: var(--radius-window, 16px);
    background: var(--gnome-surface);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    box-shadow: var(--shadow-popup);
    max-width: 540px;
    margin: 0 auto;
    color: var(--text-main);

    .card-header {
        .badge {
            display: inline-flex;
            padding: 2px 10px;
            border-radius: var(--radius-pill, 999px);
            font-size: 11px;
            font-weight: 700;
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            margin-bottom: 6px;
        }

        h2 {
            margin: 0 0 4px 0;
            font-size: 1.35rem;
            color: var(--text-main);
        }

        .subtitle {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
        }
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
        padding: 14px 10px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        gap: 6px;

        &.primary {
            background: var(--accent-subtle);
            border-color: var(--accent);
        }

        .stat-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--text-secondary);
            font-weight: 600;
        }

        .stat-value {
            font-size: 22px;
            font-weight: 700;
            color: var(--text-main);

            &.negative {
                color: var(--accent-red, #f66151);
            }

            &.badge {
                font-size: 12px;
                padding: 3px 10px;
                border-radius: var(--radius-pill, 999px);

                &.even {
                    background: rgba(87, 227, 137, 0.18);
                    color: var(--accent-green, #57e389);
                }

                &.odd {
                    background: rgba(248, 228, 92, 0.18);
                    color: var(--accent-yellow, #f8e45c);
                }
            }
        }
    }

    .step-selector {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 14px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-control, 8px);

        .step-label {
            font-size: 12.5px;
            font-weight: 600;
            color: var(--text-secondary);
        }

        .step-buttons {
            display: flex;
            gap: 6px;

            button {
                padding: 4px 12px;
                font-size: 12px;

                &.active {
                    background: var(--accent);
                    color: #ffffff;
                    border-color: var(--accent);
                }
            }
        }
    }

    .button-group {
        display: flex;
        gap: 10px;

        button {
            flex: 1;
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
    <div class="card-header">
        <span class="badge">🚰 Data Transformation</span>
        <h2>Transform Pipes Demo</h2>
        <p class="subtitle">Dynamic Handlebars pipes with reactive template expressions.</p>
    </div>

    <div class="pipe-rows">
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
    </div>

    <!-- Currency Switcher -->
    <div class="currency-actions">
        <button type="button" class="button-secondary {{currencySymbol() === '$' ? 'active' : ''}}" onclick="setDollar()">$ USD</button>
        <button type="button" class="button-secondary {{currencySymbol() === '€' ? 'active' : ''}}" onclick="setEuro()">€ EUR</button>
        <button type="button" class="button-secondary {{currencySymbol() === '¥' ? 'active' : ''}}" onclick="setYen()">¥ JPY</button>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.pipe-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
    border-radius: var(--radius-window, 16px);
    background: var(--gnome-surface);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    box-shadow: var(--shadow-popup);
    max-width: 540px;
    margin: 0 auto;
    color: var(--text-main);

    .card-header {
        .badge {
            display: inline-flex;
            padding: 2px 10px;
            border-radius: var(--radius-pill, 999px);
            font-size: 11px;
            font-weight: 700;
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            margin-bottom: 6px;
        }

        h2 {
            margin: 0 0 4px 0;
            font-size: 1.3rem;
            color: var(--text-main);
        }

        .subtitle {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
        }
    }

    .pipe-rows {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .pipe-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            background: var(--gnome-card);
            border: 1px solid var(--gnome-border-subtle);
            border-radius: var(--radius-control, 8px);
            font-size: 13px;

            .label {
                color: var(--text-secondary);
                font-weight: 600;
            }

            .val {
                color: var(--text-main);
                font-family: var(--font-mono, monospace);

                &.highlight {
                    color: var(--accent);
                    font-weight: 700;
                }

                &.price {
                    color: var(--accent-green, #57e389);
                    font-size: 15px;
                    font-weight: 700;
                }
            }
        }
    }

    .currency-actions {
        display: flex;
        gap: 8px;

        button {
            flex: 1;

            &.active {
                background: var(--accent);
                color: #ffffff;
                border-color: var(--accent);
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
    <div class="card-header">
        <span class="badge">🔁 Structural Loops</span>
        <h2>Array Repeater (for)</h2>
        <p class="subtitle">Declarative item iteration and reactive list management.</p>
    </div>

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
        scss: `@use '@styles' as *;

.todo-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
    border-radius: var(--radius-window, 16px);
    background: var(--gnome-surface);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    box-shadow: var(--shadow-popup);
    max-width: 540px;
    margin: 0 auto;
    color: var(--text-main);

    .card-header {
        .badge {
            display: inline-flex;
            padding: 2px 10px;
            border-radius: var(--radius-pill, 999px);
            font-size: 11px;
            font-weight: 700;
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            margin-bottom: 6px;
        }

        h2 {
            margin: 0 0 4px 0;
            font-size: 1.3rem;
            color: var(--text-main);
        }

        .subtitle {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
        }
    }

    .input-bar {
        display: flex;
        gap: 8px;

        input {
            flex: 1;
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
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-control, 8px);
        transition: all 0.2s ease;

        &.is-done {
            opacity: 0.6;

            .task-title {
                text-decoration: line-through;
                color: var(--text-secondary);
            }
        }

        .task-index {
            font-size: 11px;
            font-weight: 700;
            color: var(--accent);
        }

        .task-title {
            flex: 1;
            cursor: var(--cursor-pointer);
            font-size: 13.5px;
            color: var(--text-main);
        }

        .delete-btn {
            background: transparent;
            border: none;
            color: var(--accent-red, #f66151);
            cursor: var(--cursor-pointer);
            font-size: 14px;
            padding: 4px 8px;
            border-radius: 4px;

            &:hover {
                background: rgba(246, 97, 81, 0.15);
            }
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
    <div class="card-header">
        <span class="badge">🔀 Structural Branches</span>
        <h2>Structural Conditionals</h2>
        <p class="subtitle">Multi-branch conditional rendering with lazy DOM mount.</p>
    </div>

    <!-- Role Switcher -->
    <div class="role-selector">
        <button type="button" class="button-secondary {{role() === 'admin' ? 'active' : ''}}" onclick="setRole('admin')">Admin</button>
        <button type="button" class="button-secondary {{role() === 'moderator' ? 'active' : ''}}" onclick="setRole('moderator')">Moderator</button>
        <button type="button" class="button-secondary {{role() === 'guest' ? 'active' : ''}}" onclick="setRole('guest')">Guest</button>
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
        scss: `@use '@styles' as *;

.auth-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
    border-radius: var(--radius-window, 16px);
    background: var(--gnome-surface);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    box-shadow: var(--shadow-popup);
    max-width: 540px;
    margin: 0 auto;
    color: var(--text-main);

    .card-header {
        .badge {
            display: inline-flex;
            padding: 2px 10px;
            border-radius: var(--radius-pill, 999px);
            font-size: 11px;
            font-weight: 700;
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            margin-bottom: 6px;
        }

        h2 {
            margin: 0 0 4px 0;
            font-size: 1.3rem;
            color: var(--text-main);
        }

        .subtitle {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
        }
    }

    .role-selector {
        display: flex;
        gap: 8px;

        button {
            flex: 1;

            &.active {
                background: var(--accent);
                color: #ffffff;
                border-color: var(--accent);
            }
        }
    }

    .panel {
        padding: 16px;
        border-radius: var(--radius-card, 12px);

        h3 {
            margin: 0 0 6px 0;
            font-size: 1.15rem;
        }

        p {
            margin: 0;
            font-size: 13px;
            opacity: 0.9;
        }

        &.admin-panel {
            background: rgba(246, 97, 81, 0.12);
            border: 1px solid rgba(246, 97, 81, 0.35);
            color: var(--accent-red, #f66151);
        }

        &.mod-panel {
            background: rgba(248, 228, 92, 0.12);
            border: 1px solid rgba(248, 228, 92, 0.35);
            color: var(--accent-yellow, #f8e45c);
        }

        &.guest-panel {
            background: var(--accent-subtle);
            border: 1px solid var(--accent);
            color: var(--accent);
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
        html: `<div class="dropdown-demo-card window">
    <div class="demo-header">
        <span class="badge">🔽 Directives</span>
        <h3>Glassmorphic Dropdowns</h3>
        <p class="demo-subtitle">Declarative dropdown directives with keyboard navigation.</p>
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
        scss: `@use '@styles' as *;

.dropdown-demo-card {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
    border-radius: var(--radius-window, 16px);
    background: var(--gnome-surface);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    box-shadow: var(--shadow-popup);
    max-width: 540px;
    margin: 0 auto;
    color: var(--text-main);

    .demo-header {
        .badge {
            display: inline-flex;
            padding: 2px 10px;
            border-radius: var(--radius-pill, 999px);
            font-size: 11px;
            font-weight: 700;
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            margin-bottom: 6px;
        }

        h3 {
            margin: 0 0 4px 0;
            font-size: 1.3rem;
            color: var(--text-main);
        }

        .demo-subtitle {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
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
                color: var(--text-secondary);
            }
        }
    }

    .status-output {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 16px;
        border-radius: var(--radius-card, 12px);
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);

        .status-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;

            .status-key {
                font-weight: 600;
                color: var(--text-secondary);
            }

            .status-pill {
                color: var(--accent-green, #57e389);
                font-weight: 700;
                font-family: var(--font-mono, monospace);
            }

            .status-text {
                color: var(--text-main);
            }
        }
    }

    .demo-actions {
        display: flex;
        justify-content: flex-end;
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
    {
        id: 'popover',
        name: '💬 Interactive Popover & Anchoring',
        description: 'Floating popover anchored to DOM targets with viewport collision detection.',
        ts: `import { Component, signal, ViewChild } from '@purity/core';
import '@components/popover/popover.component';
import type { PopoverComponent } from '@components/popover/popover.component';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    @ViewChild('#manualPopover')
    private manualPopover?: PopoverComponent | null;

    triggerCount = signal(0);
    currentPosition = signal<'top' | 'bottom' | 'left' | 'right'>('bottom');

    openManual() {
        this.manualPopover?.open('#manual-anchor');
        this.triggerCount.update(c => c + 1);
    }

    closeManual() {
        this.manualPopover?.close();
    }

    toggleManual() {
        this.manualPopover?.toggle('#manual-anchor');
        this.triggerCount.update(c => c + 1);
    }

    setPosition(pos: 'top' | 'bottom' | 'left' | 'right') {
        this.currentPosition.set(pos);
        this.manualPopover?.setPosition(pos);
    }
}`,
        html: `<div class="popover-playground window">
    <div class="header">
        <span class="badge">💬 Floating Popovers</span>
        <h2>Popover Anchoring &amp; Collisions</h2>
        <p>Hover triggers and programmatic controls with automatic boundary flipping.</p>
    </div>

    <!-- Directional Hover Triggers -->
    <div class="section">
        <label class="label">Directional Hover Targets:</label>
        <div class="grid">
            <div id="demo-target-top" class="target-box">
                <span>⬆️ Hover Top</span>
            </div>
            <div id="demo-target-right" class="target-box">
                <span>➡️ Hover Right</span>
            </div>
            <div id="dom-with-popover" class="target-box">
                <span>⬇️ Hover Bottom</span>
            </div>
            <div id="demo-target-left" class="target-box">
                <span>⬅️ Hover Left</span>
            </div>
        </div>
    </div>

    <!-- Programmatic Controls -->
    <div class="section">
        <label class="label">Programmatic Control via @ViewChild:</label>
        <div class="control-row">
            <div id="manual-anchor" class="anchor-badge">
                <span>🎯 Anchor Target</span>
            </div>
            <div class="actions">
                <button type="button" class="button-primary" onclick="openManual()">Open</button>
                <button type="button" class="button-secondary" onclick="toggleManual()">Toggle</button>
                <button type="button" class="button-secondary" onclick="closeManual()">Close</button>
            </div>
        </div>
    </div>

    <!-- Popover Declarations -->
    <popover target-for="'#demo-target-top'" position="top">
        <h3>Top Popover</h3>
        <p>Anchored to top with boundary checks.</p>
    </popover>

    <popover target-for="'#dom-with-popover'" position="bottom">
        <h3>Bottom Popover</h3>
        <div>I am popover body with rich content.</div>
    </popover>

    <popover target-for="'#demo-target-left'" position="left">
        <h3>Left Popover</h3>
        <p>Anchored to left with GNOME 50 glassmorphism.</p>
    </popover>

    <popover target-for="'#demo-target-right'" position="right">
        <h3>Right Popover</h3>
        <p>Anchored to right with automatic clamping.</p>
    </popover>

    <popover id="manualPopover" target-for="'#manual-anchor'" position="bottom">
        <h3>⚡ Programmatic Popover</h3>
        <p>Opened and closed via component methods.</p>
    </popover>
</div>`,
        scss: `@use '@styles' as *;

.popover-playground {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 24px;
    border-radius: var(--radius-window, 16px);
    background: var(--gnome-surface);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    box-shadow: var(--shadow-popup);
    max-width: 540px;
    margin: 0 auto;
    color: var(--text-main);

    .header {
        .badge {
            display: inline-flex;
            padding: 2px 10px;
            border-radius: var(--radius-pill, 999px);
            font-size: 11px;
            font-weight: 700;
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            margin-bottom: 6px;
        }

        h2 {
            margin: 0 0 4px 0;
            font-size: 1.3rem;
            color: var(--text-main);
        }

        p {
            margin: 0;
            font-size: 13px;
            color: var(--text-secondary);
        }
    }

    .section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);

        .label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;

            .target-box {
                padding: 14px;
                background: var(--gnome-input, rgba(0, 0, 0, 0.06));
                border: 1px dashed var(--accent);
                border-radius: var(--radius-control, 8px);
                text-align: center;
                cursor: var(--cursor-pointer);
                font-size: 13px;
                font-weight: 600;
                color: var(--text-main);
                transition: all var(--transition-fast, 0.18s) ease;

                &:hover {
                    background: var(--accent-subtle);
                    border-style: solid;
                }
            }
        }

        .control-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;

            .anchor-badge {
                padding: 8px 14px;
                background: var(--accent-subtle);
                border: 1px solid var(--accent);
                border-radius: var(--radius-control, 8px);
                font-size: 12.5px;
                color: var(--accent);
                font-weight: 600;
            }

            .actions {
                display: flex;
                gap: 6px;
            }
        }
    }
}`,
        spec: `import { describe, it, expect, beforeEach } from 'vitest';

describe('Popover Component Spec', () => {
    let component: PlaygroundDemoComponent;

    beforeEach(() => {
        component = new PlaygroundDemoComponent();
    });

    it('should initialize trigger count to 0 and position to bottom', () => {
        expect(component.triggerCount()).toBe(0);
        expect(component.currentPosition()).toBe('bottom');
    });

    it('should update state on manual open and toggle', () => {
        component.openManual();
        expect(component.triggerCount()).toBe(1);

        component.toggleManual();
        expect(component.triggerCount()).toBe(2);

        component.closeManual();
    });

    it('should update position setting', () => {
        component.setPosition('top');
        expect(component.currentPosition()).toBe('top');

        component.setPosition('right');
        expect(component.currentPosition()).toBe('right');
    });
});`,
    },
];
