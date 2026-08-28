import { Component, signal, effect, inject } from '@purity/core';
import './playground.component.scss';
import * as purityCore from '@purity/core';
import { DataService } from '@data/data.service';
import { ThemeService } from '@data/theme.service';
import { NotifyService } from '@data/notify.service';
import { FirebaseService, initGoogleAnalytics, logAnalyticsEvent } from '@data/firebase';
import { drag } from '@behaviors/draggable/draggable';
import { droppable } from '@behaviors/droppable/droppable';
import { transform } from 'sucrase';
import Prism from '@external/prism-loader';

// Shared UI Web Components
import '@components/loader/loader.component';
import { LoaderComponent } from '@components/loader/loader.component';
import '@components/modal/modal-view.component';
import { ModalViewComponent } from '@components/modal/modal-view.component';
import '@components/notification/notification.component';
import { NotificationComponent } from '@components/notification/notification.component';
import '@components/date-time-picker/date-time-picker.component';
import { DateTimePickerComponent } from '@components/date-time-picker/date-time-picker.component';
import '@components/radial-context-menu/radial-context-menu.component';
import { RadialContextMenuComponent } from '@components/radial-context-menu/radial-context-menu.component';

// Standalone Widgets
import '@widgets/analogue-clock/analogue-clock.component';
import { AnalogueClockComponent } from '@widgets/analogue-clock/analogue-clock.component';

// Directives, Pipes & Validators
import '@directives/highlight.directive';
import { HighlightDirective } from '@directives/highlight.directive';
import '@pipes/uppercase.pipe';
import { UppercasePipe } from '@pipes/uppercase.pipe';
import '@pipes/date.pipe';
import { DatePipe } from '@pipes/date.pipe';
import '@pipes/transform-sample.pipe';
import { MyTransformPipe } from '@pipes/transform-sample.pipe';
import '@validators/forms-validation.validator';
import { FormsValidationValidator } from '@validators/forms-validation.validator';

export interface CodePreset {
    id: string;
    name: string;
    description: string;
    ts: string;
    html: string;
    scss: string;
    isCustom?: boolean;
    createdAt?: number;
}

const PLAYGROUND_HISTORY_STORAGE_KEY = 'PURITY_PLAYGROUND_HISTORY';

