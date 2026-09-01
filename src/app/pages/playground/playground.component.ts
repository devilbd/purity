import { Component, signal, effect, inject, computed } from '@purity/core';
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
import { type CodePreset, PLAYGROUND_PRESETS } from './playground-presets';
import { runPlaygroundTests, type TestRunSummary } from './in-browser-test-runner';

export type { CodePreset };
export { PLAYGROUND_PRESETS };

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
import '@directives/highlight/highlight.directive';
import { HighlightDirective } from '@directives/highlight/highlight.directive';
import '@directives/dropdown/dropdown.directive';
import { DropdownDirective } from '@directives/dropdown/dropdown.directive';
import '@pipes/uppercase.pipe';
import { UppercasePipe } from '@pipes/uppercase.pipe';
import '@pipes/date.pipe';
import { DatePipe } from '@pipes/date.pipe';
import '@pipes/transform-sample.pipe';
import { MyTransformPipe } from '@pipes/transform-sample.pipe';
import '@validators/forms-validation.validator';
import { FormsValidationValidator } from '@validators/forms-validation.validator';
import '@pages/empty-sample/empty-sample.component';
import { EmptySampleComponent } from '@pages/empty-sample/empty-sample.component';

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

export interface CompiledUserComponent {
    rootClassName: string;
    uniqueSelector: string;
    rootClass: any;
    exports: Record<string, any>;
}

export function compileUserComponent(
    rawTs: string,
    htmlContent: string,
    compilationCount: number,
    baseScope: Record<string, any>,
): CompiledUserComponent {
    if (!rawTs.trim()) {
        throw new Error('app.component.ts is empty. Please provide component code.');
    }

    // 1. Transpile TS
    const transformed = transform(rawTs, {
        transforms: ['typescript'],
        disableESTransforms: true,
    });
    let cleanJs = transformed.code;

    // Strip imports
    cleanJs = cleanJs
        .replace(/import\s+(?:type\s+)?[\s\S]*?from\s*['"][^'"]+['"];?/g, '')
        .replace(/import\s+['"][^'"]+['"];?/g, '')
        .replace(/import\s+type\s+[^;]+;?/g, '');

    const postStatements: string[] = [];

    // Transform @Pipe
    cleanJs = cleanJs.replace(
        /@Pipe\s*\(\s*([\s\S]*?)\s*\)\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/g,
        (_, args, cls) => {
            postStatements.push(`__purity.Pipe(${args})(${cls});`);
            return `class ${cls}`;
        },
    );

    // Transform @Directive
    cleanJs = cleanJs.replace(
        /@Directive\s*\(\s*([\s\S]*?)\s*\)\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/g,
        (_, args, cls) => {
            postStatements.push(`__purity.Directive(${args})(${cls});`);
            return `class ${cls}`;
        },
    );

    // Transform @Validator
    cleanJs = cleanJs.replace(
        /@Validator\s*\(\s*([\s\S]*?)\s*\)\s*(?:export\s+)?class\s+([A-Za-z0-9_$]+)/g,
        (_, args, cls) => {
            postStatements.push(`__purity.Validator(${args})(${cls});`);
            return `class ${cls}`;
        },
    );

    // Transform @Injectable
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

    const uniqueSelector = `playground-demo-${compilationCount}`;

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

    // Transform sub-components
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

    const classTransform = transformAllClasses(cleanJs);
    cleanJs = classTransform.code;
    postStatements.push(...classTransform.postStatements);

    cleanJs = cleanJs.replace(/@[A-Za-z0-9_$]+(?:\([^)]*\))?\s*/g, '');

    cleanJs = cleanJs.replace(/export\s+(?:default\s+)?(?:const|let|var|function|class)\s+/g, (match) => {
        return match.replace(/export\s+(?:default\s+)?/, '');
    });
    cleanJs = cleanJs.replace(/export\s+default\s+([A-Za-z0-9_$]+);?/g, '');
    cleanJs = cleanJs.replace(/export\s*\{[^}]*\};?/g, '');

    const declaredNames = Array.from(
        cleanJs.matchAll(/(?:class|function|const|let|var)\s+([A-Za-z0-9_$]+)/g)
    ).map(m => m[1]);

    const scopeKeys = Object.keys(baseScope).filter(k => !declaredNames.includes(k));

    const exportAssignments = Array.from(new Set(declaredNames))
        .map(name => `try { if (typeof ${name} !== 'undefined') __exports['${name}'] = ${name}; } catch(e) {}`)
        .join('\n');

    const execCode = `
        const { ${scopeKeys.join(', ')} } = __purity;
        const __exports = {};

        ${cleanJs}
        
        ${postStatements.join('\n')}

        const compDecorator = Component({
            selector: '${uniqueSelector}',
            template: ${JSON.stringify(htmlContent)}
        });
        if (typeof ${rootClassName} !== 'undefined') {
            compDecorator(${rootClassName});
            __exports['${rootClassName}'] = ${rootClassName};
        }

        ${exportAssignments}

        return {
            rootClassName: '${rootClassName}',
            rootClass: typeof ${rootClassName} !== 'undefined' ? ${rootClassName} : null,
            uniqueSelector: '${uniqueSelector}',
            exports: __exports
        };
    `;

    const execFn = new Function('__purity', execCode);
    return execFn(baseScope);
}

