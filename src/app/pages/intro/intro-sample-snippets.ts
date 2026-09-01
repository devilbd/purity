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
        title: '🔄 Fine-Grained Reactive Signals, Effects & Computed Values',
        ts: `import { Component, signal, effect, computed } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    count = signal<number>(5);
    multiplier = signal<number>(2);

    // Derived reactive computed signals
    total = computed(() => this.count() * this.multiplier());
    isEven = computed(() => this.count() % 2 === 0);
    summary = computed(() => \`\${this.count()} items × \${this.multiplier()} = \${this.total()}\`);

    protected onInit() {
        // Effects track dependencies automatically
        effect(() => {
            console.log(\`[Reactivity] count: \${this.count()}, total: \${this.total()}\`);
        });
    }

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
    <h3>🔄 Signals, Computed & Effects</h3>
    <p>Synchronous reactivity with automatic dependency tracking and derived computed signals.</p>

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
            <span class="stat-label">Computed Total</span>
            <span class="stat-value">{{total()}}</span>
        </div>
    </div>

    <div class="derived-badge-row">
        <span class="pill-badge">Parity: {{isEven() ? 'EVEN' : 'ODD'}}</span>
        <span class="pill-badge">Formula: {{summary()}}</span>
    </div>

    <div class="actions-row">
        <button type="button" class="button-primary" onclick="increment()">+1 Increment</button>
        <button type="button" class="button-secondary" onclick="decrement()">-1 Decrement</button>
        <button type="button" class="button-secondary" onclick="reset()">Reset</button>
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0; color: var(--text-secondary); font-size: 13px; }

    .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;

        .stat-box {
            background: var(--gnome-card);
            border: 1px solid var(--gnome-border-subtle);
            padding: 14px;
            border-radius: var(--radius-card, 12px);
            display: flex;
            flex-direction: column;
            gap: 4px;

            .stat-label { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; }
            .stat-value { font-size: 20px; font-weight: 700; color: var(--text-main); }

            &.highlight {
                background: var(--accent-subtle);
                border-color: var(--accent);
                .stat-value { color: var(--accent); }
            }
        }
    }

    .derived-badge-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .pill-badge {
            font-size: 11px;
            padding: 4px 10px;
            border-radius: var(--radius-pill, 999px);
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
            font-weight: 600;
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
        <button type="button" class="button-secondary" onclick="onLogout()">Logout</button>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }

    .user-status-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);

        .status-indicator {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--accent-red, #f66151);

            &.active {
                background: var(--accent-green, #57e389);
                box-shadow: 0 0 10px rgba(87, 227, 137, 0.5);
            }
        }

        h4 { margin: 0; color: var(--text-main); }
        p { margin: 2px 0 0 0; color: var(--text-secondary); font-size: 13px; }
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    .actions-row { display: flex; gap: 10px; flex-wrap: wrap; }

    .result-box {
        padding: 16px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        min-height: 80px;

        .visible { display: block; }
        .hidden { display: none; }

        .todo-details {
            h4 { margin: 0 0 8px 0; color: var(--text-main); }
            .badge {
                padding: 4px 10px;
                border-radius: var(--radius-pill, 999px);
                font-size: 12px;
                font-weight: 700;
                &.done { background: rgba(87, 227, 137, 0.18); color: var(--accent-green, #57e389); }
                &.pending { background: rgba(248, 228, 92, 0.18); color: var(--accent-yellow, #f8e45c); }
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0; color: var(--text-secondary); font-size: 13px; }

    .theme-status {
        padding: 14px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        strong { color: var(--accent); }
    }

    .actions-row { display: flex; gap: 10px; }
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0; color: var(--text-secondary); font-size: 13px; }

    .actions-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;

        .btn-success { background: var(--gnome-success, #2ec27e); color: #fff; }
        .btn-error { background: var(--gnome-error, #ed333b); color: #fff; }
        .btn-warn { background: var(--gnome-warn, #e5a50a); color: #000; }
        .btn-info { background: var(--gnome-info, #3584e4); color: #fff; }
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }

    .result-box {
        padding: 16px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        display: flex;
        align-items: center;
        gap: 12px;

        .label { color: var(--text-secondary); font-weight: 600; }
        .output { font-size: 22px; font-weight: 800; color: var(--accent-green, #57e389); font-family: var(--font-mono, monospace); }
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0 0 16px 0; color: var(--text-main); font-size: 1.25rem; }

    form {
        display: flex;
        flex-direction: column;
        gap: 14px;

        .field-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
            label { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
            input { width: 100%; box-sizing: border-box; }
        }

        .is-valid { border-color: var(--gnome-success, #2ec27e) !important; box-shadow: 0 0 0 2px rgba(46, 194, 126, 0.25); }
        .is-invalid { border-color: var(--gnome-error, #ed333b) !important; box-shadow: 0 0 0 2px rgba(237, 51, 59, 0.25); }

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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }

    .directive-box {
        padding: 24px;
        text-align: center;
        background: var(--gnome-card);
        border-radius: var(--radius-card, 12px);
        border: 2px solid var(--gnome-border-subtle);
        font-weight: 700;
        color: var(--accent);
        transition: all 0.3s ease;

        &.pulse-active {
            border-color: var(--accent-green, #57e389);
            color: var(--accent-green, #57e389);
            box-shadow: 0 0 20px rgba(87, 227, 137, 0.4);
            transform: scale(1.02);
        }
    }

    .actions-row { display: flex; gap: 10px; }
}`,
    },

    // 9. Behaviors
    behaviors: {
        id: 'behaviors',
        title: '🎯 Composable Behaviors (Draggable & Droppable)',
        ts: `import { Component } from '@purity/core';
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
                el.classList.add('is-dropped');
                const title = el.querySelector('.token-title') as HTMLElement | null;
                const icon = el.querySelector('.token-icon') as HTMLElement | null;
                if (title) title.innerText = 'Dropped!';
                if (icon) icon.innerText = '✨';
            },
        });
    }

    protected onDestroy() {
        this.dragCleanup?.destroy();
        this.dropCleanup?.destroy();
    }
}`,
        html: `<div class="sample-card window">
    <div class="header-row">
        <h3>🎯 Composable Drag &amp; Drop Behaviors</h3>
        <span class="badge-pill">GNOME 50 Glassmorphism</span>
    </div>
    <p>Hardware-accelerated pointer interaction with boundary constraints and magnetic snap-to-center.</p>

    <div id="drop-arena" class="arena">
        <div id="drag-token" class="drag-token">
            <div class="token-sheen"></div>
            <span class="token-icon">🖐️</span>
            <div class="token-content">
                <span class="token-title">Drag Token</span>
                <span class="token-sub">Adwaita Glass</span>
            </div>
            <div class="grip-dots">
                <span></span><span></span><span></span>
            </div>
        </div>

        <div id="target-zone" class="target-zone">
            <span class="target-icon">🎯</span>
            <span class="target-label">Drop Target</span>
            <span class="target-hint">Snap Area</span>
        </div>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 4px;

        h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: var(--text-main);
        }

        .badge-pill {
            padding: 3px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: var(--radius-pill, 999px);
            background: var(--accent-subtle);
            color: var(--accent);
            border: 1px solid var(--accent);
        }
    }

    p {
        margin: 0 0 18px 0;
        color: var(--text-secondary);
        font-size: 13.5px;
        line-height: 1.4;
    }

    .arena {
        position: relative;
        height: 240px;
        background: var(--gnome-card);
        border-radius: var(--radius-card, 12px);
        border: 1px solid var(--gnome-border-subtle);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 28px;
        overflow: hidden;

        .drag-token {
            position: relative;
            width: 148px;
            height: 76px;
            border-radius: var(--radius-control, 8px);
            background: var(--accent);
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: var(--shadow-popup);
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0 14px;
            cursor: var(--cursor-grab, grab);
            user-select: none;
            touch-action: none;
            z-index: 10;

            .token-icon { font-size: 24px; }
            .token-title { font-size: 13.5px; font-weight: 700; color: #ffffff; }
            .token-sub { font-size: 10.5px; color: rgba(255, 255, 255, 0.8); }
        }

        .target-zone {
            width: 148px;
            height: 80px;
            border-radius: var(--radius-control, 8px);
            border: 2px dashed var(--accent);
            background: var(--accent-subtle);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            color: var(--accent);

            .target-icon { font-size: 22px; }
            .target-label { font-size: 12px; font-weight: 700; }
            .target-hint { font-size: 10px; opacity: 0.8; }

            &.zone-hover {
                background: rgba(87, 227, 137, 0.2);
                border-color: var(--accent-green, #57e389);
                color: var(--accent-green, #57e389);
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0 0 6px 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0 0 16px 0; color: var(--text-secondary); font-size: 13px; }

    .badge-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        strong { font-size: 18px; color: var(--accent-green, #57e389); }
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    .badge { padding: 6px 12px; background: var(--accent-subtle); border-radius: var(--radius-pill, 999px); color: var(--accent); display: inline-block; font-weight: 600; }
    .actions-row { display: flex; gap: 10px; }
    .result-box { padding: 12px 16px; background: var(--gnome-card); border: 1px solid var(--gnome-border-subtle); border-radius: var(--radius-card, 12px); strong { color: var(--accent-green, #57e389); } }
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    .info-block { padding: 14px; background: var(--gnome-card); border: 1px solid var(--gnome-border-subtle); border-radius: var(--radius-card, 12px); display: flex; flex-direction: column; gap: 6px; strong { color: var(--accent); } }
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }

    .task-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .task-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            background: var(--gnome-card);
            border: 1px solid var(--gnome-border-subtle);
            border-radius: var(--radius-control, 8px);

            .index { color: var(--accent); font-size: 12px; font-weight: 700; }
            .title { flex: 1; color: var(--text-main); }

            &.done .title {
                text-decoration: line-through;
                color: var(--text-secondary);
                opacity: 0.6;
            }
        }
    }
}`,
    },

    // 14. Structural Conditionals
    conditional: {
        id: 'conditional',
        title: '🔀 Structural Conditionals (if / else-if / else)',
        ts: `import { Component, signal } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    isLoggedIn = signal(true);
    userRole = signal<'admin' | 'editor' | 'viewer'>('admin');
    unreadCount = signal(3);

    toggleAuth() {
        this.isLoggedIn.update(v => !v);
    }

    setRole(role: 'admin' | 'editor' | 'viewer') {
        this.userRole.set(role);
    }
}`,
        html: `<div class="sample-card window">
    <h3>🔀 Structural Conditionals (if / else-if / else)</h3>
    <p>Falsy branches are excluded from the DOM and never compiled until active.</p>

    <div class="auth-section">
        <button type="button" class="button-primary" onclick="toggleAuth()">
            {{isLoggedIn() ? '🚪 Logout' : '🔑 Sign In'}}
        </button>

        <div if="isLoggedIn()" class="auth-box auth-active">
            <span class="badge badge-success">Authenticated</span>
            <strong>Welcome back, Developer!</strong>
            <span if="unreadCount() > 0" class="badge-alert">{{unreadCount()}} new notices</span>
            <span else class="badge-muted">All caught up</span>
        </div>
        <div else class="auth-box auth-inactive">
            <span class="badge badge-warn">Guest</span>
            <span>You are currently browsing as a guest.</span>
        </div>
    </div>

    <div if="isLoggedIn()" class="role-section">
        <label>Select Permission Tier:</label>
        <div class="btn-group">
            <button type="button" class="button-secondary {{userRole() === 'admin' ? 'active' : ''}}" onclick="setRole('admin')">Admin</button>
            <button type="button" class="button-secondary {{userRole() === 'editor' ? 'active' : ''}}" onclick="setRole('editor')">Editor</button>
            <button type="button" class="button-secondary {{userRole() === 'viewer' ? 'active' : ''}}" onclick="setRole('viewer')">Viewer</button>
        </div>

        <div if="userRole() === 'admin'" class="role-panel panel-admin">
            🛡️ <strong>Admin Console:</strong> Full root privileges & database access.
        </div>
        <div else-if="userRole() === 'editor'" class="role-panel panel-editor">
            ✏️ <strong>Editor Studio:</strong> Can publish, modify, and draft articles.
        </div>
        <div else class="role-panel panel-viewer">
            👁️ <strong>Viewer Portal:</strong> Read-only access to published content.
        </div>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0; font-size: 13px; color: var(--text-secondary); }

    .auth-section, .role-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
    }

    .auth-box {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: var(--radius-control, 8px);

        &.auth-active { background: rgba(87, 227, 137, 0.1); border: 1px solid var(--accent-green, #57e389); }
        &.auth-inactive { background: rgba(248, 228, 92, 0.1); border: 1px dashed var(--accent-yellow, #f8e45c); }
    }

    .badge {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: var(--radius-pill, 999px);
        &.badge-success { background: var(--accent-green, #57e389); color: #000; }
        &.badge-warn { background: var(--accent-yellow, #f8e45c); color: #000; }
    }

    .badge-alert { font-size: 11px; padding: 2px 8px; border-radius: var(--radius-pill, 999px); background: var(--accent-red, #f66151); color: #ffffff; }
    .badge-muted { font-size: 11px; color: var(--text-secondary); }

    .btn-group { display: flex; gap: 8px; button.active { background: var(--accent); color: #fff; border-color: var(--accent); } }

    .role-panel {
        padding: 12px 14px;
        border-radius: var(--radius-control, 8px);
        font-size: 13.5px;
        &.panel-admin { background: rgba(246, 97, 81, 0.12); border-left: 4px solid var(--accent-red, #f66151); }
        &.panel-editor { background: rgba(248, 228, 92, 0.12); border-left: 4px solid var(--accent-yellow, #f8e45c); }
        &.panel-viewer { background: var(--accent-subtle); border-left: 4px solid var(--accent); }
    }
}`,
    },

    // 15. Virtualized For Repeater (virtual-for)
    virtualScroll: {
        id: 'virtual-scroll',
        title: '⚡ Virtualized For Repeater (100k Items)',
        ts: `import { Component, signal } from '@purity/core';

interface DataRow {
    id: string;
    index: number;
    title: string;
    amount: string;
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    // 50,000 dataset array
    records = signal<DataRow[]>(
        Array.from({ length: 50000 }, (_, i) => ({
            id: \`TXN-\${String(i + 1).padStart(6, '0')}\`,
            index: i,
            title: \`Log Entry #\${i + 1}\`,
            amount: \`$\${((i * 17.5) % 3000 + 5).toFixed(2)}\`,
        }))
    );

    jumpToIndex(index: number) {
        const container = document.querySelector('.virtual-container .p-virtual-scroll-container') as any;
        if (container && typeof container.scrollToIndex === 'function') {
            container.scrollToIndex(index, 'center');
        }
    }
}`,
        html: `<div class="virtual-card window">
    <div class="card-header">
        <h3>⚡ Virtualized List (<code>{{records().length}} items</code>)</h3>
        <button type="button" class="button-primary" onclick="jumpToIndex(25000)">Jump to #25,000</button>
    </div>

    <!-- Virtual Viewport Container -->
    <div class="virtual-container">
        <div
            virtual-for="let item, index of records; itemHeight: 46; buffer: 6; height: 320px"
            class="record-row"
        >
            <span class="idx">#{{index + 1}}</span>
            <span class="id-tag">{{item.id}}</span>
            <strong class="title">{{item.title}}</strong>
            <span class="amt">{{item.amount}}</span>
        </div>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.virtual-card {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        h3 { margin: 0; color: var(--text-main); code { color: var(--accent); } }
    }

    .virtual-container {
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        background: var(--gnome-card);
        overflow: hidden;

        .record-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 14px;
            border-bottom: 1px solid var(--gnome-border-subtle);

            &:hover { background: rgba(255, 255, 255, 0.04); }
            .idx { font-family: var(--font-mono, monospace); font-size: 11px; color: var(--text-secondary); }
            .id-tag { font-family: var(--font-mono, monospace); font-size: 12px; color: var(--accent); }
            .title { flex: 1; font-size: 13px; color: var(--text-main); }
            .amt { font-family: var(--font-mono, monospace); font-weight: 700; color: var(--accent-green, #57e389); font-size: 13px; }
        }
    }
}`,
    },

    // 16. Content Projection (slot)
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0 0 16px 0; color: var(--text-main); font-size: 1.25rem; }

    .card-frame {
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        overflow: hidden;

        .card-header {
            background: var(--accent-subtle);
            padding: 10px 16px;
            font-weight: 700;
            color: var(--accent);
            border-bottom: 1px solid var(--gnome-border-subtle);
        }

        .card-body {
            padding: 16px;
            background: var(--gnome-card);
            color: var(--text-main);
        }
    }
}`,
    },

    // 17. Theming
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }
    .theme-box { padding: 14px; background: var(--gnome-card); border: 1px solid var(--gnome-border-subtle); border-radius: var(--radius-card, 12px); strong { color: var(--accent-green, #57e389); } }
    .actions-row { display: flex; gap: 10px; }
}`,
    },

    // 18. Date Time Picker
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0 0 6px 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0 0 16px 0; color: var(--text-secondary); font-size: 13px; }

    .picker-container {
        display: flex;
        justify-content: center;
        padding: 20px 0;
    }
}`,
    },

    // 19. Radial Menu
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);
    min-height: 240px;
    cursor: var(--cursor-pointer);

    h3 { margin: 0 0 6px 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0 0 16px 0; color: var(--text-secondary); font-size: 13px; }

    .click-hint {
        padding: 40px 20px;
        border: 2px dashed var(--accent);
        border-radius: var(--radius-card, 12px);
        background: var(--accent-subtle);
        text-align: center;
        color: var(--accent);
        font-weight: 600;
    }
}`,
    },

    // 20. Context Menu Delegation
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0 0 6px 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0 0 16px 0; color: var(--text-secondary); font-size: 13px; }

    .arena-box {
        padding: 40px;
        background: var(--gnome-card);
        border: 2px solid var(--accent);
        border-radius: var(--radius-card, 12px);
        text-align: center;
        font-weight: 700;
        color: var(--accent);
        cursor: var(--cursor-pointer);
    }
}`,
    },

    // 21. Modal Dialog
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0 0 6px 0; color: var(--text-main); font-size: 1.25rem; }
    p { margin: 0 0 16px 0; color: var(--text-secondary); font-size: 13px; }

    .dialog-content {
        h4 { margin: 0 0 8px 0; color: var(--accent); }
        p { margin: 0; color: var(--text-main); }
    }
}`,
    },

    // 22. Clock
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }

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

    // 23. Component Lifecycle
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
} `,
        html: `<div class="sample-card window">
    <h3>🧩 Web Component Lifecycle Phases</h3>
    
    <div class="log-box">
        <div for="let log of lifecycleLog" class="log-item">{{log}}</div>
    </div>

    <div class="actions-row">
        <button class="button-primary" onclick="log('User triggered state mutation')">+ Add Custom Log Event</button>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }

    .log-box {
        padding: 14px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-family: var(--font-mono, monospace);
        font-size: 12.5px;
        color: var(--accent-green, #57e389);
    }

    .actions-row { display: flex; gap: 10px; }
}`,
    },

    // 24. Directive Lifecycle
    'directive-lifecycle': {
        id: 'directive-lifecycle',
        title: '🏷️ Custom Directive Lifecycle',
        ts: `import { Component, Directive, BaseDirective, signal } from '@purity/core';