function loadPlaygroundHistory(): CodePreset[] {
    if (typeof localStorage === 'undefined') return [];
    try {
        const raw = localStorage.getItem(PLAYGROUND_HISTORY_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('[Playground] Failed to load history from localStorage:', e);
    }
    return [];
}

function savePlaygroundHistory(history: CodePreset[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(PLAYGROUND_HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('[Playground] Failed to save history to localStorage:', e);
    }
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
        padding: 10px 16px;
    }

    .selected-result {
        padding: 12px 16px;
        background: #1b1e2b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        color: #c3e88d;
    }
}`,
    },
    {
        id: 'counter',
        name: '⚡ Reactive Signals & Computed Values',
        description: 'Fine-grained signals, derived computed() values, and reactive effects.',
        ts: `import { Component, signal, effect, computed } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    count = signal(4);
    multiplier = signal(3);

    // Derived reactive computed signals
    doubled = computed(() => this.count() * this.multiplier());
    isEven = computed(() => this.count() % 2 === 0);
    status = computed(() => (this.count() >= 10 ? '🔥 High Output' : '🌱 Steady State'));

    protected onInit() {
        // Effects track dependencies automatically
        effect(() => {
            console.log(\`[Reactivity] count: \${this.count()}, doubled: \${this.doubled()}, isEven: \${this.isEven()}\`);
        });
    }

    onIncrement() {
        this.count.update(n => n + 1);
    }

    onDecrement() {
        this.count.update(n => Math.max(0, n - 1));
    }

    onMultiply() {
        this.multiplier.update(m => (m >= 10 ? 2 : m + 1));
    }

    onReset() {
        this.count.set(0);
        this.multiplier.set(2);
    }
}`,
        html: `<div class="counter-card window">
    <h3>⚡ Reactive Signals & Computed Values</h3>
    <p>Fine-grained <code>signal()</code>, derived <code>computed()</code>, and automatic <code>effect()</code> tracking.</p>

    <div class="stat-display">
        <div class="stat-main-row">
            <span class="stat-num">{{count()}}</span>
            <span class="badge {{isEven() ? 'badge-even' : 'badge-odd'}}">{{isEven() ? 'EVEN' : 'ODD'}}</span>
        </div>
        <div class="stat-breakdown">
            <span>Multiplier: <strong>×{{multiplier()}}</strong></span>
            <span>Computed Total: <strong>{{doubled()}}</strong></span>
            <span>Status: <strong class="status-tag">{{status()}}</strong></span>
        </div>
    </div>

    <div class="button-row">
        <button type="button" class="button-primary" onclick="onIncrement()">➕ Increment</button>
        <button type="button" class="button-secondary" onclick="onDecrement()">➖ Decrement</button>
        <button type="button" class="button-secondary" onclick="onMultiply()">✖️ Multiplier +1</button>
        <button type="button" class="button-cancel" onclick="onReset()">↺ Reset</button>
    </div>
</div>`,
        scss: `.counter-card {
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
        font-size: 1.2rem;
    }

    p {
        margin: 0;
        color: #a6accd;
        font-size: 13px;
    }

    .stat-display {
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #1b1e2b;
        padding: 16px;
        border-radius: 8px;

        .stat-main-row {
            display: flex;
            align-items: center;
            gap: 12px;

            .stat-num {
                font-size: 2.8rem;
                font-weight: 800;
                color: #c3e88d;
                font-family: monospace;
                line-height: 1;
            }

            .badge {
                font-size: 11px;
                font-weight: 700;
                padding: 4px 8px;
                border-radius: 4px;

                &.badge-even {
                    background: rgba(195, 232, 141, 0.2);
                    color: #c3e88d;
                }

                &.badge-odd {
                    background: rgba(255, 203, 107, 0.2);
                    color: #ffcb6b;
                }
            }
        }

        .stat-breakdown {
            display: flex;
            gap: 16px;
            font-size: 0.9rem;
            color: #89ddff;
            flex-wrap: wrap;

            strong {
                color: #ffffff;
            }

            .status-tag {
                color: #f78c6c;
            }
        }
    }

    .button-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
}`,
    },
    {
        id: 'pipes',
        name: '🔀 Handlebars Transform Pipes',
        description: 'Pipes with dynamic reactive signal parameters.',
        ts: `import { Component, signal, Pipe, BasePipe } from '@purity/core';

@Pipe('prefixUpper')
export class PrefixUpperPipe extends BasePipe {
    transform(value: any, isUpper: boolean = true, prefix: string = '✨'): string {
        if (!value) return '';
        const str = String(value);
        const formatted = isUpper ? str.toUpperCase() : str.toLowerCase();
        return \`\${prefix} \${formatted}\`;
    }
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    text = signal('Purity Web Framework');
    isUppercase = signal(true);

    onTextInput(el: HTMLInputElement) {
        this.text.set(el.value);
    }

    toggleCase() {
        this.isUppercase.update(v => !v);
    }
}`,
        html: `<div class="pipe-demo window">
    <h3>🔀 Transform Pipe Playground</h3>
    <input
        type="text"
        class="input-primary"
        value="{{text()}}"
        oninput="onTextInput(this)"
        placeholder="Type text..."
    />
    <button type="button" class="button-secondary" onclick="toggleCase()">
        Toggle Signal ({{isUppercase() ? 'UPPERCASE' : 'lowercase'}})
    </button>
    <div class="result-box">
        <label>Formatted Result:</label>
        <strong>{{text() | prefixUpper: isUppercase() : '🚀'}}</strong>
    </div>
</div>`,
        scss: `.pipe-demo {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #232635;
    border: 1px solid rgba(199, 146, 234, 0.25);
    border-radius: 12px;
    color: #eeffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

    h3 {
        margin: 0;
        color: #c792ea;
    }

    .result-box {
        margin-top: 6px;
        padding: 14px;
        background: #1b1e2b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;

        label {
            font-size: 12px;
            color: #676e95;
        }

        strong {
            font-size: 1.15rem;
            color: #ffcb6b;
            font-family: monospace;
        }
    }
}`,
    },
    {
        id: 'array-loop',
        name: '🔁 Structural Array Repeater',
        description: 'Declarative for loop with nested tag badges.',
        ts: `import { Component, signal } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    newTitle = signal('');
    tasks = signal([
        { id: 1, title: 'Learn Purity Signals', done: true, tag: 'Core' },
        { id: 2, title: 'Build Web Components', done: false, tag: 'UI' },
        { id: 3, title: 'Test Live Playground', done: false, tag: 'Sandpack' },
    ]);

    onTitleInput(el: HTMLInputElement) {
        this.newTitle.set(el.value);
    }

    addTask() {
        const title = this.newTitle().trim();
        if (!title) return;
        this.tasks.update(list => [
            ...list,
            { id: Date.now(), title, done: false, tag: 'Task' }
        ]);
        this.newTitle.set('');
    }

    toggleTask(id: number) {
        this.tasks.update(list =>
            list.map(t => (t.id === id ? { ...t, done: !t.done } : t))
        );
    }

    removeTask(id: number) {
        this.tasks.update(list => list.filter(t => t.id !== id));
    }
}`,
        html: `<div class="tasks-demo window">
    <h3>🔁 Tasks Repeater (<code>for="let t of tasks"</code>)</h3>
    <div class="input-row">
        <input
            type="text"
            class="input-primary"
            value="{{newTitle()}}"
            placeholder="New task title..."
            oninput="onTitleInput(this)"
        />
        <button type="button" class="button-primary" onclick="addTask()">➕ Add</button>
    </div>
    <div class="tasks-list">
        <div for="let t, i of tasks" class="task-item">
            <span class="task-num">#{{i + 1}}</span>
            <span class="task-title {{t.done ? 'task-done' : ''}}" onclick="toggleTask(t.id)">
                {{t.title}}
            </span>
            <span class="task-tag">{{t.tag}}</span>
            <button type="button" class="button-cancel delete-btn" onclick="removeTask(t.id)">✕</button>
        </div>
    </div>
</div>`,
        scss: `.tasks-demo {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #232635;
    border: 1px solid rgba(130, 170, 255, 0.2);
    border-radius: 12px;
    color: #eeffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

    h3 {
        margin: 0;
        color: #82aaff;
    }

    .input-row {
        display: flex;
        gap: 8px;
    }

    .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 6px;
    }

    .task-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: #1b1e2b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;

        .task-num {
            font-family: monospace;
            font-size: 11px;
            color: #676e95;
        }

        .task-title {
            flex: 1;
            cursor: pointer;
            color: #eeffff;

            &.task-done {
                text-decoration: line-through;
                color: #676e95;
            }
        }

        .task-tag {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(130, 170, 255, 0.18);
            color: #82aaff;
        }

        .delete-btn {
            padding: 2px 7px;
            font-size: 10px;
            cursor: pointer;
        }
    }
}`,
    },
    {
        id: 'conditional',
        name: '🔀 Structural Conditionals (if/else)',
        description: 'Lazy template compilation and multi-branch condition evaluation with if, else-if, and else.',
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

    addNotification() {
        this.unreadCount.update(c => c + 1);
    }

    clearNotifications() {
        this.unreadCount.set(0);
    }
}`,
        html: `<div class="conditional-demo window">
    <h3>🔀 Structural Conditionals (<code>if</code> / <code>else-if</code> / <code>else</code>)</h3>
    <p>Falsy branches are completely excluded from the DOM and never compiled until active.</p>

    <!-- 1. Authentication State -->
    <div class="card-section">
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

    <!-- 2. Multi-branch Role Selector -->
    <div if="isLoggedIn()" class="card-section">
        <label>Select Permission Tier:</label>
        <div class="btn-group">
            <button type="button" class="button-primary {{userRole() === 'admin' ? 'active' : ''}}" onclick="setRole('admin')">Admin</button>
            <button type="button" class="button-primary {{userRole() === 'editor' ? 'active' : ''}}" onclick="setRole('editor')">Editor</button>
            <button type="button" class="button-primary {{userRole() === 'viewer' ? 'active' : ''}}" onclick="setRole('viewer')">Viewer</button>
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
        scss: `.conditional-demo {
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

    p {
        margin: 0;
        font-size: 13px;
        color: #8f93a2;
    }

    .card-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
        background: #1b1e2b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
    }

    .auth-box {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 6px;

        &.auth-active {
            background: rgba(195, 232, 141, 0.1);
            border: 1px solid rgba(195, 232, 141, 0.3);
        }

        &.auth-inactive {
            background: rgba(255, 203, 107, 0.1);
            border: 1px dashed rgba(255, 203, 107, 0.3);
        }
    }

    .badge {
        font-size: 11px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 4px;

        &.badge-success {
            background: #c3e88d;
            color: #1b1e2b;
        }

        &.badge-warn {
            background: #ffcb6b;
            color: #1b1e2b;
        }
    }

    .badge-alert {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 12px;
        background: #ff5370;
        color: #ffffff;
    }

    .badge-muted {
        font-size: 11px;
        color: #676e95;
    }

    .btn-group {
        display: flex;
        gap: 8px;

        button.active {
            box-shadow: 0 0 0 2px #82aaff;
        }
    }

    .role-panel {
        padding: 12px 14px;
        border-radius: 6px;
        font-size: 13.5px;

        &.panel-admin {
            background: rgba(130, 170, 255, 0.12);
            border-left: 4px solid #82aaff;
        }

        &.panel-editor {
            background: rgba(255, 203, 107, 0.12);
            border-left: 4px solid #ffcb6b;
        }

        &.panel-viewer {
            background: rgba(195, 232, 141, 0.12);
            border-left: 4px solid #c3e88d;
        }
    }
}`,
    },
    {
        id: 'virtual-scroll',
        name: '⚡ Virtualized Repeater (100k Items)',
        description: 'Ultra-high performance virtualized scrolling for massive datasets with 60fps GPU rendering and indexed positions.',
        ts: `import { Component, signal, computed } from '@purity/core';

interface UserRecord {
    id: string;
    index: number;
    name: string;
    role: string;
    balance: string;
}

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    itemCount = signal(50000);
    searchQuery = signal('');
    jumpIndex = signal(0);
    
    // Generate large dataset on startup
    users = signal<UserRecord[]>(
        Array.from({ length: 50000 }, (_, i) => ({
            id: \`USR-\${String(i + 1).padStart(6, '0')}\`,
            index: i,
            name: \`User \${i + 1}\`,
            role: i % 4 === 0 ? 'Admin' : i % 3 === 0 ? 'Developer' : 'Member',
            balance: \`$\${((i * 19.3) % 4000 + 10).toFixed(2)}\`,
        }))
    );

    filteredUsers = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        const all = this.users();
        if (!q) return all;
        return all.filter(u => u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
    });

    onSearch(input: HTMLInputElement) {
        this.searchQuery.set(input.value);
    }

    jumpTo(index: number) {
        this.jumpIndex.set(index);
    }
}`,
        html: `<div class="virtual-demo window">
    <div class="header">
        <h3>⚡ Virtualized List (<code>{{filteredUsers().length}} items</code>)</h3>
        <p>Renders only ~20 visible DOM nodes in the viewport with smooth 60fps scrolling.</p>
    </div>

    <!-- Quick Jump Toolbar -->
    <div class="toolbar">
        <input
            type="text"
            class="input-primary search-box"
            placeholder="Search records..."
            oninput="onSearch(this)"
        />
        <div class="jump-btns">
            <button type="button" class="button-primary btn-sm" onclick="jumpTo(0)">Top #0</button>
            <button type="button" class="button-primary btn-sm" onclick="jumpTo(10000)">#10,000</button>
            <button type="button" class="button-primary btn-sm" onclick="jumpTo(25000)">#25,000</button>
            <button type="button" class="button-primary btn-sm" onclick="jumpTo(49999)">End #50k</button>
        </div>
    </div>

    <!-- Virtualized Scroll Viewport -->
    <div class="virtual-container">
        <div
            virtual-for="let user, index of filteredUsers; itemHeight: 48; buffer: 6; height: 340px; scrollIndex: jumpIndex"
            class="user-row"
        >
            <span class="idx-pill">#{{index + 1}}</span>
            <span class="uid">{{user.id}}</span>
            <strong class="name">{{user.name}}</strong>
            <span class="role role-{{user.role}}">{{user.role}}</span>
            <span class="balance">{{user.balance}}</span>
        </div>
    </div>
</div>`,
        scss: `.virtual-demo {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background: #232635;
    border: 1px solid rgba(130, 170, 255, 0.2);
    border-radius: 12px;
    color: #eeffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

    .header {
        h3 { margin: 0; color: #82aaff; code { color: #ffcb6b; font-size: 14px; } }
        p { margin: 4px 0 0 0; font-size: 13px; color: #8f93a2; }
    }

    .toolbar {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;

        .search-box {
            flex: 1 1 200px;
            padding: 6px 12px;
            font-size: 13px;
        }

        .jump-btns {
            display: flex;
            gap: 6px;

            .btn-sm {
                padding: 4px 10px;
                font-size: 11.5px;
            }
        }
    }

    .virtual-container {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: #1b1e2b;
        overflow: hidden;

        .user-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            box-sizing: border-box;

            &:hover { background: rgba(255, 255, 255, 0.04); }

            .idx-pill {
                font-size: 11px;
                font-family: monospace;
                padding: 2px 6px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 4px;
                color: #a6accd;
            }

            .uid {
                font-size: 12px;
                font-family: monospace;
                color: #82aaff;
            }

            .name {
                flex: 1;
                font-size: 13.5px;
            }

            .role {
                font-size: 11px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 12px;

                &.role-Admin { background: rgba(255, 83, 112, 0.15); color: #ff5370; }
                &.role-Developer { background: rgba(130, 170, 255, 0.15); color: #82aaff; }
                &.role-Member { background: rgba(195, 232, 141, 0.15); color: #c3e88d; }
            }

            .balance {
                font-family: monospace;
                font-weight: 700;
                font-size: 13px;
                color: #ffcb6b;
            }
        }
    }
}`,
    },
    {
        id: 'routing',
        name: '🗺️ Signal Router & Layout',
        description: 'Client-side routing with <router-layout>, dynamic parameters (:id), and reactive state.',
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
        <button type="button" class="nav-btn {{router.path() === '/' ? 'active' : ''}}" onclick="goTo('/')">
            🏠 Home
        </button>
        <button type="button" class="nav-btn {{router.path() === '/users/alice' ? 'active' : ''}}" onclick="goTo('/users/alice')">
            👤 Alice
        </button>
        <button type="button" class="nav-btn {{router.path() === '/users/bob' ? 'active' : ''}}" onclick="goTo('/users/bob')">
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
        scss: `.router-playground-demo {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #232635;
    border: 1px solid rgba(130, 170, 255, 0.2);
    border-radius: 12px;
    color: #eeffff;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);

    .demo-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;

        h3 {
            margin: 0;
            color: #82aaff;
            font-size: 18px;
        }

        .url-chip {
            padding: 4px 10px;
            background: #1b1e2b;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            font-size: 12px;
            code { color: #c3e88d; font-weight: 600; }
        }
    }

    .nav-toolbar {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .nav-btn {
            padding: 6px 14px;
            font-size: 13px;
            font-weight: 500;
            background: #1b1e2b;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #eeffff;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
                background: #292d3e;
                border-color: rgba(130, 170, 255, 0.4);
            }

            &.active {
                background: #82aaff;
                color: #1b1e2b;
                font-weight: 700;
                border-color: #82aaff;
            }
        }
    }

    .layout-viewport {
        padding: 16px;
        background: #1b1e2b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        min-height: 110px;

        .view-card {
            display: flex;
            flex-direction: column;
            gap: 8px;

            h4 {
                margin: 0;
                color: #c3e88d;
                font-size: 15px;
                code { color: #ffcb6b; }
            }

            p {
                margin: 0;
                font-size: 13px;
                color: #a6accd;
                code { color: #82aaff; }
            }

            .pill-badge {
                align-self: flex-start;
                padding: 3px 8px;
                background: rgba(195, 232, 141, 0.15);
                border: 1px solid rgba(195, 232, 141, 0.3);
                color: #c3e88d;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
            }
        }
    }

    .signal-inspector-bar {
        font-size: 12px;
        color: #a6accd;
        code { color: #ffcb6b; }
    }
}`,
    },
    {
        id: 'behaviors',
        name: '🎯 Drag & Drop Behaviors',
        description: 'Composable pointer-based drag & droppable interaction with container constraints and center snapping.',
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
                el.innerText = '🎯 Dropped!';
                el.style.background = '#2ec27e';
            },
        });
    }

    protected onDestroy() {
        this.dragCleanup?.destroy();
        this.dropCleanup?.destroy();
    }
}`,
        html: `<div class="sample-card window">
    <h3>🎯 Drag &amp; Drop Behaviors</h3>
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
];

