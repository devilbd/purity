import { Component, signal, effect } from '@purity/core';
import './playground.component.scss';
import * as purityCore from '@purity/core';
import { transform } from 'sucrase';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markup';

export interface CodePreset {
    id: string;
    name: string;
    description: string;
    ts: string;
    html: string;
    scss: string;
}

export const PLAYGROUND_PRESETS: CodePreset[] = [
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
        <button type="button" class="button-primary" onclick="pgDemo.onIncrement()">➕ Increment</button>
        <button type="button" class="button-secondary" onclick="pgDemo.onDecrement()">➖ Decrement</button>
        <button type="button" class="button-cancel" onclick="pgDemo.onReset()">↺ Reset</button>
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
        oninput="pgDemo.onTextInput(this)"
        placeholder="Type text..."
    />
    <button type="button" class="button-secondary" onclick="pgDemo.toggleCase()">
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
            oninput="pgDemo.onTitleInput(this)"
        />
        <button type="button" class="button-primary" onclick="pgDemo.addTask()">➕ Add</button>
    </div>
    <div class="tasks-list">
        <div for="let t, i of tasks" class="task-item">
            <span class="task-num">#{{i + 1}}</span>
            <span class="task-title {{t.done ? 'task-done' : ''}}" onclick="pgDemo.toggleTask({{t.id}})">
                {{t.title}}
            </span>
            <span class="task-tag">{{t.tag}}</span>
            <button type="button" class="button-cancel delete-btn" onclick="pgDemo.removeTask({{t.id}})">✕</button>
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

@Component({
    selector: 'playground-view',
    templateUrl: './src/app/pages/playground/playground.component.html',
})
export class PlaygroundComponent {
    activeTab = signal<'ts' | 'html' | 'scss'>('ts');
    selectedPresetId = signal<string>('counter');
    statusMessage = signal<string>('● Ready');
    isError = signal<boolean>(false);
    errorMessage = signal<string>('');

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

    get presets() {
        return PLAYGROUND_PRESETS;
    }

    protected onInit() {
        (window as any).playground = this;

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
        const preset = PLAYGROUND_PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        this.selectedPresetId.set(presetId);
        this.tsCode.set(preset.ts);
        this.htmlCode.set(preset.html);
        this.scssCode.set(preset.scss);
        this.updateHighlight();
        this.runCompile();
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
        }, 150);
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

            // Use Sucrase to strip TS types, generics, interfaces, etc.
            const transformed = transform(rawTs, {
                transforms: ['typescript'],
                disableESTransforms: true,
            });
            let cleanJs = transformed.code;

            // Strip import statements
            cleanJs = cleanJs.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');

            // Handle @Pipe decorator if any
            const pipeStatements: string[] = [];
            cleanJs = cleanJs.replace(
                /@Pipe\s*\(\s*['"]([^'"]+)['"]\s*\)\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/g,
                (_, pipeName, pipeClass) => {
                    pipeStatements.push(`__purity.Pipe('${pipeName}')(${pipeClass});`);
                    return `class ${pipeClass}`;
                },
            );

            // Generate unique selector per compilation to prevent Custom Elements duplicate definition conflict
            const uniqueSelector = `playground-demo-${++this.compilationCount}`;
            let className = 'PlaygroundDemoComponent';

            const compMatch = cleanJs.match(/@Component\s*\(\s*\{([\s\S]*?)\}\s*\)\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/);
            if (compMatch) {
                className = compMatch[2];
                cleanJs = cleanJs.replace(compMatch[0], `class ${className}`);
            } else {
                const classMatch = cleanJs.match(/(?:export\s+)?class\s+([A-Za-z0-9_$]+)/);
                if (classMatch) {
                    className = classMatch[1];
                }
            }

            // Remove any remaining export keywords
            cleanJs = cleanJs.replace(/\bexport\s+/g, '');

            // Wrap in execution function with Purity exports
            const execCode = `
                const { Component, signal, effect, inject, Pipe, BasePipe, Directive, BaseDirective, Validator, BaseValidator } = __purity;
                ${cleanJs}
                
                ${pipeStatements.join('\n')}

                // Attach template and register component with unique selector
                const compDecorator = Component({
                    selector: '${uniqueSelector}',
                    template: ${JSON.stringify(htmlContent)}
                });
                compDecorator(${className});

                return ${className};
            `;

            const execFn = new Function('__purity', execCode);
            execFn(purityCore);

            // 3. Create and mount Custom Element in preview container
            const customEl = document.createElement(uniqueSelector) as any;
            (window as any).pgDemo = customEl;
            this.previewContainer.replaceChildren(customEl);
            this.statusMessage.set('● Live');
        } catch (err: any) {
            this.isError.set(true);
            this.errorMessage.set(err?.message || String(err));
            this.statusMessage.set('● Error');
            console.error('[Purity Playground] Compilation error:', err);
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