@Directive('tracker')
export class TrackerDirective extends BaseDirective {
    onInit() {
        console.log('[Directive] onInit() - Attached to element.');
        this.element.classList.add('tracker-host');
        this.onChanges(this.value);
    }

    onChanges(newValue: any) {
        console.log('[Directive] onChanges() ->', newValue);
        this.element.classList.toggle('tracker-active', !!newValue);
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

    <div [tracker]="active()" class="tracker-card">
        <span>Directive Host (Status: <strong>{{active() ? 'ACTIVE' : 'INACTIVE'}}</strong>)</span>
    </div>

    <div class="actions-row">
        <button class="button-primary" onclick="toggle()">Toggle Directive State</button>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0; color: var(--text-main); font-size: 1.25rem; }

    .tracker-card {
        padding: 16px;
        background: var(--gnome-card);
        border: 2px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        text-align: center;
        color: var(--text-main);
        transition: all 0.25s ease;

        &.tracker-active {
            border-color: var(--accent-green, #57e389);
            strong { color: var(--accent-green, #57e389); }
        }
    }

    .actions-row { display: flex; gap: 10px; }
}`,
    },

    // 25. Validator Lifecycle
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0 0 16px 0; color: var(--text-main); font-size: 1.25rem; }

    form {
        display: flex;
        flex-direction: column;
        gap: 14px;

        .field-box {
            display: flex;
            flex-direction: column;
            gap: 4px;
            label { font-size: 12px; color: var(--text-secondary); font-weight: 600; }
        }

        .is-valid { border-color: var(--gnome-success, #2ec27e) !important; }
        .is-invalid { border-color: var(--gnome-error, #ed333b) !important; }
    }
}`,
    },

    // 26. Bootstrap Lifecycle
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
        scss: `@use '@styles' as *;

.sample-card {
    padding: 24px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    h3 { margin: 0 0 16px 0; color: var(--text-main); font-size: 1.25rem; }

    .phases-list {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .phase-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            background: var(--gnome-card);
            border: 1px solid var(--gnome-border-subtle);
            border-radius: var(--radius-control, 8px);
            span { color: var(--accent-green, #57e389); font-weight: 800; }
            p { margin: 0; color: var(--text-main); font-size: 13px; }
        }
    }
}`,
    },

