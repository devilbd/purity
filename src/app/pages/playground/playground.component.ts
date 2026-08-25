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
import Prism from './prism-loader';

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
        name: '⚡ Reactive Signals & Counter',
        description: 'Fine-grained signals, computed effect, and event handlers.',
        ts: `import { Component, signal, effect } from '@purity/core';

@Component({
    selector: 'playground-demo',
    templateUrl: './template.html',
})
export class PlaygroundDemoComponent {
    count = signal(0);
    multiplier = signal(2);

    get doubled(): number {
        return this.count() * this.multiplier();
    }

    onIncrement() {
        this.count.update(n => n + 1);
    }

    onDecrement() {
        this.count.update(n => Math.max(0, n - 1));
    }

    onReset() {
        this.count.set(0);
    }
}`,
        html: `<div class="counter-card window">
    <h3>⚡ Reactive Signals Counter</h3>
    <div class="stat-display">
        <span class="stat-num">{{count()}}</span>
        <span class="stat-calc">Doubled: {{doubled}} (x{{multiplier()}})</span>
    </div>
    <div class="button-row">
        <button type="button" class="button-primary" onclick="onIncrement()">➕ Increment</button>
        <button type="button" class="button-secondary" onclick="onDecrement()">➖ Decrement</button>
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

    .stat-display {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .stat-num {
            font-size: 2.8rem;
            font-weight: 800;
            color: #c3e88d;
            font-family: monospace;
        }

        .stat-calc {
            font-size: 0.95rem;
            color: #676e95;
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
        this.updateHighlight();
        this.runCompile();
    }

    onSaveSnippet() {
        const defaultTitle = `Snippet #${this.savedPresets().length + 1} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        const title = window.prompt('Enter a title for your saved playground snippet:', defaultTitle);
        if (title === null) return; // User cancelled
        const cleanTitle = title.trim() || defaultTitle;

        const newId = `custom-${Date.now()}`;
        const newPreset: CodePreset = {
            id: newId,
            name: `💾 ${cleanTitle}`,
            description: 'Custom snippet saved into local storage history.',
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

        this.notify.success('Saved to History', `Snippet "${cleanTitle}" saved to localStorage.`);
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

        this.notify.info('Snippet Deleted', `Removed "${custom.name}" from local history.`);
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
    }

    onScroll(textarea: HTMLTextAreaElement) {
        const pre = document.querySelector('.highlight-layer') as HTMLElement;
        if (pre) {
            pre.scrollTop = textarea.scrollTop;
            pre.scrollLeft = textarea.scrollLeft;
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
