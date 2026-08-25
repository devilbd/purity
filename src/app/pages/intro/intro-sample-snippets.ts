export interface IntroSampleSnippet {
    id: string;
    title: string;
    ts: string;
    html: string;
    scss: string;
}

export const INTRO_SAMPLE_SNIPPETS: Record<string, IntroSampleSnippet> = {
    // 1. Reactivity
    reactivity: {
        id: 'reactivity',
        title: '🔄 Fine-Grained Reactive Signals & Effects',
        ts: `import { Component, signal, effect } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    count = signal<number>(0);
    multiplier = signal<number>(2);

    increment() {
        this.count.update(n => n + 1);
    }

    decrement() {
        this.count.update(n => Math.max(0, n - 1));
    }

    reset() {
        this.count.set(0);
    }

    onMultiplierChange(element: HTMLInputElement) {
        const val = parseInt(element.value, 10);
        this.multiplier.set(isNaN(val) ? 1 : val);
    }
}`,
        html: `<div class="sample-card window">
    <h3>🔄 Signals & Reactive Effects</h3>
    <p>Synchronous reactivity with automatic dependency tracking.</p>

    <div class="stat-grid">
        <div class="stat-box">
            <span class="stat-label">Count</span>
            <span class="stat-value">{{count()}}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Multiplier</span>
            <span class="stat-value">×{{multiplier()}}</span>
        </div>
        <div class="stat-box highlight">
            <span class="stat-label">Total</span>
            <span class="stat-value">{{count() * multiplier()}}</span>
        </div>
    </div>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="increment()">+1 Increment</button>
        <button type="button" class="button-secondary" onclick="decrement()">-1 Decrement</button>
        <button type="button" class="button-cancel" onclick="reset()">Reset</button>
    </div>

    <div class="input-row">
        <label>Adjust Multiplier:</label>
        <input
            type="number"
            min="1"
            max="10"
            class="input-primary"
            value="{{multiplier()}}"
            oninput="onMultiplierChange(this)"
        />
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }
    p { margin: 0; color: #a6accd; font-size: 13px; }

    .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;

        .stat-box {
            background: #1b1e2b;
            padding: 12px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .stat-label { font-size: 11px; color: #676e95; text-transform: uppercase; }
            .stat-value { font-size: 20px; font-weight: 700; color: #eeffff; }

            &.highlight .stat-value { color: #c3e88d; }
        }
    }

    .actions-row, .input-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }
}`,
    },

    // 2. Dependency Injection
    di: {
        id: 'di',
        title: '💉 Dependency Injection & Singleton Services',
        ts: `import { Component, Injectable, inject, signal } from '@purity/core';

export interface User {
    id: number;
    name: string;
    role: string;
}

@Injectable('AuthService')
export class AuthService {
    currentUser = signal<User | null>(null);

    login(username: string) {
        this.currentUser.set({
            id: Date.now(),
            name: username,
            role: 'Framework Developer'
        });
    }

    logout() {
        this.currentUser.set(null);
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    private auth = inject(AuthService);

    get user() {
        return this.auth.currentUser();
    }

    onLogin(name: string) {
        this.auth.login(name);
    }

    onLogout() {
        this.auth.logout();
    }
}`,
        html: `<div class="sample-card window">
    <h3>💉 Dependency Injection Service</h3>
    
    <div class="user-status-card">
        <div class="status-indicator {{user ? 'active' : ''}}"></div>
        <div>
            <h4>{{user ? user.name : 'Guest User'}}</h4>
            <p>{{user ? user.role : 'Not signed in'}}</p>
        </div>
    </div>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="onLogin('Alice Smith')">Login as Alice</button>
        <button type="button" class="button-primary" onclick="onLogin('Bob Johnson')">Login as Bob</button>
        <button type="button" class="button-cancel" onclick="onLogout()">Logout</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }

    .user-status-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        background: #1b1e2b;
        border-radius: 8px;

        .status-indicator {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #ff5370;

            &.active {
                background: #c3e88d;
                box-shadow: 0 0 10px rgba(195, 232, 141, 0.5);
            }
        }

        h4 { margin: 0; color: #eeffff; }
        p { margin: 2px 0 0 0; color: #a6accd; font-size: 13px; }
    }

    .actions-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
}`,
    },

    // 3. HTTP Client
    http: {
        id: 'http',
        title: '🌐 HTTP Client Service & Interceptors',
        ts: `import { Component, signal, inject, HttpClient } from '@purity/core';

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    private http = inject(HttpClient);

    todo = signal<Todo | null>(null);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);

    async fetchTodo(id: number) {
        this.loading.set(true);
        this.error.set(null);
        try {
            const res = await this.http.get<Todo>(\`https://jsonplaceholder.typicode.com/todos/\${id}\`);
            this.todo.set(res.data);
        } catch (err: any) {
            this.error.set(err.message || 'Failed to fetch');
        } finally {
            this.loading.set(false);
        }
    }
}`,
        html: `<div class="sample-card window">
    <h3>🌐 HTTP Client Pipeline</h3>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="fetchTodo(1)">Fetch Todo #1</button>
        <button type="button" class="button-primary" onclick="fetchTodo(2)">Fetch Todo #2</button>
        <button type="button" class="button-secondary" onclick="fetchTodo(999)">Trigger Error</button>
    </div>

    <div class="result-box">
        <div class="loading-tag {{loading() ? 'visible' : 'hidden'}}">⏳ Fetching remote data...</div>
        <div class="error-tag {{error() ? 'visible' : 'hidden'}}">❌ {{error()}}</div>
        
        <div class="todo-details {{todo() && !loading() ? 'visible' : 'hidden'}}">
            <h4>#{{todo()?.id}}: {{todo()?.title}}</h4>
            <span class="badge {{todo()?.completed ? 'done' : 'pending'}}">
                {{todo()?.completed ? '✓ Completed' : '⏳ Pending'}}
            </span>
        </div>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }
    .actions-row { display: flex; gap: 10px; flex-wrap: wrap; }

    .result-box {
        padding: 16px;
        background: #1b1e2b;
        border-radius: 8px;
        min-height: 80px;

        .visible { display: block; }
        .hidden { display: none; }

        .todo-details {
            h4 { margin: 0 0 8px 0; color: #eeffff; }
            .badge {
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 700;
                &.done { background: rgba(195, 232, 141, 0.2); color: #c3e88d; }
                &.pending { background: rgba(255, 203, 107, 0.2); color: #ffcb6b; }
            }
        }
    }
}`,
    },

    // 4. Bootstrap
    bootstrap: {
        id: 'bootstrap',
        title: '🚀 Application Bootstrapping & Theme Engine',
        ts: `import { Component, signal, inject } from '@purity/core';
import { ThemeService } from '@data/theme.service';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    private themeService = inject(ThemeService);

    isDark() {
        return this.themeService.isDark();
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }
}`,
        html: `<div class="sample-card window">
    <h3>🚀 Bootstrapping & Theme Service</h3>
    <p>Applications bootstrap with automatic DI providers and theme persistence.</p>

    <div class="theme-status">
        <span>Current Theme: <strong>{{isDark() ? '🌙 Dark Mode' : '☀️ Light Mode'}}</strong></span>
    </div>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="toggleTheme()">
            Toggle Theme (Dark / Light)
        </button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }
    p { margin: 0; color: #a6accd; font-size: 13px; }

    .theme-status {
        padding: 14px;
        background: #1b1e2b;
        border-radius: 8px;
        strong { color: #82aaff; }
    }
}`,
    },

    // 5. Notify
    notify: {
        id: 'notify',
        title: '🔔 Reactive Toast Notification Service',
        ts: `import { Component, inject } from '@purity/core';
import { NotifyService } from '@data/notify.service';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    private notify = inject(NotifyService);

    showSuccess() {
        this.notify.success('Action Completed', 'Data synchronized with local storage.', { duration: 4000 });
    }

    showError() {
        this.notify.error('Network Error', 'Unable to reach backend gateway.', { duration: 5000 });
    }

    showWarn() {
        this.notify.warn('Resource Alert', 'Memory threshold exceeded 85%.');
    }

    showInfo() {
        this.notify.info('New Update', 'Purity v1.0.0 is available.');
    }
}`,
        html: `<div class="sample-card window">
    <h3>🔔 Toast Notification Service</h3>
    <p>Dispatch reactive toasts to any viewport corner with custom timeouts.</p>

    <div class="actions-row">
        <button type="button" class="button-primary btn-success" onclick="showSuccess()">✓ Success Toast</button>
        <button type="button" class="button-primary btn-error" onclick="showError()">✕ Error Toast</button>
        <button type="button" class="button-primary btn-warn" onclick="showWarn()">⚠ Warning Toast</button>
        <button type="button" class="button-primary btn-info" onclick="showInfo()">ℹ Info Toast</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }
    p { margin: 0; color: #a6accd; font-size: 13px; }

    .actions-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;

        .btn-success { background: #2ec27e; color: #fff; }
        .btn-error { background: #ed333b; color: #fff; }
        .btn-warn { background: #e5a50a; color: #000; }
        .btn-info { background: #3584e4; color: #fff; }
    }
}`,
    },

    // 6. Pipes
    pipes: {
        id: 'pipes',
        title: '⚡ Transform Pipes & Dynamic Parameters',
        ts: `import { Component, signal, Pipe, BasePipe } from '@purity/core';

@Pipe('customCurrency')
export class CustomCurrencyPipe extends BasePipe {
    transform(amount: any, currencyCode: string = 'USD', symbol: string = '$'): string {
        const num = parseFloat(amount);
        if (isNaN(num)) return '$0.00';
        return \`\${symbol}\${num.toFixed(2)} \${currencyCode}\`;
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    rawPrice = signal<number>(149.95);
    selectedCurrency = signal<string>('EUR');
    currencySymbol = signal<string>('€');

    setCurrency(curr: string, sym: string) {
        this.selectedCurrency.set(curr);
        this.currencySymbol.set(sym);
    }
}`,
        html: `<div class="sample-card window">
    <h3>⚡ Transform Pipes with Dynamic Signal Args</h3>

    <div class="result-box">
        <span class="label">Formatted Price:</span>
        <span class="output">{{ rawPrice() | customCurrency: selectedCurrency() : currencySymbol() }}</span>
    </div>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="setCurrency('USD', '$')">USD ($)</button>
        <button type="button" class="button-primary" onclick="setCurrency('EUR', '€')">EUR (€)</button>
        <button type="button" class="button-primary" onclick="setCurrency('GBP', '£')">GBP (£)</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }

    .result-box {
        padding: 16px;
        background: #1b1e2b;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;

        .label { color: #a6accd; }
        .output { font-size: 22px; font-weight: 800; color: #c3e88d; }
    }

    .actions-row { display: flex; gap: 10px; }
}`,
    },

    // 7. Form Validator
    validator: {
        id: 'validator',
        title: '📋 Decoupled Form Validation Engine',
        ts: `import { Component, Validator, BaseValidator } from '@purity/core';

@Validator({
    form: '#signup-form',
    fields: {
        username: '#user-field',
        email: '#email-field',
    },
    validClass: 'is-valid',
    invalidClass: 'is-invalid',
})
export class SignupFormValidator extends BaseValidator {
    validateUsername(value: string): boolean {
        return value.trim().length >= 3;
    }

    validateEmail(value: string): boolean {
        return /^[^\s@]+@[^\s@]+\\.[^\s@]+$/.test(value);
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    onSubmit(e: Event) {
        e.preventDefault();
        alert('Form submitted successfully!');
    }
}`,
        html: `<div class="sample-card window">
    <h3>📋 Decoupled Form Validation</h3>

    <form id="signup-form" onsubmit="onSubmit(event)">
        <div class="field-group">
            <label>Username (min 3 chars):</label>
            <input id="user-field" type="text" class="input-primary" placeholder="Enter username..." />
        </div>

        <div class="field-group">
            <label>Email Address:</label>
            <input id="email-field" type="email" class="input-primary" placeholder="user@example.com" />
        </div>

        <button type="submit" class="button-primary submit-btn">Create Account</button>
    </form>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 16px 0; color: #82aaff; }

    form {
        display: flex;
        flex-direction: column;
        gap: 14px;

        .field-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
            label { font-size: 12px; color: #a6accd; }
            input { width: 100%; box-sizing: border-box; }
        }

        .is-valid { border-color: #2ec27e !important; box-shadow: 0 0 0 2px rgba(46, 194, 126, 0.25); }
        .is-invalid { border-color: #ed333b !important; box-shadow: 0 0 0 2px rgba(237, 51, 59, 0.25); }

        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    }
}`,
    },

    // 8. Directives
    directives: {
        id: 'directives',
        title: '🏷️ Reactive Custom Directives',
        ts: `import { Component, Directive, BaseDirective, signal } from '@purity/core';

@Directive('pulse')
export class PulseDirective extends BaseDirective {
    onInit() {
        this.element.classList.add('pulse-base');
        this.onChanges(this.value);
    }

    onChanges(newValue: any) {
        this.element.classList.toggle('pulse-active', !!newValue);
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    isPulsing = signal<boolean>(true);

    togglePulse() {
        this.isPulsing.update(v => !v);
    }
}`,
        html: `<div class="sample-card window">
    <h3>🏷️ Reactive Custom Directives</h3>

    <div [pulse]="isPulsing()" class="directive-box">
        <span>⚡ Pulsing Element</span>
    </div>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="togglePulse()">
            Toggle Pulse (Current: {{isPulsing() ? 'ON' : 'OFF'}})
        </button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }

    .directive-box {
        padding: 24px;
        text-align: center;
        background: #1b1e2b;
        border-radius: 8px;
        border: 2px solid rgba(130, 170, 255, 0.2);
        font-weight: 700;
        color: #82aaff;
        transition: all 0.3s ease;

        &.pulse-active {
            border-color: #c3e88d;
            color: #c3e88d;
            box-shadow: 0 0 20px rgba(195, 232, 141, 0.4);
            transform: scale(1.02);
        }
    }
}`,
    },

    // 9. Behaviors
    behaviors: {
        id: 'behaviors',
        title: '🎯 Composable Behaviors (Draggable & Droppable)',
        ts: `import { Component, ViewChild } from '@purity/core';
import { drag } from '@behaviors/draggable/draggable';
import { droppable } from '@behaviors/droppable/droppable';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    private dragCleanup?: { destroy: () => void };
    private dropCleanup?: { destroy: () => void };

    protected onInit() {
        this.dragCleanup = drag({
            selector: '#drag-token',
            constrainTo: '#drop-arena',
            snapTo: '#target-zone',
            handle: '#drag-token',
        });

        this.dropCleanup = droppable({
            selector: '#target-zone',
            accepts: '#drag-token',
            hoverClass: 'zone-hover',
            onDrop: (el) => {
                el.innerText = '🎯 Dropped!';
                el.style.background = '#2ec27e';
            }
        });
    }

    protected onDestroy() {
        this.dragCleanup?.destroy();
        this.dropCleanup?.destroy();
    }
}`,
        html: `<div class="sample-card window">
    <h3>🎯 Drag & Drop Behaviors</h3>
    <p>Pointer-based GPU accelerated interaction with boundary constraints.</p>

    <div id="drop-arena" class="arena">
        <div id="drag-token" class="drag-token">🖐 Drag Me</div>
        <div id="target-zone" class="target-zone">🎯 Drop Target</div>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 6px 0; color: #82aaff; }
    p { margin: 0 0 16px 0; color: #a6accd; font-size: 13px; }

    .arena {
        position: relative;
        height: 220px;
        background: #1b1e2b;
        border-radius: 8px;
        border: 1px dashed rgba(130, 170, 255, 0.3);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;

        .drag-token {
            width: 100px;
            height: 60px;
            background: #82aaff;
            color: #000;
            font-weight: 700;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            user-select: none;
            z-index: 10;
        }

        .target-zone {
            width: 140px;
            height: 90px;
            background: rgba(130, 170, 255, 0.08);
            border: 2px dashed #82aaff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #82aaff;
            font-weight: 600;

            &.zone-hover {
                background: rgba(195, 232, 141, 0.2);
                border-color: #c3e88d;
                color: #c3e88d;
            }
        }
    }
}`,
    },

    // 10. Components
    components: {
        id: 'components',
        title: '🧩 Native Web Components & @Component',
        ts: `import { Component, signal } from '@purity/core';

@Component({
    selector: 'user-badge-widget',
    template: \`<div class="badge-box">
        <span>⭐ Rating: <strong>{{score()}}/100</strong></span>
        <button class="button-primary btn-sm" onclick="boost()">+10 Boost</button>
    </div>\`,
})
export class UserBadgeWidget {
    score = signal(75);
    boost() { this.score.update(n => Math.min(100, n + 10)); }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {}`,
        html: `<div class="sample-card window">
    <h3>🧩 Multi-Component Custom Elements</h3>
    <p>Components instantiated dynamically with zero virtual DOM overhead:</p>
    
    <user-badge-widget></user-badge-widget>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 6px 0; color: #82aaff; }

    .badge-box {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        background: #1b1e2b;
        border-radius: 8px;
        color: #ffcb6b;
        strong { font-size: 18px; color: #c3e88d; }
    }
}`,
    },

    // 11. ViewChild
    viewchild: {
        id: 'viewchild',
        title: '🔍 Child View Queries (@ViewChild)',
        ts: `import { Component, ViewChild, signal } from '@purity/core';
import type { LoaderComponent } from '@components/loader/loader.component';

@Component({
    selector: 'test-badge',
    template: '<div class="badge">✨ Verified Profile Active</div>',
})
export class TestBadgeComponent {}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    // Implicit resolution of <loader-component>
    @ViewChild()
    private loader?: LoaderComponent | null;

    // Implicit resolution of <test-badge>
    @ViewChild()
    private testBadge?: TestBadgeComponent | null;

    selected = signal('User #1');

    selectUser(name: string) {
        this.loader?.show(\`Loading profile \${name}...\`);
        setTimeout(() => {
            this.loader?.hide();
            this.selected.set(name);
        }, 1000);
    }
}`,
        html: `<div class="sample-card window">
    <h3>🔍 Implicit @ViewChild Queries</h3>

    <loader-component></loader-component>
    <test-badge></test-badge>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="selectUser('Alice')">Load Alice</button>
        <button type="button" class="button-primary" onclick="selectUser('Bob')">Load Bob</button>
    </div>

    <div class="result-box">
        <span>Active: <strong>{{selected()}}</strong></span>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }
    .badge { padding: 6px 12px; background: rgba(130, 170, 255, 0.15); border-radius: 6px; color: #82aaff; display: inline-block; }
    .actions-row { display: flex; gap: 10px; }
    .result-box { padding: 12px; background: #1b1e2b; border-radius: 6px; strong { color: #c3e88d; } }
}`,
    },

    // 12. Handlebars
    handlebars: {
        id: 'handlebars',
        title: '📄 Handlebars Template Interpolation',
        ts: `import { Component, signal } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    username = signal('Antigravity');
    role = signal('Principal Engineer');
    framework = signal('Purity');
    version = signal('1.0.0');

    updateRole(newRole: string) {
        this.role.set(newRole);
    }
}`,
        html: `<div class="sample-card window">
    <h3>📄 Reactive Handlebars Interpolations</h3>

    <div class="info-block">
        <div>Developer: <strong>{{username()}}</strong></div>
        <div>Role: <strong>{{role()}}</strong></div>
        <div>Framework: <strong>{{framework()}} v{{version()}}</strong></div>
    </div>

    <div class="actions-row">
        <button class="button-primary" onclick="updateRole('Core Architect')">Core Architect</button>
        <button class="button-primary" onclick="updateRole('Systems Engineer')">Systems Engineer</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }
    .info-block { padding: 14px; background: #1b1e2b; border-radius: 8px; display: flex; flex-direction: column; gap: 6px; strong { color: #82aaff; } }
    .actions-row { display: flex; gap: 10px; }
}`,
    },

    // 13. Structural Array Repeater
    'for-loop': {
        id: 'for-loop',
        title: '🔁 Structural Array Repeater (for="let item of list")',
        ts: `import { Component, signal } from '@purity/core';

interface Task {
    id: number;
    title: string;
    completed: boolean;
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    tasks = signal<Task[]>([
        { id: 1, title: 'Compile Native TypeScript', completed: true },
        { id: 2, title: 'Evaluate Signal Primitives', completed: true },
        { id: 3, title: 'Mount Custom Elements v1', completed: false },
    ]);

    toggle(id: number) {
        this.tasks.update(list =>
            list.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
        );
    }

    addTask(title: string) {
        if (!title.trim()) return;
        this.tasks.update(list => [
            ...list,
            { id: Date.now(), title, completed: false }
        ]);
    }
}`,
        html: `<div class="sample-card window">
    <h3>🔁 Array Repeater (for="let item, index of items")</h3>

    <div class="task-list">
        <div for="let t, index of tasks" class="task-item {{t.completed ? 'done' : ''}}">
            <span class="index">#{{index + 1}}</span>
            <span class="title">{{t.title}}</span>
            <button type="button" class="button-secondary btn-sm" onclick="toggle(t.id)">
                {{t.completed ? '↩ Undo' : '✓ Done'}}
            </button>
        </div>
    </div>

    <div class="add-row">
        <button type="button" class="button-primary" onclick="addTask('Ship Purity v1.0.0')">+ Add Task</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }

    .task-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .task-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            background: #1b1e2b;
            border-radius: 8px;

            .index { color: #676e95; font-size: 12px; }
            .title { flex: 1; color: #eeffff; }

            &.done .title {
                text-decoration: line-through;
                color: #676e95;
            }
        }
    }
}`,
    },

    // 14. Content Projection (slot)
    slot: {
        id: 'slot',
        title: '📦 Content Projection with <slot>',
        ts: `import { Component } from '@purity/core';

@Component({
    selector: 'card-container',
    template: \`<div class="card-frame">
        <div class="card-header">✨ Container Shell</div>
        <div class="card-body">
            <slot>Default Fallback Content</slot>
        </div>
    </div>\`,
})
export class CardContainerComponent {}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {}`,
        html: `<div class="sample-card window">
    <h3>📦 Content Projection with &lt;slot&gt;</h3>

    <card-container>
        <div class="projected-content">
            <p>🚀 <strong>Injected from Parent:</strong> This content is seamlessly projected into the slot while maintaining reactive bindings.</p>
        </div>
    </card-container>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 16px 0; color: #82aaff; }

    .card-frame {
        border: 1px solid rgba(130, 170, 255, 0.3);
        border-radius: 8px;
        overflow: hidden;

        .card-header {
            background: #1b1e2b;
            padding: 10px 16px;
            font-weight: 700;
            color: #82aaff;
            border-bottom: 1px solid rgba(130, 170, 255, 0.2);
        }

        .card-body {
            padding: 16px;
            background: #292d3e;
            color: #eeffff;
        }
    }
}`,
    },

    // 15. Theming
    theming: {
        id: 'theming',
        title: '🎨 Modular SCSS Theming & GNOME Adwaita',
        ts: `import { Component, signal, inject } from '@purity/core';
import { ThemeService } from '@data/theme.service';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    private themeService = inject(ThemeService);

    get activeTheme(): string {
        return this.themeService.theme();
    }

    setDark() {
        this.themeService.setTheme('dark');
    }

    setLight() {
        this.themeService.setTheme('light');
    }
}`,
        html: `<div class="sample-card window">
    <h3>🎨 GNOME Adwaita SCSS Theming Engine</h3>

    <div class="theme-box">
        <span>Active Palette: <strong>{{activeTheme}}</strong></span>
    </div>

    <div class="actions-row">
        <button class="button-primary" onclick="setDark()">🌙 Dark Palette (Default)</button>
        <button class="button-secondary" onclick="setLight()">☀️ Light Palette</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }
    .theme-box { padding: 14px; background: #1b1e2b; border-radius: 8px; strong { color: #c3e88d; } }
    .actions-row { display: flex; gap: 10px; }
}`,
    },

    // 16. Date Time Picker
    'date-time-picker': {
        id: 'date-time-picker',
        title: '📅 Date & Time Picker Component',
        ts: `import { Component, ViewChild } from '@purity/core';
import type { DateTimePickerComponent } from '@components/date-time-picker/date-time-picker.component';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    @ViewChild()
    private picker?: DateTimePickerComponent | null;

    protected onInit() {
        if (this.picker) {
            this.picker.enableBlur.set(true);
        }
    }
}`,
        html: `<div class="sample-card window">
    <h3>📅 Reactive Date & Time Picker</h3>
    <p>Calendar & scrollable 24h clock with body teleportation.</p>

    <div class="picker-container">
        <date-time-picker></date-time-picker>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 6px 0; color: #82aaff; }
    p { margin: 0 0 16px 0; color: #a6accd; font-size: 13px; }

    .picker-container {
        display: flex;
        justify-content: center;
        padding: 20px 0;
    }
}`,
    },

    // 17. Radial Menu
    'radial-menu': {
        id: 'radial-menu',
        title: '🎯 Radial Context Menu (Lucide Vectors & Emojis)',
        ts: `import { Component, ViewChild } from '@purity/core';
import type { RadialContextMenuComponent } from '@components/radial-context-menu/radial-context-menu.component';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    @ViewChild()
    private radialMenu?: RadialContextMenuComponent | null;

    openMenu(e: MouseEvent) {
        this.radialMenu?.open(e.clientX, e.clientY);
    }
}`,
        html: `<div class="sample-card window" onclick="openMenu(event)">
    <h3>🎯 Circular Radial Context Menu</h3>
    <p>Click anywhere in this card to summon the radial menu:</p>

    <div class="click-hint">
        <span>🖐 Click to open circular pie menu</span>
    </div>

    <radial-context-menu></radial-context-menu>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;
    min-height: 240px;
    cursor: pointer;

    h3 { margin: 0 0 6px 0; color: #82aaff; }
    p { margin: 0 0 16px 0; color: #a6accd; font-size: 13px; }

    .click-hint {
        padding: 40px 20px;
        border: 2px dashed rgba(130, 170, 255, 0.3);
        border-radius: 8px;
        text-align: center;
        color: #82aaff;
        font-weight: 600;
    }
}`,
    },

    // 18. Context Menu Delegation
    'context-menu-delegation': {
        id: 'context-menu-delegation',
        title: '🎯 Single-Source Context Menu Delegation (setSelector)',
        ts: `import { Component, ViewChild } from '@purity/core';
import type { RadialContextMenuComponent } from '@components/radial-context-menu/radial-context-menu.component';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    @ViewChild()
    private radialMenu?: RadialContextMenuComponent | null;

    protected onInit() {
        this.radialMenu?.setSelector('.context-target');
    }
}`,
        html: `<div class="sample-card window">
    <h3>🎯 Right-Click Context Menu Delegation</h3>
    <p>Right-click the card below to trigger the delegated context menu:</p>

    <div class="context-target arena-box">
        <span>🖱️ Right-Click Me (Context Target)</span>
    </div>

    <radial-context-menu></radial-context-menu>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 6px 0; color: #82aaff; }
    p { margin: 0 0 16px 0; color: #a6accd; font-size: 13px; }

    .arena-box {
        padding: 40px;
        background: #1b1e2b;
        border: 2px solid #82aaff;
        border-radius: 8px;
        text-align: center;
        font-weight: 700;
        color: #82aaff;
    }
}`,
    },

    // 19. Modal Dialog
    modal: {
        id: 'modal',
        title: '🪟 Modal Dialog System (<modal-view>)',
        ts: `import { Component, ViewChild } from '@purity/core';
import type { ModalViewComponent } from '@components/modal/modal-view.component';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    @ViewChild()
    private modalView?: ModalViewComponent | null;

    openDialog() {
        this.modalView?.open({ title: 'Interactive Modal Dialog' });
    }
}`,
        html: `<div class="sample-card window">
    <h3>🪟 Modal Dialog System</h3>
    <p>Dialogs with backdrop blur, content projection, and ESC dismissal.</p>

    <button type="button" class="button-primary" onclick="openDialog()">
        🪟 Open Modal Dialog
    </button>

    <modal-view>
        <div class="dialog-content">
            <h4>📦 Custom Projected Content</h4>
            <p>This content is projected into the modal dialog via <code>&lt;slot&gt;</code>.</p>
        </div>
    </modal-view>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 6px 0; color: #82aaff; }
    p { margin: 0 0 16px 0; color: #a6accd; font-size: 13px; }

    .dialog-content {
        h4 { margin: 0 0 8px 0; color: #82aaff; }
        p { margin: 0; color: #eeffff; }
    }
}`,
    },

    // 20. Clock
    clock: {
        id: 'clock',
        title: '⏱️ Analogue Clock Widget (<analogue-clock>)',
        ts: `import { Component, ViewChild } from '@purity/core';
import type { AnalogueClockComponent } from '@widgets/analogue-clock/analogue-clock.component';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    @ViewChild()
    private analogueClock?: AnalogueClockComponent | null;

    setSmooth(smooth: boolean) {
        this.analogueClock?.smoothSeconds.set(smooth);
    }

    setTimezone(tz: string) {
        this.analogueClock?.timezone.set(tz);
    }
}`,
        html: `<div class="sample-card window">
    <h3>⏱️ Analogue Clock 2D Canvas Widget</h3>

    <div class="clock-display">
        <analogue-clock></analogue-clock>
    </div>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="setSmooth(true)">Smooth Sweep (120fps)</button>
        <button type="button" class="button-secondary" onclick="setSmooth(false)">Quartz Step</button>
        <button type="button" class="button-secondary" onclick="setTimezone('Asia/Tokyo')">Tokyo Time</button>
        <button type="button" class="button-secondary" onclick="setTimezone('UTC')">UTC</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }

    .clock-display {
        width: 220px;
        height: 220px;
    }

    .actions-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        justify-content: center;
    }
}`,
    },

    // 21. Component Lifecycle
    'component-lifecycle': {
        id: 'component-lifecycle',
        title: '🧩 Web Component Lifecycle Phases',
        ts: `import { Component, signal, effect } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    lifecycleLog = signal<string[]>([]);

    protected onInit() {
        this.log('Phase 1: onInit() - Template mounted in DOM.');
        this.log('Phase 2: Signals initialized & Handlebars bound.');
    }

    protected onDestroy() {
        console.log('Phase 3: onDestroy() - Component disconnected.');
    }

    log(msg: string) {
        this.lifecycleLog.update(logs => [...logs, \`[\${new Date().toLocaleTimeString()}] \${msg}\`]);
    }
}`,
        html: `<div class="sample-card window">
    <h3>🧩 Web Component Lifecycle Phases</h3>
    
    <div class="log-box">
        <div for="let log of lifecycleLog" class="log-item">{{log}}</div>
    </div>

    <div class="actions-row">
        <button class="button-primary" onclick="log('User triggered state mutation')">+ Add Custom Log Event</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }

    .log-box {
        padding: 14px;
        background: #1b1e2b;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-family: monospace;
        font-size: 12.5px;
        color: #c3e88d;
    }
}`,
    },

    // 22. Directive Lifecycle
    'directive-lifecycle': {
        id: 'directive-lifecycle',
        title: '🏷️ Custom Directive Lifecycle',
        ts: `import { Component, Directive, BaseDirective, signal } from '@purity/core';

@Directive('tracker')
export class TrackerDirective extends BaseDirective {
    onInit() {
        console.log('[Directive] onInit() - Attached to element.');
        this.element.style.padding = '12px';
        this.element.style.borderRadius = '8px';
        this.element.style.background = '#1b1e2b';
        this.onChanges(this.value);
    }

    onChanges(newValue: any) {
        console.log('[Directive] onChanges() ->', newValue);
        this.element.style.borderColor = newValue ? '#c3e88d' : '#ff5370';
        this.element.style.borderWidth = '2px';
        this.element.style.borderStyle = 'solid';
    }

    onDestroy() {
        console.log('[Directive] onDestroy() - Cleaned up.');
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    active = signal<boolean>(true);

    toggle() {
        this.active.update(v => !v);
    }
}`,
        html: `<div class="sample-card window">
    <h3>🏷️ Custom Directive Lifecycle</h3>

    <div [tracker]="active()">
        <span>Directive Host (Status: {{active() ? 'ACTIVE' : 'INACTIVE'}})</span>
    </div>

    <div class="actions-row">
        <button class="button-primary" onclick="toggle()">Toggle Directive State</button>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0; color: #82aaff; }
    .actions-row { display: flex; gap: 10px; }
}`,
    },

    // 23. Validator Lifecycle
    'validator-lifecycle': {
        id: 'validator-lifecycle',
        title: '📋 Form Validator Lifecycle & Pipeline',
        ts: `import { Component, Validator, BaseValidator } from '@purity/core';

@Validator({
    form: '#login-lifecycle-form',
    fields: {
        pin: '#pin-field',
    },
})
export class PinValidator extends BaseValidator {
    validatePin(value: string): boolean {
        return /^[0-9]{4}$/.test(value.trim());
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    onSubmit(e: Event) {
        e.preventDefault();
        alert('PIN Accepted!');
    }
}`,
        html: `<div class="sample-card window">
    <h3>📋 Validator Lifecycle Pipeline</h3>

    <form id="login-lifecycle-form" onsubmit="onSubmit(event)">
        <div class="field-box">
            <label>Security PIN (4 digits):</label>
            <input id="pin-field" type="password" maxlength="4" placeholder="••••" class="input-primary" />
        </div>
        <button type="submit" class="button-primary submit-btn">Submit PIN</button>
    </form>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 16px 0; color: #82aaff; }

    form {
        display: flex;
        flex-direction: column;
        gap: 14px;

        .field-box {
            display: flex;
            flex-direction: column;
            gap: 4px;
            label { font-size: 12px; color: #a6accd; }
        }

        .is-valid { border-color: #2ec27e !important; }
        .is-invalid { border-color: #ed333b !important; }
    }
}`,
    },

    // 24. Bootstrap Lifecycle
    'bootstrap-lifecycle': {
        id: 'bootstrap-lifecycle',
        title: '🚀 Application Bootstrapping Lifecycle',
        ts: `import { Component, signal } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    bootPhases = signal<string[]>([
        '1. ENVIRONMENT token registered into DI container',
        '2. Providers & Services instantiated as singletons',
        '3. HTTP Interceptors pipeline wired to HttpClient',
        '4. ThemeService synchronizes OS / localStorage palette',
        '5. Root custom element defined and mounted in DOM',
        '6. ApplicationRef resolved and ready'
    ]);
}`,
        html: `<div class="sample-card window">
    <h3>🚀 Bootstrapping Sequence</h3>

    <div class="phases-list">
        <div for="let p of bootPhases" class="phase-item">
            <span>✓</span>
            <p>{{p}}</p>
        </div>
    </div>
</div>`,
        scss: `.sample-card {
    padding: 24px;
    background: #232635;
    border-radius: 12px;
    color: #eeffff;

    h3 { margin: 0 0 16px 0; color: #82aaff; }

    .phases-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .phase-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            background: #1b1e2b;
            border-radius: 6px;
            span { color: #c3e88d; font-weight: 800; }
            p { margin: 0; color: #eeffff; font-size: 13px; }
        }
    }
}`,
    },
};

export function getIntroSampleSnippet(sampleId: string): IntroSampleSnippet | null {
    return INTRO_SAMPLE_SNIPPETS[sampleId] || null;
}