    // 27. Signal Routing & Layout Engine
    router: {
        id: 'router',
        title: '🗺️ Signal Router & Layout Engine',
        ts: `import { Component, signal, effect, inject, Router, type Route } from '@purity/core';

@Component({
    selector: 'home-view',
    template: \`
        <div class="view-card home-card">
            <h4>🏠 Dashboard Home</h4>
            <p>Instant client-side subview transitions with fine-grained reactivity.</p>
            <div class="pill-badge">Reactivity: Synchronous Signals</div>
        </div>
    \`
})
export class HomeViewComponent {}

@Component({
    selector: 'user-view',
    template: \`
        <div class="view-card user-card">
            <h4>👤 User Profile: <code>{{userId()}}</code></h4>
            <p>Dynamic token extracted reactively from <code>/users/:id</code></p>
            <div class="pill-badge">Parameter: {{userId()}}</div>
        </div>
    \`
})
export class UserViewComponent {
    private router = inject(Router);
    userId = signal('anonymous');

    protected onInit() {
        effect(() => {
            this.userId.set(this.router.params().id || 'anonymous');
        });
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    public router = inject(Router);

    private routes: Route[] = [
        { path: '/', component: HomeViewComponent },
        { path: '/users/:id', component: UserViewComponent },
    ];

    protected onInit() {
        this.router.configureRoutes(this.routes, { mode: 'memory', initialUrl: '/' });
    }

    goTo(path: string) {
        this.router.navigateByUrl(path);
    }
}`,
        html: `<div class="router-playground-demo window">
    <div class="demo-header">
        <h3>🗺️ Signal Router &amp; Layout</h3>
        <span class="url-chip"><code>{{router.url()}}</code></span>
    </div>

    <!-- Navigation Tabs -->
    <div class="nav-toolbar">
        <button type="button" class="button-secondary nav-btn {{router.path() === '/' ? 'active' : ''}}" onclick="goTo('/')">
            🏠 Home
        </button>
        <button type="button" class="button-secondary nav-btn {{router.path() === '/users/alice' ? 'active' : ''}}" onclick="goTo('/users/alice')">
            👤 Alice
        </button>
        <button type="button" class="button-secondary nav-btn {{router.path() === '/users/bob' ? 'active' : ''}}" onclick="goTo('/users/bob')">
            👤 Bob
        </button>
    </div>

    <!-- The Router Layout Viewport -->
    <div class="layout-viewport">
        <router-layout></router-layout>
    </div>

    <!-- Live Signal Readout -->
    <div class="signal-inspector-bar">
        <span>Active Path: <code>{{router.path()}}</code></span>
    </div>
</div>`,
        scss: `@use '@styles' as *;

.router-playground-demo {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: var(--gnome-surface);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-window, 16px);
    backdrop-filter: var(--blur-effect);
    -webkit-backdrop-filter: var(--blur-effect);
    box-shadow: var(--shadow-popup);
    color: var(--text-main);

    .demo-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        h3 {
            margin: 0;
            color: var(--text-main);
            font-size: 1.25rem;
        }

        .url-chip {
            padding: 4px 10px;
            background: var(--gnome-card);
            border: 1px solid var(--gnome-border-subtle);
            border-radius: var(--radius-pill, 999px);
            font-size: 12px;
            code { color: var(--accent-green, #57e389); font-weight: 600; }
        }
    }

    .nav-toolbar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .nav-btn {
            &.active {
                background: var(--accent);
                color: #ffffff;
                border-color: var(--accent);
            }
        }
    }

    .layout-viewport {
        padding: 16px;
        background: var(--gnome-card);
        border: 1px solid var(--gnome-border-subtle);
        border-radius: var(--radius-card, 12px);
        min-height: 110px;

        .view-card {
            display: flex;
            flex-direction: column;
            gap: 8px;

            h4 {
                margin: 0;
                color: var(--accent);
                font-size: 15px;
                code { color: var(--accent-yellow, #f8e45c); }
            }

            p {
                margin: 0;
                font-size: 13px;
                color: var(--text-secondary);
                code { color: var(--accent); }
            }

            .pill-badge {
                align-self: flex-start;
                padding: 3px 8px;
                background: var(--accent-subtle);
                border: 1px solid var(--accent);
                color: var(--accent);
                border-radius: var(--radius-pill, 999px);
                font-size: 11px;
                font-weight: 600;
            }
        }
    }

    .signal-inspector-bar {
        font-size: 12px;
        color: var(--text-secondary);
        code { color: var(--accent-yellow, #f8e45c); font-family: var(--font-mono, monospace); }
    }
}`,
    },
};

export function getIntroSampleSnippet(sampleId: string): IntroSampleSnippet | null {
    return INTRO_SAMPLE_SNIPPETS[sampleId] || null;
}