@Component({
    selector: 'playground-view',
    templateUrl: './src/app/pages/playground/playground.component.html',
})
export class PlaygroundComponent {
    private notify = inject(NotifyService);

    activeTab = signal<'ts' | 'html' | 'scss' | 'spec'>('ts');
    activePreviewTab = signal<'preview' | 'tests'>('preview');
    selectedPresetId = signal<string>(PLAYGROUND_PRESETS[0].id);
    statusMessage = signal<string>('● Ready');
    isError = signal<boolean>(false);
    errorMessage = signal<string>('');

    savedPresets = signal<CodePreset[]>(loadPlaygroundHistory());

    tsCode = signal<string>(PLAYGROUND_PRESETS[0].ts);
    htmlCode = signal<string>(PLAYGROUND_PRESETS[0].html);
    scssCode = signal<string>(PLAYGROUND_PRESETS[0].scss);
    specCode = signal<string>(PLAYGROUND_PRESETS[0].spec || '');

    testResults = signal<TestRunSummary | null>(null);
    isTesting = signal<boolean>(false);

    hasSpec = computed(() => Boolean(this.specCode().trim()));

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
            case 'spec':
                return this.specCode();
        }
    }

    get lineNumbers(): number[] {
        const lines = this.currentCode.split('\n').length;
        return Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1);
    }

    get allPresets(): CodePreset[] {
        return [...PLAYGROUND_PRESETS, ...this.savedPresets()];
    }

    get selectedPresetName(): string {
        const found = this.allPresets.find(p => p.id === this.selectedPresetId());
        return found ? found.name : 'Choose Preset...';
    }

    get isCustomSelected(): boolean {
        return this.savedPresets().some(p => p.id === this.selectedPresetId());
    }

    private get hostElement(): HTMLElement {
        if ((this as any)?.__host instanceof HTMLElement) {
            return (this as any).__host;
        }
        if (typeof document !== 'undefined') {
            const found = document.querySelector('playground-view');
            if (found instanceof HTMLElement) return found;
        }
        return typeof document !== 'undefined' ? document.body : ({} as HTMLElement);
    }

    protected onInit() {
        // Auto compile & update syntax highlighting whenever code changes
        effect(() => {
            this.activeTab();
            this.tsCode();
            this.htmlCode();
            this.scssCode();
            this.specCode();

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
                const root = this.hostElement;
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

    loadSnippet(snippet: { id?: string; title?: string; ts?: string; html?: string; scss?: string; spec?: string }) {
        if (snippet.ts !== undefined) this.tsCode.set(snippet.ts);
        if (snippet.html !== undefined) this.htmlCode.set(snippet.html);
        if (snippet.scss !== undefined) this.scssCode.set(snippet.scss);
        if (snippet.spec !== undefined) this.specCode.set(snippet.spec);
        if (snippet.id) this.selectedPresetId.set(snippet.id);
        this.updateHighlight();
        this.runCompile();
    }

    setTab(tab: 'ts' | 'html' | 'scss' | 'spec') {
        this.activeTab.set(tab);
        const root = this.hostElement;
        const textarea = root.querySelector?.('.code-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
            textarea.scrollTop = 0;
            textarea.scrollLeft = 0;
        }
        this.updateHighlight();
    }

    setPreviewTab(tab: 'preview' | 'tests') {
        this.activePreviewTab.set(tab);
        if (tab === 'tests' && !this.testResults()) {
            this.runTests();
        }
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
            case 'spec':
                this.specCode.set(value);
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
        this.specCode.set(preset.spec || '');
        this.testResults.set(null);

        const root = this.hostElement;
        const textarea = root.querySelector?.('.code-textarea') as HTMLTextAreaElement | null;
        if (textarea) {
            textarea.scrollTop = 0;
            textarea.scrollLeft = 0;
        }
        this.updateHighlight();
        this.runCompile();
    }

    private normalizePresetName(name: string): string {
        return name
            .replace(/^💾\s*/, '')
            .replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, '')
            .trim()
            .toLowerCase();
    }

    onSaveSnippet() {
        const currentCustom = this.savedPresets().find(p => p.id === this.selectedPresetId());
        const defaultTitle = currentCustom
            ? currentCustom.name.replace(/^💾\s*/, '').trim()
            : `Draft #${this.savedPresets().length + 1} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

        const title = window.prompt('Enter a title for your saved playground preset:', defaultTitle);
        if (title === null) return; // User cancelled
        const cleanTitle = title.trim() || defaultTitle;
        const normalizedInput = this.normalizePresetName(cleanTitle);

        // 1. Default presets cannot be overridden
        const matchesDefault = PLAYGROUND_PRESETS.some(p => {
            return (
                p.name.trim().toLowerCase() === cleanTitle.toLowerCase() ||
                this.normalizePresetName(p.name) === normalizedInput ||
                p.id.toLowerCase() === cleanTitle.toLowerCase()
            );
        });

        if (matchesDefault) {
            this.notify.warn(
                'Cannot Override Built-in',
                `"${cleanTitle}" is a default framework preset and cannot be overridden. Please choose a different name.`
            );
            return;
        }

        // 2. Check if a custom preset with this name already exists -> Override it
        const existingIndex = this.savedPresets().findIndex(p => {
            return (
                p.name.trim().toLowerCase() === cleanTitle.toLowerCase() ||
                p.name.trim().toLowerCase() === `💾 ${cleanTitle}`.toLowerCase() ||
                this.normalizePresetName(p.name) === normalizedInput
            );
        });

        const displayName = cleanTitle.startsWith('💾') ? cleanTitle : `💾 ${cleanTitle}`;

        if (existingIndex !== -1) {
            const existingPreset = this.savedPresets()[existingIndex];
            const updatedPreset: CodePreset = {
                ...existingPreset,
                name: displayName,
                description: 'Custom draft saved into local storage history.',
                ts: this.tsCode(),
                html: this.htmlCode(),
                scss: this.scssCode(),
                spec: this.specCode(),
                isCustom: true,
                createdAt: Date.now(),
            };

            const updated = [...this.savedPresets()];
            updated[existingIndex] = updatedPreset;
            this.savedPresets.set(updated);
            savePlaygroundHistory(updated);

            this.selectedPresetId.set(existingPreset.id);
            this.notify.success('Preset Overridden', `Preset "${cleanTitle}" was overridden with current changes.`);
        } else {
            const newId = `custom-${Date.now()}`;
            const newPreset: CodePreset = {
                id: newId,
                name: displayName,
                description: 'Custom draft saved into local storage history.',
                ts: this.tsCode(),
                html: this.htmlCode(),
                scss: this.scssCode(),
                spec: this.specCode(),
                isCustom: true,
                createdAt: Date.now(),
            };

            const updated = [newPreset, ...this.savedPresets()];
            this.savedPresets.set(updated);
            savePlaygroundHistory(updated);

            this.selectedPresetId.set(newId);
            this.notify.success('Preset Saved', `Preset "${cleanTitle}" saved to localStorage.`);
        }
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
    }

    updateHighlight() {
        if (typeof document === 'undefined') return;
        const root = this.hostElement;
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
        } else if (this.activeTab() === 'spec') {
            lang = 'typescript';
            grammar = Prism.languages.typescript || Prism.languages.javascript || Prism.languages.clike;
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
        const root = this.hostElement;
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

    private getSandboxScope() {
        return {
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
            DropdownDirective,
            UppercasePipe,
            DatePipe,
            MyTransformPipe,
            FormsValidationValidator,
            EmptySampleComponent,
        };
    }

    async runTests() {
        const spec = this.specCode().trim();
        if (!spec) {
            this.notify.info('No Tests', 'This preset does not have test cases defined yet.');
            return;
        }

        this.isTesting.set(true);
        this.statusMessage.set('● Running tests...');

        try {
            // First compile the user's component code to extract live component classes and exports
            let compiledResult: CompiledUserComponent | null = null;
            let compileError: any = null;

            try {
                compiledResult = compileUserComponent(
                    this.tsCode(),
                    this.htmlCode(),
                    ++this.compilationCount,
                    this.getSandboxScope(),
                );
            } catch (err: any) {
                compileError = err;
            }

            if (compileError || !compiledResult) {
                const errMsg = compileError?.message || 'app.component.ts failed to compile.';
                const failedSummary: TestRunSummary = {
                    suites: [
                        {
                            name: 'app.component.ts Compilation',
                            tests: [
                                {
                                    name: 'Evaluate User Component Code',
                                    status: 'failed',
                                    durationMs: 0,
                                    error: {
                                        message: errMsg,
                                        stack: compileError?.stack,
                                    },
                                },
                            ],
                            passedCount: 0,
                            failedCount: 1,
                            durationMs: 0,
                        },
                    ],
                    totalTests: 1,
                    passedCount: 0,
                    failedCount: 1,
                    totalDurationMs: 0,
                    status: 'failed',
                    timestamp: Date.now(),
                };

                this.testResults.set(failedSummary);
                this.statusMessage.set('✖ Tests Failed (Code Error)');
                return;
            }

            // Merge sandbox scope with the live compiled user classes and exports
            const testScope = {
                ...this.getSandboxScope(),
                ...compiledResult.exports,
            };

            const summary = await runPlaygroundTests(spec, testScope);
            this.testResults.set(summary);

            if (summary.status === 'passed') {
                this.statusMessage.set(`✔ ${summary.passedCount}/${summary.totalTests} Tests Passed`);
            } else {
                this.statusMessage.set(`✖ ${summary.failedCount}/${summary.totalTests} Tests Failed`);
            }
        } catch (err: any) {
            console.error('[Playground Tests Error]:', err);
            this.statusMessage.set('✖ Tests Errored');
        } finally {
            this.isTesting.set(false);
        }
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
            if (!rawTs.trim()) {
                this.previewContainer.replaceChildren();
                this.statusMessage.set('● Empty');
                return;
            }

            const compiled = compileUserComponent(
                rawTs,
                this.htmlCode(),
                ++this.compilationCount,
                this.getSandboxScope(),
            );

            // 3. Create and mount Custom Element in preview container
            const customEl = document.createElement(compiled.uniqueSelector) as any;
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
