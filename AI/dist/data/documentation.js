export const DOCUMENTATION = {
    overview: {
        topic: 'overview',
        title: 'Purity Framework Overview',
        summary: 'Lightweight native TypeScript frontend framework built on Custom Elements v1 and fine-grained synchronous signals.',
        content: `# Purity Framework

Purity is a zero-dependency, native TypeScript framework designed for sub-microsecond reactive performance, clean modular architecture, and modern Web standards.

## Key Pillars
1. **Synchronous Fine-Grained Signals**: Built-in \`signal()\`, \`computed()\`, \`effect()\`, and \`untrack()\` with automatic dependency tracking.
2. **Native Custom Elements v1**: Decorated with \`@Component\`, compiling external templates synchronously at build time via Vite (\`?raw\`).
3. **Structural Directives**: \`for="let item of items"\`, \`virtual-for="let item, index of items; itemHeight: 48; buffer: 8; height: 420px; scrollIndex: jumpSignal"\`, \`if="expr"\`, \`else-if="expr"\`, \`else\`.
4. **Dependency Injection**: First-class container with \`@Injectable('ServiceName')\` and \`inject(Token)\`.
5. **KDE Plasma Breeze Vector Cursors**: 91 vector cursors with ref-counted animated progress state during network requests.
6. **Adwaita Glassmorphism**: Translucent surfaces, refined corner radii hierarchy, and modular SCSS (\`@use '@styles' as *;\`).`,
        examples: [
            `import { bootstrapApplication } from '@purity/core';
import { AppComponent } from './app/app.component';

bootstrapApplication({
  rootComponent: AppComponent,
  providers: []
});`
        ]
    },
    signals: {
        topic: 'signals',
        title: 'Fine-Grained Reactive Signals',
        summary: 'Synchronous signal primitives with getter read syntax and atomic updates.',
        content: `# Reactive Signals in Purity

Signals are the reactive core of Purity. They execute synchronously without Virtual DOM diffing, triggering atomic mutations directly on targeted DOM Text nodes or element attributes.

## Core Functions
- \`signal<T>(initialValue: T): Signal<T>\`: Mutable state container. Read via \`mySignal()\`, mutate via \`mySignal.set(val)\` or \`mySignal.update(prev => next)\`.
- \`computed<T>(fn: () => T): ReadonlySignal<T>\`: Derived memoized signal. Recalculates only when dependencies change.
- \`effect(fn: () => void): void\`: Side-effect runner. Captures all accessed signals and re-executes synchronously on change.
- \`untrack<T>(fn: () => T): T\`: Runs code without subscribing the current effect to any signal reads inside it.

## Critical Rules
- NEVER assign directly: \`count = 5\` or \`count.value = 5\` (wrong!). Use \`count.set(5)\`.
- ALWAYS invoke the getter in templates and functions: \`count()\` (or \`{{ count() }}\`).
- NEVER import RxJS, Redux, or external state libraries.`,
        examples: [
            `import { signal, computed, effect, untrack } from '@purity/core';

const count = signal(0);
const doubled = computed(() => count() * 2);

effect(() => {
  console.log('Count changed:', count());
  untrack(() => {
    // Reads here do not become dependencies
  });
});

count.set(5); // Logs: Count changed: 5
count.update(n => n + 1); // Logs: Count changed: 6`
        ]
    },
    components: {
        topic: 'components',
        title: 'Native Custom Elements (@Component)',
        summary: 'Transform plain classes into custom elements with template inlining and lifecycle management.',
        content: `# Purity Components

Components in Purity are standard TypeScript classes decorated with \`@Component\`.

## Decorator Options
- \`selector?: string\`: Custom element tag (kebab-case, e.g. \`user-card\`). If omitted, inferred from class name.
- \`templateUrl?: string\`: Path to HTML template. Inlined at build time by Vite (\`?raw\`).
- \`template?: string\`: Inline template string.

## Lifecycle Hooks
- \`protected onInit(): void\`: Invoked after DOM mounting and template bindings are initialized.
- \`protected onDestroy(): void\`: Invoked when element is removed from DOM.
- \`disconnectedCallback(): void\`: Native custom element cleanup.

## Queries
- \`@ViewChild(selector?: string)\`: Injects reference to child custom element or DOM element. Inferred from property name if selector is omitted.`,
        examples: [
            `import { Component, signal, ViewChild } from '@purity/core';
import { SwitchButtonComponent } from '@components/switch-button/switch-button.component';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {
  @ViewChild()
  switchButton?: SwitchButtonComponent;

  username = signal('Ada');

  protected onInit() {
    console.log('Mounted:', this.username());
  }

  protected onDestroy() {
    console.log('Destroyed');
  }
}`
        ]
    },
    templates: {
        topic: 'templates',
        title: 'Template Bindings and Expressions',
        summary: 'Handlebars interpolations, dynamic attributes, and event handlers.',
        content: `# Template Bindings

Purity compiles templates into fine-grained reactive bindings.

## Syntax
- Interpolation: \`{{ expression }}\`
- Pipes: \`{{ value | pipeName: arg1 : arg2 }}\`
- Attribute Bindings: \`checked="{{ isActive() }}"\` or \`title="{{ user.name }}"\`
- Event Listeners: \`onclick="handleClick()"\`, \`oninput="handleInput($event)"\` (methods evaluate on component instance)
- Dynamic code blocks: Standalone \`<code>\` and \`<pre>\` evaluate bindings unless marked with \`[data-no-bind]\`.`,
        examples: [
            `<div class="card">
  <h3>{{ title() }}</h3>
  <p>{{ balance() | currency: 'USD' }}</p>
  <button class="button-primary" onclick="deposit(100)">Add Funds</button>
</div>`
        ]
    },
    repeaters: {
        topic: 'repeaters',
        title: 'Structural Repeater (for="let item of items")',
        summary: 'Fine-grained array iteration with seamless custom element interoperability.',
        content: `# Structural Repeater

The \`for\` directive allows iterating over arrays and array signals.

## Syntax
- \`for="let item of items"\`
- \`for="let item, index of items"\` (index starts at 0)

## Custom Component Interoperability
- Structural repeaters fully interoperate with nested custom Web Components (\`<switch-button>\`, \`<expander>\`, etc.).
- Context proxy chaining (\`createComponentContext\`) allows access to row variables (\`item\`, \`index\`, \`$first\`, \`$last\`) inside custom element templates and slots.
- Safe signal attribute synchronization ensures child signals are updated via \`.set()\` rather than overwritten.
- Untracked attribute side-effects prevent circular re-render loops.`,
        examples: [
            `<!-- Standard array repeater -->
<div for="let user, index of users" class="user-row">
  <span>#{{ index + 1 }} {{ user.name }}</span>
  <switch-button checked="{{ user.isActive }}"></switch-button>
</div>

<!-- Direct repeater on custom element -->
<expander for="let faq of faqList" title="{{ faq.question }}">
  <p>{{ faq.answer }}</p>
</expander>`
        ]
    },
    'virtual-for': {
        topic: 'virtual-for',
        title: 'Virtualized Repeater (virtual-for)',
        summary: 'High-performance virtual scrolling for 1,000 to 100,000+ items.',
        content: `# High-Performance Virtual Scrolling

Purity includes a GPU-accelerated virtual scrolling engine for massive datasets.

## Syntax
\`virtual-for="let item, index of items; itemHeight: 48; buffer: 8; height: 420px; scrollIndex: jumpSignal"\`

## Attributes & Parameters
- \`itemHeight\`: Height of each item in pixels (numeric).
- \`buffer\`: Overscan items above and below the viewport (default: 5).
- \`height\`: Viewport container height (e.g. \`420px\`, \`100%\`).
- \`scrollIndex\`: Optional reactive signal. Setting this signal jumps the viewport to the target index smoothly.`,
        examples: [
            `<div class="virtual-list-container">
  <div
    virtual-for="let txn, index of transactions; itemHeight: 52; buffer: 6; height: 440px; scrollIndex: jumpTarget"
    class="txn-row"
  >
    <span>#{{ index + 1 }} - {{ txn.title }}</span>
    <strong>{{ txn.amount | currency }}</strong>
  </div>
</div>`
        ]
    },
    conditionals: {
        topic: 'conditionals',
        title: 'Structural Conditionals (if, else-if, else)',
        summary: 'Declarative multi-branch conditional rendering with deferred compilation.',
        content: `# Structural Conditionals

Purity provides lazy, multi-branch conditional rendering:
- \`if="expr"\`
- \`else-if="expr"\`
- \`else\`

## Deferred Compilation Guard
Falsy branches are completely excluded from the live DOM and will **not build, compile, or execute bindings or child component lifecycles** until their condition evaluates to truthy.`,
        examples: [
            `<div if="role() === 'admin'" class="admin-panel">
  <admin-dashboard></admin-dashboard>
</div>
<div else-if="role() === 'editor'" class="editor-panel">
  <editor-tools></editor-tools>
</div>
<div else class="guest-panel">
  <p>Please log in to continue.</p>
</div>`
        ]
    },
    slots: {
        topic: 'slots',
        title: 'Content Projection (<slot>)',
        summary: 'Declarative content projection with default and named slots.',
        content: `# Content Projection with Slots

Purity components support native \`<slot>\` projection.

## Rules
- Default slot: \`<slot></slot>\` or \`<slot>Default fallback</slot>\`
- Named slots: \`<slot name="header"></slot>\`, \`<slot name="footer"></slot>\`
- Slotted content retains reactive bindings to its parent context.`,
        examples: [
            `<!-- Component template -->
<div class="card">
  <header><slot name="header"></slot></header>
  <main><slot>Default body</slot></main>
</div>

<!-- Usage -->
<user-card>
  <h2 slot="header">Ada Lovelace</h2>
  <p>Computer Programmer</p>
</user-card>`
        ]
    },
    di: {
        topic: 'di',
        title: 'Dependency Injection (@Injectable & inject)',
        summary: 'Container-managed singleton services and token resolution.',
        content: `# Dependency Injection

Purity includes a built-in DI container.

## Decorators & Resolution
- \`@Injectable('ServiceName')\` or \`@Service('ServiceName')\`
- Resolve with \`inject(ServiceName)\` or \`inject<Type>('TokenName')\`
- Services can hold reactive state (\`signal\`) and methods.`,
        examples: [
            `import { Injectable, signal, inject } from '@purity/core';

@Injectable('UserService')
export class UserService {
  currentUser = signal({ name: 'Ada', role: 'admin' });

  updateName(name: string) {
    this.currentUser.update(u => ({ ...u, name }));
  }
}

// In component:
export class ProfileComponent {
  userService = inject(UserService);
}`
        ]
    },
    http: {
        topic: 'http',
        title: 'HTTP Client & Interceptor Pipeline',
        summary: 'Full-featured HTTP client driving the KDE Breeze progress cursor engine.',
        content: `# HTTP Client

The \`HttpClient\` service provides standard methods (\`get\`, \`post\`, \`put\`, \`patch\`, \`delete\`, \`head\`, \`options\`) and reactive resource helper \`createResource\`.

## Breeze Progress Cursor
Pending requests automatically increment a reference counter driving the 23-frame animated KDE Plasma Breeze progress cursor engine on \`<body>\`.

## Centralized Interceptors
Interceptors implement \`HttpInterceptor\` and reside in \`src/app/shared/interceptors/\` (aliased as \`@interceptors/*\`). Wired during bootstrap:
\`bootstrapApplication({ interceptors: [AuthInterceptor, LoggingInterceptor] })\`.`,
        examples: [
            `import { HttpClient, inject } from '@purity/core';

export class PostService {
  private http = inject(HttpClient);

  getPosts() {
    return this.http.get<Post[]>('https://api.example.com/posts');
  }
}`
        ]
    },
    interceptors: {
        topic: 'interceptors',
        title: 'Centralized HTTP Interceptors',
        summary: 'Class-based request/response transformation pipeline.',
        content: `# HTTP Interceptors

Interceptors handle cross-cutting network concerns (auth tokens, latency logging, error handling).

## Rules
- Implement \`HttpInterceptor\` interface.
- Provide method: \`intercept(req: HttpRequest, next: HttpHandler): Promise<HttpResponse>\`.
- Must be located in \`@interceptors/*\`.`,
        examples: [
            `import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@purity/core';

export class AuthInterceptor implements HttpInterceptor {
  async intercept(req: HttpRequest, next: HttpHandler): Promise<HttpResponse> {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer token_xyz')
    });
    return next.handle(authReq);
  }
}`
        ]
    },
    pipes: {
        topic: 'pipes',
        title: 'Transform Pipes (@Pipe & BasePipe)',
        summary: 'Reusable template data formatting engine.',
        content: `# Transform Pipes

Pipes format values inside Handlebars interpolations: \`{{ value | pipeName: arg1 : arg2 }}\`.

## Rules
- Extend \`BasePipe\`.
- Decorate with \`@Pipe('pipeName')\`.
- Implement \`transform(value: any, ...args: any[]): any\`.
- Supports dynamic reactive signal arguments.`,
        examples: [
            `import { Pipe, BasePipe } from '@purity/core';

@Pipe('truncate')
export class TruncatePipe extends BasePipe {
  transform(value: string, limit = 20, ellipsis = '...'): string {
    if (!value || value.length <= limit) return value;
    return value.substring(0, limit) + ellipsis;
  }
}`
        ]
    },
    directives: {
        topic: 'directives',
        title: 'Custom Directives (@Directive & BaseDirective)',
        summary: 'Attribute-level reactivity and DOM augmentation.',
        content: `# Custom Directives

Directives augment DOM elements with custom behavior.

## Rules
- Extend \`BaseDirective\`.
- Decorate with \`@Directive('[directiveName]')\`.
- Implement lifecycles: \`onInit()\`, \`onChanges(newValue, oldValue)\`, \`onDestroy()\`.`,
        examples: [
            `import { Directive, BaseDirective } from '@purity/core';

@Directive('[tooltip]')
export class TooltipDirective extends BaseDirective {
  protected onInit() {
    this.el.title = this.value || '';
  }

  protected onChanges(newVal: string) {
    this.el.title = newVal || '';
  }
}`
        ]
    },
    validators: {
        topic: 'validators',
        title: 'Decoupled Form Validation (@Validator)',
        summary: 'Decoupled form/field validation engine with automatic CSS state management.',
        content: `# Form & Field Validation

Validators decouple validation logic from component classes.

## Features
- Extend \`BaseValidator\`.
- Decorate with \`@Validator({ form: 'selector', fields: { ... } })\`.
- Automatically toggles CSS classes (\`.is-valid\`, \`.is-invalid\`, \`.is-touched\`, \`.is-dirty\`).
- Automatically toggles submit button \`disabled\` state.`,
        examples: [
            `import { Validator, BaseValidator } from '@purity/core';

@Validator({
  form: '#loginForm',
  fields: {
    email: ['required', 'email'],
    password: ['required', 'minLength:8']
  }
})
export class LoginValidator extends BaseValidator {}`
        ]
    },
    behaviors: {
        topic: 'behaviors',
        title: 'Composable Behaviors (@behaviors/*)',
        summary: 'Modular pointer interactions (drag, drop, resize) without class inheritance.',
        content: `# Composable Behaviors

Behaviors are modular interaction helpers that attach cleanly inside \`onInit()\` and return a cleanup function.

## Available Behaviors
- \`drag(element, options)\`: Pointer drag with boundary constraints and snap.
- \`droppable(element, options)\`: Drop target registration.
- \`resizable(element, options)\`: Adwaita corner handles with KDE Breeze cursors.`,
        examples: [
            `import { Component } from '@purity/core';
import { drag } from '@behaviors/draggable/draggable';

@Component({ selector: 'floating-card' })
export class FloatingCard {
  private cleanup?: { destroy(): void };

  protected onInit() {
    this.cleanup = drag(this, { snap: 20 });
  }

  protected onDestroy() {
    this.cleanup?.destroy();
  }
}`
        ]
    },
    router: {
        topic: 'router',
        title: 'Signal Router (<router-layout>)',
        summary: 'Native routing with URL signal synchronization and route guards.',
        content: `# Signal Router

Purity includes a native client-side router.

## Features
- \`<router-layout>\`: Container element mounting matched route components.
- \`routerLink\`: Directive for reactive link navigation: \`<a routerLink="/about">About</a>\`.
- \`Router\` service: \`navigate(path)\`, \`currentRoute()\` signal.
- Automated SEO sync via \`SeoService\`.`,
        examples: [
            `import { Router, Route } from '@purity/core';

export const routes: Route[] = [
  { path: '/', component: HomeComponent },
  { path: '/profile', component: ProfileComponent }
];`
        ]
    },
    seo: {
        topic: 'seo',
        title: 'SEO Subsystem (SeoService & MetaService)',
        summary: 'Dynamic metadata, OpenGraph, Twitter Cards, and JSON-LD structured data.',
        content: `# SEO Subsystem

Automated head metadata management.

## Methods
- \`setTitle(title)\`: Updates document title.
- \`setDescription(desc)\`: Sets meta description.
- \`setCanonicalUrl(url)\`: Manages \`<link rel="canonical">\`.
- \`setOpenGraph(og)\`: Sets og:title, og:image, og:description.
- \`setJsonLd(schema)\`: Injects Schema.org JSON-LD structured data.`,
        examples: [
            `import { SeoService, inject } from '@purity/core';

export class ProductPage {
  private seo = inject(SeoService);

  protected onInit() {
    this.seo.setTitle('Product Details - Purity');
    this.seo.setDescription('High-performance reactive frontend framework.');
  }
}`
        ]
    },
    'design-system': {
        topic: 'design-system',
        title: 'Adwaita Glassmorphic Design System',
        summary: 'Surfaces, frosted blur, corner radii hierarchy, and modular SCSS tokens.',
        content: `# Adwaita Design System

Purity strictly follows Adwaita glassmorphic design standards.

## Corner Radii Hierarchy
- Windows & top containers: \`var(--radius-window, 16px)\`
- Inner cards, dialog panels: \`var(--radius-card, 12px)\`
- Controls (buttons, inputs): \`var(--radius-control, 8px)\`
- Pills, badges, chips: \`var(--radius-pill, 999px)\`

## Surfaces & Colors
- Surfaces: \`var(--gnome-surface)\`, \`var(--gnome-card)\`
- Specular borders: \`var(--gnome-border)\`
- Frosted blur: \`var(--blur-effect)\`
- Accent: \`var(--color-primary)\`

## INTERNAL RULE
"GNOME 50" is an internal design reference between developer and agents. NEVER output the string "GNOME 50" in user-facing UI copy or public documentation. Describe as "Adwaita" or glassmorphic design tokens.`,
        examples: [
            `@use '@styles' as *;

.my-card {
  background: var(--gnome-card);
  backdrop-filter: var(--blur-effect);
  border: 1px solid var(--gnome-border);
  border-radius: var(--radius-card);
  padding: 16px;
}`
        ]
    },
    cursors: {
        topic: 'cursors',
        title: 'KDE Plasma Breeze Cursor System',
        summary: 'Vector SVG cursor hierarchy and animated progress engine.',
        content: `# KDE Plasma Breeze Cursors

All components use KDE Plasma Breeze cursor tokens.

## Tokens
- \`var(--cursor-default)\`: Standard arrow
- \`var(--cursor-pointer)\`: Pointer hand for clickable items
- \`var(--cursor-text)\`: I-beam for text inputs
- \`var(--cursor-grab)\`: Open hand for draggable elements
- \`var(--cursor-grabbing)\`: Closed hand during active drag
- \`var(--cursor-not-allowed)\`: Prohibited / disabled state
- \`var(--cursor-progress)\`: Ref-counted animated spinner during pending HTTP requests`,
        examples: [
            `button {
  cursor: var(--cursor-pointer, pointer);
}

.draggable-item {
  cursor: var(--cursor-grab, grab);
  &:active {
    cursor: var(--cursor-grabbing, grabbing);
  }
}`
        ]
    },
    styling: {
        topic: 'styling',
        title: 'SCSS Architecture & Rules',
        summary: 'Modular styling rules: @use "@styles" as *; and zero inline styles.',
        content: `# Styling Rules in Purity

## Mandatory Conventions
1. **Always use modular SCSS**: Every component SCSS file must begin with:
   \`@use '@styles' as *;\`
2. **NEVER use inline styles**: Never write \`style="..."\` in HTML templates.
3. **Use design tokens**: Avoid hardcoded hex colors or pixel radii. Use \`var(--radius-control)\`, \`var(--gnome-surface)\`, etc.
4. **Theme support**: Respect Dark (default baseline) and Light modes via CSS variables.`,
        examples: [
            `// In user-card.component.scss:
@use '@styles' as *;

.card-container {
  border-radius: var(--radius-card);
  background: var(--gnome-surface);
  border: 1px solid var(--gnome-border);
  cursor: var(--cursor-default);
}`
        ]
    },
    testing: {
        topic: 'testing',
        title: 'Testing Standards (Vitest & happy-dom)',
        summary: 'Colocated unit tests verifying signals, components, and DOM lifecycles.',
        content: `# Testing with Vitest

Purity uses Vitest paired with happy-dom for full Custom Elements v1 and DOM simulation.

## Conventions
- Colocate \`*.spec.ts\` directly adjacent to source files.
- Test signals synchronously.
- Test Custom Element mount via \`document.createElement(selector)\`.
- Clean up test elements in \`afterEach\`.`,
        examples: [
            `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signal } from '@purity/core';

describe('Signal Reactivity', () => {
  it('updates synchronously', () => {
    const s = signal(10);
    s.set(20);
    expect(s()).toBe(20);
  });
});`
        ]
    },
    rules: {
        topic: 'rules',
        title: 'Architectural Rules & Quality Checklist',
        summary: '10 non-negotiable rules for all AI agents and developers working in Purity.',
        content: `# Purity Non-Negotiable Rules

1. **Signals**: Use \`signal()\`, \`computed()\`, \`effect()\`, \`untrack()\`. Never use external state libraries.
2. **Mutations**: Mutate signals with \`.set()\` or \`.update()\`. Never reassign or mutate \`.value\`.
3. **Templates**: Inlined synchronously at build time with \`templateUrl: './xyz.html'\`.
4. **Repeaters**: Use \`for="let item of items"\` or \`virtual-for\`. Never \`*ngFor\` or \`v-for\`.
5. **Conditionals**: Use \`if="expr"\`, \`else-if="expr"\`, \`else\`. Falsy branches are deferred.
6. **Imports**: Path aliases mandatory (\`@purity/core\`, \`@components/*\`, \`@styles\`). Never relative \`../\`.
7. **Styles**: Always \`@use '@styles' as *;\`. NEVER use inline \`style="..."\` in templates.
8. **Cursors**: Use Breeze tokens: \`var(--cursor-pointer)\`, \`var(--cursor-default)\`, etc.
9. **Confidential Reference**: NEVER output "GNOME 50" to user-facing UI or copy. Publicly describe as "Adwaita".
10. **Testing**: Colocate tests as \`*.spec.ts\` and run with \`npm test\`.`,
        examples: [
            `// COMPLIANT:
import { Component, signal } from '@purity/core';
import '@styles';

@Component({ selector: 'valid-widget', templateUrl: './valid-widget.html' })
export class ValidWidget {
  count = signal(0);
  increment() { this.count.update(n => n + 1); }
}`
        ]
    }
};
//# sourceMappingURL=documentation.js.map