/**
 * Parses class bodies and transforms property-level decorators like @ViewChild and @ChildView
 * into valid ES class properties with prototype decorator bindings.
 */
function transformAllClasses(cleanJs: string): { code: string; postStatements: string[] } {
    const postStatements: string[] = [];
    let result = '';
    let i = 0;

    while (i < cleanJs.length) {
        const classIndex = cleanJs.indexOf('class ', i);
        if (classIndex === -1) {
            result += cleanJs.slice(i);
            break;
        }

        result += cleanJs.slice(i, classIndex);

        const classOpenBraceIndex = cleanJs.indexOf('{', classIndex);
        if (classOpenBraceIndex === -1) {
            result += cleanJs.slice(classIndex);
            break;
        }

        const header = cleanJs.slice(classIndex, classOpenBraceIndex);
        const nameMatch = header.match(/class\s+([A-Za-z0-9_$]+)/);
        const className = nameMatch ? nameMatch[1] : null;

        let depth = 1;
        let inString: string | null = null;
        let inComment = false;
        let j = classOpenBraceIndex + 1;

        while (j < cleanJs.length && depth > 0) {
            const ch = cleanJs[j];
            const prev = cleanJs[j - 1];

            if (inString) {
                if (ch === inString && prev !== '\\') inString = null;
            } else if (inComment) {
                if (ch === '/' && prev === '*') inComment = false;
            } else {
                if (ch === '"' || ch === "'" || ch === '`') {
                    inString = ch;
                } else if (ch === '/' && cleanJs[j + 1] === '*') {
                    inComment = true;
                    j++;
                } else if (ch === '/' && cleanJs[j + 1] === '/') {
                    const nextNl = cleanJs.indexOf('\n', j);
                    if (nextNl !== -1) j = nextNl;
                } else if (ch === '{') {
                    depth++;
                } else if (ch === '}') {
                    depth--;
                }
            }
            j++;
        }

        const classBody = cleanJs.slice(classOpenBraceIndex + 1, j - 1);

        if (className) {
            const transformedBody = classBody.replace(
                /@(?:ViewChild|ChildView)(?:\s*\(\s*([\s\S]*?)\s*\))?\s*(?:public\s+|private\s+|protected\s+)?([a-zA-Z0-9_$]+)(?:\s*=\s*[^;\n]+)?(?:\s*;)?/g,
                (_, args, prop) => {
                    const argStr = args && args.trim() ? args.trim() : '';
                    postStatements.push(`__purity.ViewChild(${argStr})(${className}.prototype, '${prop}');`);
                    return '';
                },
            );
            result += header + '{' + transformedBody + '}';
        } else {
            result += cleanJs.slice(classIndex, j);
        }

        i = j;
    }

    return { code: result, postStatements };
}

@Component({
    selector: 'playground-view',
    templateUrl: './src/app/pages/playground/playground.component.html',
})
export class PlaygroundComponent {
    private notify = inject(NotifyService);

    activeTab = signal<'ts' | 'html' | 'scss'>('ts');
    selectedPresetId = signal<string>(PLAYGROUND_PRESETS[0].id);
    statusMessage = signal<string>('● Ready');
    isError = signal<boolean>(false);
    errorMessage = signal<string>('');

    savedPresets = signal<CodePreset[]>(loadPlaygroundHistory());

    tsCode = signal<string>(PLAYGROUND_PRESETS[0].ts);
    htmlCode = signal<string>(PLAYGROUND_PRESETS[0].html);
    scssCode = signal<string>(PLAYGROUND_PRESETS[0].scss);

    private previewContainer?: HTMLElement | null;
    private compileDebounceTimer?: number;
    private compilationCount = 0;

    get currentCode(): string {
        switch (this.activeTab()) {
            case 'ts':
                return this.tsCode();
            case 'html':
                return this.htmlCode();
            case 'scss':
                return this.scssCode();
        }
    }

    get lineNumbers(): number[] {
        const lines = this.currentCode.split('\n').length;
        return Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1);
    }

    get allPresets(): CodePreset[] {
        return [...PLAYGROUND_PRESETS, ...this.savedPresets()];
    }

    get isCustomSelected(): boolean {
        return this.savedPresets().some(p => p.id === this.selectedPresetId());
    }

    protected onInit() {
        // Auto compile & update syntax highlighting whenever code changes
        effect(() => {
            this.activeTab();
            this.tsCode();
            this.htmlCode();
            this.scssCode();

            this.updateHighlight();
            this.scheduleCompile();
        });

        // Ensure syntax highlighting executes on initial load frames
        this.updateHighlight();
        requestAnimationFrame(() => this.updateHighlight());
        setTimeout(() => this.updateHighlight(), 50);

        if (typeof window !== 'undefined') {
            window.addEventListener('purity:load-playground-snippet', (e: any) => {
                if (e?.detail) {
                    this.loadSnippet(e.detail);
                }
            });

            // Bind continuous scroll lock on textarea
            setTimeout(() => {
                const root: HTMLElement = (this as any).nodeType === 1 ? (this as any) : document.body;
                const textarea = root.querySelector?.('.code-textarea') as HTMLTextAreaElement | null;
                if (textarea) {
                    const sync = () => this.onScroll(textarea);
                    textarea.addEventListener('scroll', sync, { passive: true });
                    textarea.addEventListener('input', sync, { passive: true });
                    textarea.addEventListener('select', sync, { passive: true });
                    textarea.addEventListener('mouseup', sync, { passive: true });
                    textarea.addEventListener('keyup', sync, { passive: true });
                }
            }, 50);
        }
    }

    loadSnippet(snippet: { id?: string; title?: string; ts?: string; html?: string; scss?: string }) {
        if (snippet.ts !== undefined) this.tsCode.set(snippet.ts);
        if (snippet.html !== undefined) this.htmlCode.set(snippet.html);
        if (snippet.scss !== undefined) this.scssCode.set(snippet.scss);
        if (snippet.id) this.selectedPresetId.set(snippet.id);
        this.updateHighlight();
        this.runCompile();
    }

    setTab(tab: 'ts' | 'html' | 'scss') {
        this.activeTab.set(tab);
        const root: HTMLElement = (this as any).nodeType === 1 ? (this as any) : document.body;
        const textarea = root.querySelector?.('.code-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
            textarea.scrollTop = 0;
            textarea.scrollLeft = 0;
        }
        this.updateHighlight();
    }

    onCodeChange(value: string) {
        switch (this.activeTab()) {
            case 'ts':
                this.tsCode.set(value);
                break;
            case 'html':
                this.htmlCode.set(value);
                break;
            case 'scss':
                this.scssCode.set(value);
                break;
        }
        this.updateHighlight();
    }

    onPresetSelect(presetId: string) {
        const preset = this.allPresets.find(p => p.id === presetId);
        if (!preset) return;

        this.selectedPresetId.set(presetId);
        this.tsCode.set(preset.ts);
        this.htmlCode.set(preset.html);
        this.scssCode.set(preset.scss);
        const root: HTMLElement = (this as any).nodeType === 1 ? (this as any) : document.body;
        const textarea = root.querySelector?.('.code-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
            textarea.scrollTop = 0;
            textarea.scrollLeft = 0;
        }
        this.updateHighlight();
        this.runCompile();
    }

    onSaveSnippet() {
        const defaultTitle = `Draft #${this.savedPresets().length + 1} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        const title = window.prompt('Enter a title for your saved playground draft:', defaultTitle);
        if (title === null) return; // User cancelled
        const cleanTitle = title.trim() || defaultTitle;

        const newId = `custom-${Date.now()}`;
        const newPreset: CodePreset = {
            id: newId,
            name: `💾 ${cleanTitle}`,
            description: 'Custom draft saved into local storage history.',
            ts: this.tsCode(),
            html: this.htmlCode(),
            scss: this.scssCode(),
            isCustom: true,
            createdAt: Date.now(),
        };

        const updated = [newPreset, ...this.savedPresets()];
        this.savedPresets.set(updated);
        savePlaygroundHistory(updated);

        this.selectedPresetId.set(newId);

        // Synchronize native select value
        const select = document.querySelector('#preset-select') as HTMLSelectElement | null;
        if (select) {
            select.value = newId;
        }

        this.notify.success('Draft Saved', `Draft "${cleanTitle}" saved to localStorage.`);
    }

    onDeleteSnippet() {
        const currentId = this.selectedPresetId();
        const custom = this.savedPresets().find(p => p.id === currentId);
        if (!custom) {
            this.notify.warn('Cannot Delete Built-in', 'Built-in framework presets cannot be removed.');
            return;
        }

        const updated = this.savedPresets().filter(p => p.id !== currentId);
        this.savedPresets.set(updated);
        savePlaygroundHistory(updated);

        this.notify.info('Draft Deleted', `Removed "${custom.name}" from local history.`);
        this.onPresetSelect(PLAYGROUND_PRESETS[0].id);

        const select = document.querySelector('#preset-select') as HTMLSelectElement | null;
        if (select) {
            select.value = PLAYGROUND_PRESETS[0].id;
        }
    }

    updateHighlight() {
        if (typeof document === 'undefined') return;
        const root: HTMLElement = (this as any).nodeType === 1 ? (this as any) : document.body;
        const codeEl = root.querySelector?.('#highlight-code') || document.querySelector('#highlight-code');
        if (!codeEl) return;

        let lang = 'typescript';
        let grammar = Prism.languages.typescript || Prism.languages.javascript || Prism.languages.clike;
        if (this.activeTab() === 'html') {
            lang = 'markup';
            grammar = Prism.languages.markup;
        } else if (this.activeTab() === 'scss') {
            lang = 'scss';
            grammar = Prism.languages.scss || Prism.languages.css;
        }

        const code = this.currentCode || '';
        const highlighted = grammar ? Prism.highlight(code, grammar, lang) : code;
        codeEl.innerHTML = highlighted + (code.endsWith('\n') ? ' ' : '');

        // Preserve and re-synchronize scroll position after updating innerHTML
        const textarea = root.querySelector?.('.code-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
            this.onScroll(textarea);
        }
    }

    onScroll(textarea: HTMLTextAreaElement) {
        const root: HTMLElement = (this as any).nodeType === 1 ? (this as any) : document.body;
        const pre = root.querySelector?.('.highlight-layer') || document.querySelector('.highlight-layer');
        if (pre) {
            pre.scrollTop = textarea.scrollTop;
            pre.scrollLeft = textarea.scrollLeft;
        }
        const lineNums = root.querySelector?.('.line-numbers') || document.querySelector('.line-numbers');
        if (lineNums) {
            lineNums.scrollTop = textarea.scrollTop;
        }
    }

    onKeyDown(event: KeyboardEvent, textarea: HTMLTextAreaElement) {
        // Handle Tab indentation
        if (event.key === 'Tab') {
            event.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const val = textarea.value;
            textarea.value = val.substring(0, start) + '  ' + val.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + 2;
            this.onCodeChange(textarea.value);
        }
    }

    scheduleCompile() {
        if (typeof window === 'undefined') return;
        window.clearTimeout(this.compileDebounceTimer);
        this.compileDebounceTimer = window.setTimeout(() => {
            this.runCompile();
        }, 250);
    }

    runCompile() {
        if (typeof document === 'undefined') return;
        this.previewContainer = document.querySelector('#playground-preview-canvas');
        if (!this.previewContainer) return;

        try {
            this.isError.set(false);
            this.errorMessage.set('');
            this.statusMessage.set('● Compiling...');

            // 1. Inject or update Scoped CSS
            let styleEl = document.querySelector('#playground-preview-styles') as HTMLStyleElement;
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'playground-preview-styles';
                document.head.appendChild(styleEl);
            }
            styleEl.textContent = this.scssCode();

            // 2. Transpile and evaluate TypeScript Code
            const rawTs = this.tsCode();
            const htmlContent = this.htmlCode();

            if (!rawTs.trim()) {
                this.previewContainer.replaceChildren();
                this.statusMessage.set('● Empty');
                return;
            }

            // Use Sucrase to strip TS types, generics, interfaces, etc.
            const transformed = transform(rawTs, {
                transforms: ['typescript'],
                disableESTransforms: true,
            });
            let cleanJs = transformed.code;

            // Strip all import statements (named, default, namespace, side-effects, type-only)
            cleanJs = cleanJs
                .replace(/import\s+(?:type\s+)?[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
                .replace(/import\s+['"][^'"]+['"];?/g, '')
                .replace(/import\s+type\s+[^;]+;?/g, '');

            const postStatements: string[] = [];

            // Transform @Pipe(...) class ClassName
            cleanJs = cleanJs.replace(
                /@Pipe\s*\(\s*([\s\S]*?)\s*\)\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/g,
                (_, args, cls) => {
                    postStatements.push(`__purity.Pipe(${args})(${cls});`);
                    return `class ${cls}`;
                },
            );

            // Transform @Directive(...) class ClassName
            cleanJs = cleanJs.replace(
                /@Directive\s*\(\s*([\s\S]*?)\s*\)\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/g,
                (_, args, cls) => {
                    postStatements.push(`__purity.Directive(${args})(${cls});`);
                    return `class ${cls}`;
                },
            );

            // Transform @Validator(...) class ClassName
            cleanJs = cleanJs.replace(
                /@Validator\s*\(\s*([\s\S]*?)\s*\)\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/g,
                (_, args, cls) => {
                    postStatements.push(`__purity.Validator(${args})(${cls});`);
                    return `class ${cls}`;
                },
            );

            // Transform @Injectable(...) or @Service(...) class ClassName
            cleanJs = cleanJs.replace(
                /@(?:Injectable|Service)\s*(?:\(\s*([\s\S]*?)\s*\))?\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/g,
                (_, args, cls) => {
                    if (args && args.trim()) {
                        postStatements.push(`__purity.Injectable(${args})(${cls});`);
                    } else {
                        postStatements.push(`__purity.Injectable()(${cls});`);
                    }
                    return `class ${cls}`;
                },
            );

            // Generate unique selector per compilation to prevent Custom Elements duplicate definition conflict
            const uniqueSelector = `playground-demo-${++this.compilationCount}`;

            // Find all @Component classes in user code
            const allComponentMatches = Array.from(
                cleanJs.matchAll(
                    /@Component(?:\s*\(\s*([\s\S]*?)\s*\))?\s*(?:export\s+(?:default\s+)?)?class\s+([A-Za-z0-9_$]+)/g,
                ),
            );

            let rootClassName = 'PlaygroundDemoComponent';
            if (allComponentMatches.length > 0) {
                const namedRoot = allComponentMatches.find((m) => m[2] === 'PlaygroundDemoComponent');
                const templateRoot = allComponentMatches.find(
                    (m) => m[1] && (m[1].includes('template.html') || m[1].includes('templateUrl') || m[1].includes('htmlTemplate')),
                );
                rootClassName = namedRoot ? namedRoot[2] : (templateRoot ? templateRoot[2] : allComponentMatches[0][2]);
            } else {
                const classMatches = Array.from(cleanJs.matchAll(/(?:export\s+(?:default\s+)?)?class\s+([A-Za-z0-9_$]+)/g));
                if (classMatches.length > 0) {
                    rootClassName = classMatches[0][1];
                }
            }

            // Transform all sub-components into __purity.Component(...) registrations
            cleanJs = cleanJs.replace(
                /@Component(?:\s*\(\s*([\s\S]*?)\s*\))?\s*(?:export\s+(?:default\s+)?)?class\s+([A-Za-z0-9_$]+)/g,
                (_, args, cls) => {
                    if (cls === rootClassName) {
                        return `class ${cls}`;
                    }
                    if (args && args.trim()) {
                        postStatements.push(`__purity.Component(${args.trim()})(${cls});`);
                    } else {
                        postStatements.push(`__purity.Component()(${cls});`);
                    }
                    return `class ${cls}`;
                },
            );

            // Transform @ViewChild / @ChildView inside classes
            const classTransform = transformAllClasses(cleanJs);
            cleanJs = classTransform.code;
            postStatements.push(...classTransform.postStatements);

            // Strip any remaining arbitrary decorators (e.g. @CustomDec, @Something(...))
            cleanJs = cleanJs.replace(/@[A-Za-z0-9_$]+(?:\([^)]*\))?\s*/g, '');

            // Remove any remaining export keywords
            cleanJs = cleanJs.replace(/export\s+(?:default\s+)?(?:const|let|var|function|class)\s+/g, (match) => {
                return match.replace(/export\s+(?:default\s+)?/, '');
            });
            cleanJs = cleanJs.replace(/export\s+default\s+([A-Za-z0-9_$]+);?/g, '');
            cleanJs = cleanJs.replace(/export\s*\{[^}]*\};?/g, '');

            // Scope object with framework primitives, data services, analytics, components, widgets & behaviors
            const purityScope = {
                ...purityCore,
                DataService,
                ThemeService,
                NotifyService,
                FirebaseService,
                initGoogleAnalytics,
                logAnalyticsEvent,
                drag,
                droppable,
                LoaderComponent,
                ModalViewComponent,
                NotificationComponent,
                DateTimePickerComponent,
                RadialContextMenuComponent,
                AnalogueClockComponent,
                HighlightDirective,
                UppercasePipe,
                DatePipe,
                MyTransformPipe,
                FormsValidationValidator,
            };

            // Dynamic destructuring to avoid collision with any class names declared in cleanJs
            const declaredClassNames = new Set(
                Array.from(cleanJs.matchAll(/class\s+([A-Za-z0-9_$]+)/g)).map(m => m[1])
            );
            const scopeKeys = Object.keys(purityScope).filter(k => !declaredClassNames.has(k));

            // Wrap in execution function with Purity exports
            const execCode = `
                const { ${scopeKeys.join(', ')} } = __purity;

                ${cleanJs}
                
                ${postStatements.join('\n')}

                // Attach template and register component with unique selector
                const compDecorator = Component({
                    selector: '${uniqueSelector}',
                    template: ${JSON.stringify(htmlContent)}
                });
                compDecorator(${rootClassName});

                return ${rootClassName};
            `;

            const execFn = new Function('__purity', execCode);
            execFn(purityScope);

            // 3. Create and mount Custom Element in preview container
            const customEl = document.createElement(uniqueSelector) as any;
            this.previewContainer.replaceChildren(customEl);
            this.statusMessage.set('● Live');
        } catch (err: any) {
            this.isError.set(true);
            const msg = err?.message || String(err);
            this.errorMessage.set(msg);
            this.statusMessage.set('● Error');
            console.warn('[Purity Playground] Compilation error:', msg);
        }
    }

    copyCode() {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(this.currentCode);
            this.statusMessage.set('✔ Copied!');
            setTimeout(() => this.statusMessage.set('● Live'), 2000);
        }
    }
}
