<p align="center">
  <img src="public/purity_logo.png" alt="Purity Logo" width="190" height="190" />
</p>

<h1 align="center">Purity</h1>

<p align="center">
  <strong>A lightweight, native TypeScript frontend framework powered by fine-grained signals, native Web Components, Dependency Injection, HTTP Client & Interceptors, Transform Pipes, and Composable Behaviors.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Web_Components-Custom_Elements_v1-orange?logo=web-components" alt="Web Components" />
  <img src="https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Dependencies-Zero_Runtime-brightgreen" alt="Zero Dependencies" />
</p>

---

## 📖 Overview

**Purity** is a minimalist, modern frontend framework built from scratch on top of web standards. It avoids the overhead of virtual DOM reconciliation by combining **fine-grained reactive signals** with standard **Custom Elements v1**, a lightweight **Dependency Injection** container, a native **HTTP Client & Interceptor Engine**, **Transform Pipes**, **Decoupled Form Validation**, and **Composable DOM Behaviors**.

### Key Highlights

- ⚡ **Zero Heavy Runtime Dependencies**: Pure TypeScript and Web APIs bundled with Vite.
- 🔄 **Fine-Grained Reactivity**: Synchronous `signal`, `computed`, and `effect` primitives with automated dependency tracking and sub-microsecond updates.
- 💉 **First-Class Dependency Injection**: Built-in DI container with `@Injectable` decorator and `inject()` token resolution.
- 🌐 **Native HTTP Client & Interceptors**: Injectable `HttpClient` service with full HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`), composable onion-model request/response interceptors, typed models (`HttpRequest`, `HttpResponse`, `HttpErrorResponse`), header/query helpers (`HttpHeaders`, `HttpParams`), and reactive signal resource bindings (`createResource`).
- ⚡ **Transform Pipes**: Reusable formatting classes with `@Pipe` and `BasePipe`, supporting static arguments and dynamic reactive signal parameters in templates (`{{ val | myPipe: isDynamicSignal() }}`).
- 📋 **Decoupled Form Validation Engine**: Validation rules decoupled with `@Validator` and `BaseValidator`, managing CSS states and submit buttons.
- 🏷️ **Reactive Custom Directives**: Attribute-level reactivity and DOM mutation monitoring via `@Directive` and `BaseDirective`.
- 🎯 **Composable Behaviors**: Pointer-based `drag` and `droppable` interactions with GPU acceleration (`translate3d`), boundary constraints, and center snap.
- 🧩 **Native Web Components**: Standard classes decorated with `@Component` transformed into Custom Elements with automatic template inlining and lifecycle management.
- 🔍 **Child View Queries (`@ViewChild`)**: Automatic child element and component querying by CSS selector with fallback resolution for teleported/body-prepended elements.
- 📄 **Handlebars Template Interpolation & Pipes**: Reactive `{{ expression | pipe }}` handlebars syntax with compiled expression caching (`expressionCache`). Standalone `<code>` tags evaluate signal expressions dynamically while `<pre>` blocks preserve unparsed code snippets.
- 🔁 **Structural Array Repeater**: Loop template engine (`for="let obj of myArray"` or `for="let obj, index of myArray"`) with scoped item contexts, property binding, index tracking, and nested loop support.
- 📦 **Content Projection (`<slot>`)**: Native slot transclusion allowing consumer templates to project custom HTML and nested components.
- 🌓 **Modular SCSS Theming & Light/Dark Theme Support**: First-class theme engine (`_theme-dark.scss` as baseline default, `_theme-light.scss`, `ThemeService`) with automatic `localStorage` persistence, OS `prefers-color-scheme` synchronization, high-contrast code snippet tokens, and header switch toggle.
- 🖱️ **KDE Plasma Breeze Cursor System**: Complete cursor hierarchy using vector SVG cursors from KDE Plasma (`breeze_cursors`), including a 23-frame animated progress spinner cursor (`var(--cursor-progress)`) automatically synchronized with HTTP requests and reactive UI loaders.
- 📅 **Date & Time Picker System (`<date-time-picker>`)**: Modern reactive calendar & 24h scrollable time picker in GNOME 50 Adwaita aesthetic, featuring smart viewport auto-placement, body teleportation at `z-index: 9999`, year submenu, date restrictions, glassmorphic blur, and `@Pipe('date')` integration.
- 💬 **Popover & Anchored Tooltips (`<popover>`)**: Anchored popover system with position attributes (`top`, `bottom`, `left`, `right`), smart viewport boundary collision detection with auto-flipping and coordinate clamping, directional specular arrows, hover `mouseenter`/`mouseleave` interaction with smooth debounced transition, programmatic `@ViewChild()` controls (`open()`, `close()`, `toggle()`), `<slot>` content projection, and GNOME 50 translucent glassmorphism.
- 🔽 **Declarative Custom Dropdowns (`<dropdown>`)**: Native dropdown directive and component engine with inline consumer template projection (`<ul>`, `<li>`), parent component event scoping (`onclick`), fixed dynamic positioning, `document.body` teleportation at `z-index: 10000`, and GNOME 50 frosted glassmorphism.
- 🎯 **Radial Context Menu (`<radial-context-menu>`)**: Glassmorphic circular context menu with dual representation usages (Unicode Emojis or Lucide SVG vector assets), dynamic polygon pie slices, multi-level nested submenus, center button navigation, real-time telemetry state signals, and single-source-of-truth right-click context menu delegation via `setSelector()`.
- ⏱️ **Analogue Clock Widget (`<analogue-clock>`)**: Standalone 2D Canvas clock widget in GNOME Adwaita Dark and Light themes with Retina/HiDPI subpixel clarity, frosted glass dial, 3D beveled hands, date aperture, continuous 60/120fps smooth sweep vs precision quartz ticking, and multi-timezone support.
- 🎮 **Interactive Live Playground & In-Browser Test Runner (`<playground-view>`)**: Split-pane live code editor (GNOME 50 / Palenight styling) for TypeScript, HTML, SCSS, and unit test suites (`tests.spec.ts`) with instant in-browser compilation, Hot Reload, client-side unit test runner (`describe`, `it`, `expect`, `vi.fn`), live pass/fail assertion telemetry, and persistent `localStorage` snippet history ("Save Draft").
- 🧭 **Draggable Floating Navigation Menu (`<navigation-menu>`)**: Floating draggable orb with GNOME 50 glassmorphic styling, hover drag handle, and integrated radial context menu for app-wide section and subsection navigation.
- 🗺️ **Signal Router & Layout Engine (`router.ts`, `<router-layout>`)**: Native type-safe routing engine supporting dynamic parameters (`:id`), query strings (`?tab=...`), route guards (`canActivate`), programmatic navigation (`Router.navigate`), `<router-layout>` subview host, and `routerLink` directive with automated `.active-link` state management.
- 🔎 **SEO & Head Metadata Engine (`SeoService`, `MetaService`)**: Dynamic `<title>`, `<meta>` tags, OpenGraph social sharing cards, Twitter Cards, Schema.org JSON-LD structured data, crawler-friendly noscript fallbacks, XML sitemaps, robots directives, and automated Router SEO synchronization for SPAs.
- 🚀 **Application Bootstrapping & Environment Profiles**: Clean `bootstrapApplication()` API with DI integration and separate build environment files (`environment.ts`, `environment.prod.ts`) swapped seamlessly by Vite.
- 🎨 **GNOME Adwaita Design**: Modern, translucent glassmorphic design system built with SCSS.

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/devilbd/purity.git
cd purity
npm install
```

### 2. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Runs TypeScript type checks (`tsc`) and builds the production bundle with Vite |
| `npm run build:dev` | Builds the application using development environment profile |
| `npm run build:prod` | Builds the application using production environment profile |
| `npm test` | Runs the full Vitest unit test suite (`vitest run`) |
| `npm run test:watch` | Starts interactive Vitest watcher for active development |
| `npm run test:detailed` | Executes `scripts/run-tests.sh` with test discovery and detailed telemetry |
| `npm run preview` | Serves the production build locally for testing |
| `npm run build:deploy` / `npm run deploy` | Runs `scripts/build-and-deploy.sh` to compile, verify, and deploy to Firebase |
| `npm run deploy:hosting` | Runs `scripts/build-and-deploy.sh --only hosting` |

---

## 🏛️ Project Structure

```
purity/
├── public/                      # Static assets served at root
│   ├── cursors/                 # KDE Plasma Breeze scalable vector cursors (91 SVGs)
│   ├── purity_logo.png          # Purity framework logo
│   ├── robots.txt               # Search engine crawler directives & sitemap reference
│   └── sitemap.xml              # XML sitemap conforming to sitemaps.org protocol
├── scripts/                     # Automation & deployment scripts
│   ├── build-and-deploy.sh      # Automated build, verification & Firebase deployment script
│   └── run-tests.sh             # High-resolution test discovery, telemetry & execution runner
├── index.html                   # HTML entry point mounting <app-component> with rich SEO & JSON-LD
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # Strict TypeScript configuration
├── vitest.config.ts             # Vitest configuration (happy-dom, decorator transpile, path aliases)
├── .env.example                 # Environment variables reference template
├── .antigravityrules            # Antigravity agent rules & architectural constraints
├── .cursorrules                 # Cursor agent rules & architectural constraints
├── AGENTS.md                    # Multi-agent guidelines & architectural rules
├── vite.config.ts               # Vite configuration & decorator / template inlining plugin
├── README.md                    # Project documentation (this file)
├── GEMINI.md                    # Agent context & architecture reference
└── src/
    ├── main.ts                  # Application entry point (bootstraps root component & imports global style.scss)
    ├── style.scss               # Master global stylesheet importing modular design system
    ├── styles/                  # Modular SCSS architecture & Theme Engine
    │   ├── _variables.scss      # Global non-theme variables (radii, typography, spacing, transitions, blur filters, Breeze cursor tokens)
    │   ├── _mixins.scss         # SCSS mixins (glassmorphism, flex, button lifts, scrollbars)
    │   ├── _theme-dark.scss     # GNOME Adwaita Dark theme tokens (baseline default)
    │   ├── _theme-light.scss    # GNOME Adwaita Light theme tokens
    │   ├── _themes.scss         # Theme loader (binds :root, html, body & [data-theme='dark'|'light'])
    │   ├── _base.scss           # Base typography, body, window, buttons, code blocks, inputs, and Breeze cursor hierarchy
    │   └── index.scss           # Barrel export for @use '@styles' as *;
    ├── framework/               # Core framework modules
    │   ├── core.ts              # Signals, effects, DOM utilities, and module re-exports
    │   ├── component.ts         # @Component, @ViewChild, lifecycle, template inliner, slot & pipe engine
    │   ├── di.ts                # Dependency Injection container and @Injectable decorator
    │   ├── bootstrap.ts         # bootstrapApplication entry, providers, and environment tokens
    │   ├── http.ts              # HttpClient service, HttpInterceptor pipeline, HttpHeaders, HttpParams, resources, and Breeze cursor animation engine
    │   ├── pipe.ts              # @Pipe decorator, BasePipe, PipeTransform, pipe registry
    │   ├── directive.ts         # @Directive decorator, BaseDirective, DOM mutation tracking
    │   ├── validator.ts         # @Validator decorator, BaseValidator, form/field validation
    │   ├── router.ts            # Signal Router, <router-layout>, routerLink directive, and route guards
    │   ├── seo.ts               # SeoService, MetaService, OpenGraph, Twitter, Schema.org JSON-LD
    │   └── common.ts            # Shared framework exports
    ├── environments/            # Build configuration & environment profiles
    │   ├── environment.interface.ts # Environment configuration contract
    │   ├── environment.ts       # Development environment (default)
    │   └── environment.prod.ts  # Production environment (swapped on build)
    ├── data/                    # Data services & Theme configuration
    │   ├── data.service.ts      # Service layer
    │   ├── theme.service.ts     # Reactive ThemeService for Dark/Light mode & localStorage
    │   └── notify.service.ts    # Reactive NotifyService for toast notifications
    └── app/                     # Sample application & showcases
        ├── app.component.html   # Root template
        ├── app.component.scss   # Root styling
        ├── app.component.ts     # Root <app-component> class
        ├── assets/              # Fonts (Adwaita Mono), KDE Plasma Breeze cursors, and static assets (radial menu SVGs)
        │   ├── cursors/         # Scalable vector cursor assets (91 SVGs)
        │   ├── mono/            # Adwaita Mono font
        │   └── radial-context-menu/ # Radial menu icon SVGs
        ├── pages/               # Application pages, views & feature showcases (header, footer, intro, playground, demo, router-sample, analogue-clock-sample, date-time-picker-sample, popover-sample, radial-context-menu-sample, http-sample, modal-sample, notification-sample, directive-sample, forms-validation, for-sample, if-sample, virtual-for-sample, pipe-sample)
        └── shared/
            ├── behaviors/       # Composable DOM behaviors (draggable, droppable)
            ├── directives/      # Reusable DOM directives (dropdown, highlight)
            ├── pipes/           # Reusable transform pipes (date, transform-sample, uppercase)
            ├── validators/      # Form & field validation classes (forms-validation)
            ├── widgets/         # Rich standalone widgets (analogue-clock)
            └── components/      # Reusable UI Web Components (modal, loader, notification, popover, date-time-picker, radial-context-menu, navigation-menu)
```

---

## 💻 Core Framework Architecture & Primitives

### 1. 🔄 Fine-Grained Reactive Signals, Computed Values & Effects (`core.ts`)

Purity features a synchronous reactivity engine with automated dependency tracking and sub-microsecond updates:

```typescript
import { signal, effect, computed } from '@purity/core';

// 1. Create typed reactive signals
const count = signal<number>(5);
const multiplier = signal<number>(2);

// 2. Read value via getter call
console.log(count()); // 5

// 3. Derived read-only values with computed() (recalculates automatically)
const total = computed(() => count() * multiplier());
const isEven = computed(() => count() % 2 === 0);
console.log(total()); // 10

// 4. Mutate value with .set() or .update()
count.set(10);
count.update(n => n + 1); // 11 -> total() automatically becomes 22

// 5. Effects automatically register signal/computed dependencies and re-run synchronously
effect(() => {
    console.log(`Calculated total: ${total()} | Is Even: ${isEven()}`);
});
```

#### 🔍 How Fine-Grained Reactive Dependency Tracking Works Under the Hood

Purity operates **without a Virtual DOM** and **without component-wide re-renders**. Updates are handled with sub-microsecond precision through synchronous dependency tracking:

1. **Global Execution Context Stack (`context: Function[]`)**:
   The framework maintains a private stack of currently executing reactive computations (`effect` or `computed`).

2. **Automatic Subscription on Read**:
   When a signal getter is evaluated (e.g., `count()`), it inspects the top of the execution stack. If an effect is running, that effect's runner function is automatically registered into the signal's private `subscriptions: Set<Function>`.

3. **Synchronous Notification on Write**:
   When `.set(newValue)` or `.update(fn)` is called:
   - It performs an `Object.is(oldValue, newValue)` equality check to eliminate redundant updates.
   - It updates the internal value and synchronously executes each function in its `subscriptions` Set.

4. **Atomic DOM Node Updates**:
   During template compilation (`bindTemplate`), Purity compiles reactive expressions into isolated `effect()` closures targeted at specific DOM nodes:
   - **Text Nodes (`{{ count() }}`)**: Purity isolates dynamic Handlebars interpolations into dedicated native `Text` nodes. When `count.set()` runs, only that single `Text.nodeValue` changes in the DOM. Surrounding HTML elements and parent components are never re-evaluated.
   - **Dynamic Attributes (`class="{{ status() }}"`, `disabled="{{ isDisabled() }}"`)**: Only the specific attribute on that HTML element is updated.
   - **Structural Directives (`if="expr"`, `for="let item of items"`)**: Targeted effects mount, unmount, or repeat only the affected DOM slice via comment anchors and `DocumentFragment` insertion.

---

### 2. 💉 First-Class Dependency Injection (`di.ts`)

Singleton service registration with the `@Injectable` decorator and instant token resolution using `inject()`:

```typescript
import { Injectable, signal, inject, Component } from '@purity/core';

export interface User {
    id: number;
    name: string;
    role: string;
}

// 1. Declare injectable singleton service
@Injectable('DataService')
export class DataService {
    currentUser = signal<User | null>(null);

    login(username: string): User {
        const user: User = { id: Date.now(), name: username, role: 'admin' };
        this.currentUser.set(user);
        return user;
    }

    logout(): void {
        this.currentUser.set(null);
    }
}

// 2. Inject singleton service anywhere by constructor or token
@Component({ selector: 'user-profile' })
export class UserProfileComponent {
    private dataService = inject(DataService);

    onLogout() {
        this.dataService.logout();
    }
}
```

---

### 3. 🌐 HTTP Client Service & Centralized Interceptors (`http.ts`, `@interceptors`)

Purity provides a zero-dependency, type-safe HTTP Client service registered into DI and re-exported via `@purity/core`:

#### 1. Centralized Interceptor Classes (`src/app/shared/interceptors/`)

Interceptors are decoupled from components into centralized classes implementing `HttpInterceptor`:

```typescript
// src/app/shared/interceptors/auth.interceptor.ts
import type { HttpInterceptor, HttpRequest, HttpResponse, HttpNextFn } from '@purity/core';

export class AuthInterceptor implements HttpInterceptor {
    async intercept(req: HttpRequest, next: HttpNextFn): Promise<HttpResponse<any>> {
        const authReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer my_jwt_token'),
        });
        return next(authReq);
    }
}
```

```typescript
// src/app/shared/interceptors/logging.interceptor.ts
import type { HttpInterceptor, HttpRequest, HttpResponse, HttpNextFn } from '@purity/core';

export class LoggingInterceptor implements HttpInterceptor {
    async intercept(req: HttpRequest, next: HttpNextFn): Promise<HttpResponse<any>> {
        const start = performance.now();
        try {
            const res = await next(req);
            console.log(`[HTTP] ${req.method} ${req.url} -> ${res.status} (${Math.round(performance.now() - start)}ms)`);
            return res;
        } catch (err: any) {
            console.error(`[HTTP Error] ${req.method} ${req.url} failed:`, err);
            throw err;
        }
    }
}
```

#### 2. Register Interceptors in Bootstrap (`src/main.ts`)

```typescript
import { bootstrapApplication } from '@purity/core';
import { AppComponent } from '@app/app.component';
import { environment } from '@environments/environment';
import { LoggingInterceptor } from '@interceptors/logging.interceptor';
import { AuthInterceptor } from '@interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
    environment,
    interceptors: [LoggingInterceptor, AuthInterceptor],
});
```

#### 3. Consuming `HttpClient` in Components

Page components simply inject `HttpClient` without any boilerplate. Requests automatically execute through the interceptor chain:

```typescript
import { Component, signal, inject, HttpClient, HttpParams } from '@purity/core';

interface Post {
    id: number;
    title: string;
    body: string;
}

@Component({ selector: 'posts-page', templateUrl: './posts-page.html' })
export class PostsPageComponent {
    private http = inject(HttpClient);
    posts = signal<Post[]>([]);

    async loadPosts() {
        const res = await this.http.get<Post[]>('https://jsonplaceholder.typicode.com/posts', {
            params: new HttpParams().set('userId', 1),
        });
        this.posts.set(res.data);
    }
}
```

#### 4. Animated Breeze Loading Cursor Lifecycle

`HttpClient` automatically triggers an animated 23-frame KDE Plasma Breeze progress cursor (`progress-01.svg` to `progress-23.svg` cycling at ~22fps) whenever HTTP requests are active. It uses reference-counted helpers (`startLoadingCursor()` / `stopLoadingCursor()`) shared across the framework so multiple concurrent network calls and active UI loaders (`<loader-component>`) never cancel loading animations prematurely.

---

### 4. 🌓 Modular SCSS Theming, ThemeService & KDE Plasma Breeze Cursors

Purity provides a first-class theming engine supporting **Dark** (GNOME Adwaita Dark, set as default base foundation) and **Light** (GNOME Adwaita Light) modes. Variables are mapped dynamically to `:root`, `html[data-theme='dark']`, and `html[data-theme='light']`:

```typescript
import { inject } from '@purity/core';
import { ThemeService } from '@data/theme.service';

const themeService = inject(ThemeService);

// 1. Read active theme reactively
console.log(themeService.currentTheme()); // 'dark' | 'light'
console.log(themeService.isDark());       // true | false

// 2. Toggle or set theme programmatically
themeService.toggleTheme();
themeService.setTheme('light');
```

#### KDE Plasma Breeze Cursor System

All interactive components, draggable widgets, code blocks, inputs, buttons, and loading states strictly utilize KDE Plasma Breeze vector cursors defined via CSS variables in `src/styles/_variables.scss`:

| Token | Cursor Type | Target Elements |
|---|---|---|
| `var(--cursor-default)` | Breeze Arrow Pointer | Standard body, containers, text cards |
| `var(--cursor-pointer)` | Breeze Pointer Hand | Buttons, navigation links, dropdown toggles, tabs |
| `var(--cursor-text)` | Breeze I-Beam | Inputs, textareas, contenteditable, code blocks |
| `var(--cursor-grab)` | Breeze Open Hand | Draggable widgets, floating navigation orb |
| `var(--cursor-grabbing)` | Breeze Closed Hand | Active dragging state (`.is-dragging`) |
| `var(--cursor-not-allowed)` | Breeze Prohibited Slash | Disabled buttons, restricted calendar dates |
| `var(--cursor-progress)` | Breeze Animated Spinner | Active HTTP requests, visible `<loader-component>` |
| `var(--cursor-wait)` | Breeze Hourglass/Watch | Blocking operations, background sync |

---

### 5. ⚡ Transform Pipes & Dynamic Parameters (`pipe.ts`)

Transform Pipes decouple data transformation and formatting logic from UI components and templates. They integrate directly with Handlebars template expressions (`{{ value | pipeName: arg1 : arg2 }}`), supporting static values as well as dynamic reactive signal parameters that automatically re-run transformations when dependencies update:

```typescript
import { Pipe, BasePipe } from '@purity/core';

// 1. Declare transform pipe with typed arguments
@Pipe('myTransformPipe')
export class MyTransformPipe extends BasePipe {
    transform(value: any, isUppercase: boolean = false, prefix?: string): string {
        if (value === null || value === undefined) return '';
        let str = String(value);
        if (isUppercase) {
            str = str.toUpperCase();
        }
        return prefix ? `${prefix}: ${str}` : str;
    }
}
```

#### Handlebars Usage with Dynamic Signal Parameters

```html
<!-- Pipe with dynamic reactive signal parameter -->
<div>{{ myValue() | myTransformPipe: isUppercaseSignal() : '✨ Output' }}</div>

<!-- Pipe with static parameter -->
<div>{{ count() | myTransformPipe: true }}</div>

<!-- Chained pipes -->
<div>{{ total() | currency: '$' : 2 | bold }}</div>
```

---

### 6. 📋 Decoupled Form Validation Engine (`validator.ts`)

Form Validators decouple validation logic from UI templates, automatically tracking field mutations, managing overall form validity, updating submit button `disabled` states, and applying customizable CSS state classes:

```typescript
import { Validator, BaseValidator } from '@purity/core';

// Decorator binds validation rules directly to matching form elements
@Validator({
    form: '.forms-validation-form',
    fields: {
        username: '#input1',
        password: '#input2',
    },
    validClass: 'is-valid',
    invalidClass: 'is-invalid',
})
export class UserFormValidator extends BaseValidator {
    validateUsername(value: string): boolean {
        return value.trim().length >= 3;
    }

    validatePassword(value: string): boolean {
        return value.trim().length >= 6;
    }
}
```

---

### 7. 🏷️ Reactive Custom Directives (`directive.ts`)

Directives attach custom behavior, styling, and reactive listeners directly to DOM elements via attributes:

```typescript
import { Directive, BaseDirective } from '@purity/core';

@Directive('highlight')
export class HighlightDirective extends BaseDirective {
    onInit() {
        this.element.classList.add('p-highlight');
        this.onChanges(this.value);
    }

    onChanges(newValue: any) {
        // Toggle modifier class when bound value or {{ expression }} changes
        this.element.classList.toggle('p-highlight--active', !!newValue);
    }

    onDOMChange(record: MutationRecord | Event) {
        // Detects host element attribute and input changes
        console.log('Host DOM changed:', record);
    }
}
```

#### Using Directives in Templates

```html
<p highlight="gold">Static highlight</p>
<div highlight="{{activeVariant()}}">Reactive highlight</div>
```

#### Custom `<dropdown>` Component & Directive Engine

Purity provides a native `<dropdown>` directive engine (`@Directive('dropdown')`) allowing consumers to declare custom inner templates with standard `<ul>`, `<li>`, icons, headers, and dividers. All event handlers (`onclick`) are scoped to the **consuming parent component**:

```html
<!-- Consuming in any component template -->
<dropdown label="Framework Services">
    <ul>
        <div class="dropdown-header">Core Primitives</div>
        <li onclick="onSelectService('signals')">
            <span class="item-icon">⚡</span>
            <span class="item-text">Synchronous Signals</span>
            <span class="item-badge">Core</span>
        </li>
        <li onclick="onSelectService('components')">
            <span class="item-icon">🧩</span>
            <span class="item-text">Web Components v1</span>
            <span class="item-badge">Native</span>
        </li>
        <hr class="dropdown-divider" />
        <div class="dropdown-header">Networking</div>
        <li onclick="onSelectService('http')">
            <span class="item-icon">🌐</span>
            <span class="item-text">HTTP Client Pipeline</span>
        </li>
    </ul>
</dropdown>
```

- **Document Body Teleportation**: The dropdown popup body is automatically appended directly to `document.body` (`z-index: 10000; position: fixed`), preventing parent `overflow: hidden`, `backdrop-filter`, or stacking context clipping.
- **Dynamic Positioning & Viewport Boundary Auto-Placement**: Automatically detects screen bounds to flip upward if near the viewport bottom and updates coordinates dynamically on window scroll and resize.
- **GNOME 50 Design System**: Glassmorphic frosted blur (`backdrop-filter: var(--blur-effect)`), specular borders, smooth cubic-bezier transitions, and KDE Plasma Breeze cursors.

---

### 8. 🎯 Composable Interaction Behaviors (`behaviors/`)

Enhance elements without deep inheritance trees. Behaviors attach modular interactions like pointer drag-and-drop with GPU acceleration (`translate3d`), boundary constraints, and center snapping:

```typescript
import { drag } from '@behaviors/draggable/draggable';
import { droppable } from '@behaviors/droppable/droppable';

// 1. Register droppable drop target
const dropCleanup = droppable({
    selector: '#droppable-container',
    accepts: '#component1',
    hoverClass: 'droppable-hover',
    onDrop: (draggedEl) => draggedEl.remove(),
});

// 2. Attach pointer drag interaction with boundaries & center snapping
const dragCleanup = drag({
    selector: '#component1',
    constrainTo: 'body',
    snapTo: '#droppable-container',
    handle: '.drag-handle',
    onDragStart: (el) => el.classList.add('dragging'),
    onDragEnd: (el) => el.classList.remove('dragging'),
});

// Teardown during component destruction
// dragCleanup.destroy();
// dropCleanup.destroy();
```

---

### 9. 🗺️ Signal Router & Layout Engine (`router.ts`, `<router-layout>`, `routerLink`)

Purity includes a built-in, type-safe, signal-driven routing engine:

* **Dynamic Parameters & Wildcards**: Full support for parameterized routes (`/users/:id`), wildcards (`/docs/*`), and catch-alls (`**`).
* **`<router-layout>` Component**: Dynamic container that mounts matching component views instantaneously upon route changes.
* **`routerLink` Directive**: Declarative navigation links (`<button routerLink="/users/alice">` or `<a routerLink="/">`) with automatic active state styling (`.active-link`, `.active-route`).
* **Fine-Grained Reactive Signals**: `Router.url()`, `Router.path()`, `Router.params()`, and `Router.queryParams()` update synchronously with zero full-page reloads.
* **Guards & Lifecycle Hooks**: Route-level `canActivate` protection pipelines and document `title` resolution.

#### Example Usage:

```typescript
import { Component, signal, effect, inject, Router, type Route } from '@purity/core';

// 1. Define Sub-view Components
@Component({
    selector: 'user-view',
    template: `
        <div class="user-card">
            <h4>👤 Profile: {{userId()}}</h4>
            <p>Active parameter extracted from <code>/users/:id</code></p>
        </div>
    `
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

// 2. Configure Route Table
export const appRoutes: Route[] = [
    { path: '/', component: HomeViewComponent, title: 'Home' },
    { path: '/users/:id', component: UserViewComponent, title: (p) => `User ${p.id}` },
];
```

```html
<!-- 3. Navigation Links and Layout Viewport in Component Template -->
<nav class="nav-bar">
    <button type="button" routerLink="/">🏠 Home</button>
    <button type="button" routerLink="/users/alice">👤 Alice</button>
    <button type="button" routerLink="/users/bob">👤 Bob</button>
</nav>

<div class="viewport">
    <router-layout></router-layout>
</div>
```

---

### 10. 🔎 SEO & Head Metadata Subsystem (`seo.ts`, `SeoService`)

Purity provides a fine-grained, reactive SEO and head metadata engine designed for SPAs with static content:

- **`SeoService` / `MetaService` (`@Injectable('SeoService')`)**:
  - `setTitle(title, options?)`: Updates `<title>` and synchronizes `meta[name="title"]`, `og:title`, and `twitter:title`.
  - `setDescription(description)`: Updates primary description, OpenGraph description, and Twitter description.
  - `setKeywords(keywords)`: Updates `<meta name="keywords">`.
  - `setCanonicalUrl(url)`: Updates or injects `<link rel="canonical">` and `og:url` / `twitter:url`.
  - `setRobots(options)`: Configures indexing (`index, follow, max-image-preview:large, max-snippet:-1`).
  - `setOpenGraph(og)`: Sets full OpenGraph tags (`title`, `description`, `image`, `type`, `siteName`, `locale`).
  - `setTwitterCard(twitter)`: Sets Twitter Card tags (`card`, `site`, `creator`, `title`, `description`, `image`).
  - `setJsonLd(schema, id?)`: Dynamic Schema.org JSON-LD structured data script injection.
  - `setSeo(config)`: Batch updates full SEO metadata for a route or component.

#### Example Usage in Component:

```typescript
import { Component, inject, SeoService } from '@purity/core';

@Component({ selector: 'my-feature-view' })
export class MyFeatureViewComponent {
    private seo = inject(SeoService);

    protected onInit() {
        this.seo.setSeo({
            title: 'Feature Showcase - Purity Framework',
            description: 'Explore native signals, custom elements, and DI.',
            canonical: 'https://purity-world.dev/feature',
            og: {
                title: 'Feature Showcase',
                image: 'https://purity-world.dev/purity_logo.png',
            },
            jsonLd: {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Feature Showcase',
            },
        });
    }
}
```

---

### 11. 🚀 Application Bootstrapping & Environment Profiles (`bootstrap.ts`, `environments/`)

Purity provides a clean `bootstrapApplication()` initialization API that binds environment profiles, registers custom service providers and interceptors, configures application routes, and mounts root Web Components:

```typescript
import './style.scss';
import { bootstrapApplication } from '@purity/core';
import { AppComponent } from '@app/app.component';
import { environment } from '@environments/environment';
import { ThemeService } from '@data/theme.service';
import { LoggingInterceptor } from '@interceptors/logging.interceptor';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { RouterHomeViewComponent } from '@pages/router-sample/home-view.component';
import { RouterUserViewComponent } from '@pages/router-sample/user-view.component';

bootstrapApplication(AppComponent, {
    environment,
    providers: [ThemeService],
    interceptors: [LoggingInterceptor, AuthInterceptor],
    routes: [
        { path: '/', component: RouterHomeViewComponent },
        { path: '/users/:id', component: RouterUserViewComponent },
    ],
    routerOptions: {
        mode: 'history',
        scrollRestoration: false,
    },
}).catch((err) => {
    console.error('Failed to bootstrap Purity application:', err);
});
```

#### Environment Configuration Files

- `src/environments/environment.ts`: Default development profile (`production: false`, debug diagnostics enabled).
- `src/environments/environment.prod.ts`: Production profile (`production: true`).
- Swapped automatically at build time by Vite depending on `--mode production` (`npm run build:prod`) or `--mode development` (`npm run build:dev`).

---

## 🧩 UI Web Components, Templating & Views

### 12. 🧩 Native Web Components (`@Component` Decorator)

Standard TypeScript classes decorated with `@Component` are transformed into native Custom Elements with synchronous template inlining and full lifecycle hooks:

```typescript
import { Component, signal } from '@purity/core';
import './custom.component.scss';

@Component({
    selector: 'custom-component',
    templateUrl: './src/app/pages/custom/custom.component.html',
})
export class CustomComponent {
    customProperty = signal<string | null>(null);

    protected onInit() {
        // Invoked after template DOM elements are mounted
    }

    onInput(element: HTMLInputElement) {
        this.customProperty.set(element.value);
    }

    onClear() {
        this.customProperty.set(null);
    }

    protected onDestroy() {
        // Teardown subscriptions, timers, and listeners
    }
}
```

---

### 13. 🔍 Child View & Component Queries (`@ViewChild`)

Use the `@ViewChild()` decorator to query child DOM elements and child components. When the selector is omitted, the framework implicitly infers candidate selectors from the property name in kebab-case (`<my-component>`, `#my-component`, `<my>`, `#my`). An explicit selector is optional and only needed when disambiguating between multiple instances:

```typescript
import { Component, ViewChild, signal } from '@purity/core';
import type { LoaderComponent } from '@components/loader/loader.component';
import type { CustomComponent } from '@pages/custom/custom.component';

@Component({
    selector: 'demo-component',
    templateUrl: './demo.component.html',
})
export class DemoComponent {
    // 1. IMPLICIT RESOLUTION: Automatically finds <loader-component> or #loader
    @ViewChild()
    loaderComponent?: LoaderComponent | null;

    // 2. OPTIONAL EXPLICIT SELECTOR: Disambiguates between multiple instances
    @ViewChild('#component1')
    customComponent1?: CustomComponent | null;

    @ViewChild('#component2')
    customComponent2?: CustomComponent | null;

    onTriggerChild() {
        // Clean property access without manual querySelector boilerplate
        this.loaderComponent?.show('Loading data...');
        this.customComponent1?.customProperty.set('Updated by parent');
    }
}
```

---

### 14. 📄 Handlebars Template Interpolation & Pipes (`{{ expression | pipe }}`)

Purity supports declarative `{{ expression | pipe }}` template interpolations. Text nodes, element attributes, and pipe arguments automatically bind to signals and re-render fine-grained when signal dependencies change. The engine preserves `<pre>` documentation snippets and `[data-no-bind]` blocks while fully binding dynamic expressions inside standalone `<code>` tags:

```html
<!-- 1. HTML Template: Declarative Signal Rendering & Pipe Transformation -->
<div class="user-card window {{loginStatus}}">
    <!-- Reactive text content and transform pipe -->
    <h3>Welcome, {{currentUser() | uppercase}}!</h3>
    <p>Formatted: {{count() | myTransformPipe: isVip() : 'Points'}}</p>

    <!-- Dynamic input value binding -->
    <input type="text" value="{{currentUser()}}" class="input-primary" oninput="app.onTextInput(this)" />

    <!-- Child component signal binding -->
    <div class="child-status">
        Child: {{customComponent1?.customProperty()}}
    </div>
</div>
```

```typescript
// 2. Component Class: Signal Definitions
@Component({ selector: 'user-card', templateUrl: './user-card.html' })
export class UserCardComponent {
    currentUser = signal('Alice');
    count = signal(5);
    isVip = signal(true);
    loginStatus = signal('success');
}
```

---

### 15. 🔁 Structural Array Repeater (`for="let obj of myArray"`)

Purity provides native structural loop templates via `for="let item of items"` or `for="let obj, index of myArray"`. The engine automatically establishes scoped item evaluation contexts, tracks array signals reactively, supports nested loops, and seamlessly updates DOM nodes on array mutations (`.update()`, `.set()`):

```html
<!-- 1. HTML Template: Array Repeater, Index Tracking & Nested Loops -->
<div for="let obj, index of members" class="member-card window">
    <div class="member-info">
        <span class="member-index">#{{index + 1}}</span>
        <strong>{{obj.name | uppercase}}</strong>
        <span class="status-pill">{{obj.status}}</span>
    </div>
    <div class="member-role">{{obj.role}}</div>

    <!-- Nested loop for array properties -->
    <div class="member-tags">
        <span for="let tag of obj.tags" class="tag-badge">{{tag}}</span>
    </div>
</div>
```

---

### 16. ⚡ High-Performance Virtualized Repeater (`virtual-for`)

Purity includes a dedicated GPU-accelerated virtual scrolling engine for massive datasets (1,000 to 100,000+ items). It renders only the visible viewport slice (~20–30 DOM nodes) with overscan buffering, absolute GPU transforms, phantom scroll height simulation, batched `DocumentFragment` insertion, declarative `scrollIndex` reactive signal binding, zero layout thrashing, and sub-millisecond signal updates:

```html
<!-- High-Performance 100k Virtualized Viewport with reactive scrollIndex -->
<div class="viewport-container">
    <div
        virtual-for="let txn, index of transactions; itemHeight: 48; buffer: 8; height: 420px; scrollIndex: jumpTarget"
        class="transaction-row"
    >
        <span class="idx">#{{index + 1}}</span>
        <strong>{{txn.title}}</strong>
        <span class="badge">{{txn.status}}</span>
        <span class="amount">{{txn.amount}}</span>
    </div>
</div>
```

---

### 17. 🔀 Structural Conditionals (`if="expr"`, `else-if="expr"`, `else`)

Purity supports declarative structural conditionals with **lazy compilation and deferred execution**. When an `if` expression evaluates to falsy, its inner DOM subtree is completely excluded from the live document — text interpolations, directives, validators, and child Custom Component lifecycles will **not build or execute** until the condition evaluates to truthy:

```html
<!-- Multi-branch Conditional Hierarchy -->
<div if="activeTab() === 'dashboard'" class="tab-panel">
    <dashboard-view></dashboard-view>
</div>
<div else-if="activeTab() === 'analytics'" class="tab-panel">
    <analytics-view></analytics-view>
</div>
<div else class="tab-panel">
    <p>Please select a tab above to continue.</p>
</div>
```

---

### 18. 📦 Generic Components & Content Projection (`<slot>`)

Purity components support native `<slot>` content projection. Any child elements, text, or nested components passed between the tags of a custom element are dynamically projected into the component's template:

```html
<!-- 1. Consumer Template: Passing arbitrary HTML & components into <modal-view> -->
<modal-view id="demo-modal">
    <div class="custom-projected-body">
        <h4>📦 Projected Modal Content</h4>
        <p>This content is rendered inside the slot of modal-view!</p>
        <custom-component id="projected-component"></custom-component>
    </div>
</modal-view>

<!-- 2. Component Template (modal-view.component.html) -->
<div class="modal-dialog window">
    <div class="modal-body">
        <slot>
            <p>Default fallback content when no children are passed</p>
        </slot>
    </div>
</div>
```

---

### 19. 🪟 Modal Dialogs (`<modal-view>`)

Reusable dialog components with `open()`, `close()`, `maximize()`, `position: absolute`, and `document.body` prepending with `z-index: 1000`:

```typescript
import { Component, signal } from '@purity/core';
import './modal-view.component.scss';

@Component({
    selector: 'modal-view',
    templateUrl: './modal-view.component.html',
})
export class ModalViewComponent {
    isOpen = signal<boolean>(false);
    isMaximized = signal<boolean>(false);
    title = signal<string>('Purity Modal Dialog');

    protected onInit() {
        // Always prepends to document.body with position: absolute & z-index: 1000
        document.body.prepend(this as any);
    }

    open(options?: { title?: string }) {
        if (options?.title) this.title.set(options.title);
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
    }

    maximize() {
        this.isMaximized.update(v => !v);
    }
}
```

---

### 20. ⏳ Reactive HTTP & UI Loader Component (`<loader-component>`)

Purity provides a lightweight, reactive inline loader custom element styled with GNOME 50 glassmorphism, accent SVG track animation, and automated Breeze loading cursor coordination:

```typescript
import { Component, signal, effect, startLoadingCursor, stopLoadingCursor } from '@purity/core';
import './loader.component.scss';

@Component({
    selector: 'loader-component',
    templateUrl: './loader.component.html',
})
export class LoaderComponent {
    public isLoading = signal<boolean>(false);
    public message = signal<string>('Loading...');

    protected onInit() {
        // Observes isLoading reactively and triggers the animated Breeze progress cursor
        effect(() => {
            const loading = this.isLoading();
            const host = (this as any).element as HTMLElement | null;
            if (host) host.classList.toggle('is-loading', loading);
            if (loading) startLoadingCursor();
            else stopLoadingCursor();
        });
    }

    public show(msg: string = 'Loading...'): void {
        this.message.set(msg);
        this.isLoading.set(true);
    }

    public hide(): void {
        this.isLoading.set(false);
    }
}
```

#### Usage in Templates:

```html
<loader-component id="http-loader"></loader-component>
```

---

### 21. 📅 Date & Time Picker Component (`<date-time-picker>`) & Date Pipe (`date`)

Purity includes a full-featured, reactive Date & Time Picker custom element styled in GNOME 50 Adwaita Dark and Light aesthetics with glassmorphic blur effects, body overlay teleportation, and smart viewport-aware auto-placement:

- **Reactivity & Signals**: State (`selectedDate`, `isOpen`, `viewDate`, `workingHours`, `workingMinutes`, `restrictions`, `enableBlur`) driven by fine-grained Purity signals.
- **Direct Body Overlay Teleportation**: Dropdown overlay automatically attaches directly to `document.body` at `z-index: 9999`, rendering cleanly above all other cards, stacking contexts, and radial menus without clipping.
- **Smart Viewport Auto-Placement**: Automatically measures available screen headroom and footroom to flip the popup above (`placement-top`) or below (`placement-bottom`) the trigger button, with horizontal auto-alignment and window scroll tracking.
- **Year Navigation Submenu & Frosted Body Blur**: Fast multi-year scrollable selector overlay with smooth animated chevron toggle, applying a frosted background blur effect (`filter: blur(6px)`) to the calendar body grid while year selection is active.
- **Glassmorphic Surface Blur Tokens**: Configurable glassmorphism blur overlay (`enableBlur`, `--dp-surface-bg`, `--dp-surface-blur-bg`) with hardware-accelerated backdrop filters (`var(--blur-effect)`, `var(--blur-heavy)`).
- **24-Hour Time Capsule**: Dual numeric hours & minutes input supporting text entry, key navigation, and mouse-wheel scrolling (`handleWheel`).
- **Date & Time Restrictions**: Configurable boundaries via `DateRestriction` (`futureOnly`, `pastOnly`, `minDate`, `maxDate`, `daysBack`, `daysForward`, `minTime`, `maxTime`, `disabledDates`).
- **DatePipe Formatting**: Built-in `@Pipe('date')` transform pipe for flexible Handlebars date expressions (`{{ myDate() | date: 'EEEE, MMMM d, yyyy HH:mm' }}`).

---

### 22. 🎯 Radial Context Menu System (`<radial-context-menu>`)

Purity provides a native circular radial context menu component with glassmorphic GNOME Adwaita styling, dynamic polygon segment calculation, recursive multi-level submenus, center button breadcrumb navigation, real-time telemetry state signals, and single-source-of-truth right-click delegation via `setSelector()`:

* **Dynamic Pie Slices**: Automatically computes mathematical polygon clip paths (`innerDist = 26%`, `outerDist = 49.5%`) for any number of menu items.
* **Multi-Level Navigation**: Push/pop navigation stack for nested `children` submenus with smooth zoom/fade animations.
* **Viewport Boundaries**: Clamps menu coordinates so radial menus never overflow outside the viewport.
* **Dual Icon Representations**: Supports both Unicode Emojis and inlined Lucide SVG vector icons (`home.svg`, `edit.svg`, `search.svg`, `settings.svg`, `share.svg`, `user.svg` in `src/app/assets/radial-context-menu/`) with theme-adaptive stroke styling.
* **Direct Body Attachment**: Renders directly on `document.body` at `z-index: 9999`, immune to parent stacking contexts.
* **Center Navigation**: Displays back arrow `←` during nested navigation, close `×` at root, and shows active hovered segment names in real time.
* **Clean Context Menu Delegation**: Set trigger zones with `setSelector('.interactive-zone')`. The component automatically listens for right-clicks matching the selector and opens at cursor coordinates without conflicting duplicate event handlers.

---

### 23. ⏱️ Analogue Clock Widget (`<analogue-clock>`, `@widgets/*`)

Purity includes a high-precision 2D Canvas analogue clock widget in `src/app/shared/widgets/analogue-clock/`, designed in GNOME Adwaita Dark and Light aesthetics:

* **Retina / HiDPI Scaling**: Automatically measures and scales the backing canvas using `window.devicePixelRatio` for razor-sharp rendering on High-DPI and Retina displays.
* **Multi-Layered Bezel & Frosted Dial**: Brushed metallic rim with specular highlights, frosted glass dial face with concentric precision tracks, and convex watch crystal gloss reflections.
* **3D Beveled Sword Hands**: Chamfered dual-tone hour and minute hands with realistic directional light reflections and soft drop shadows.
* **Continuous Sweep & Precision Quartz Modes**: Reactive signal toggle between smooth 60/120fps continuous sweep and discrete 1-second quartz steps.
* **Date Aperture & Multi-Timezone Support**: Integrated day/date window (`WED 25`) and support for standard IANA timezones (`Local`, `UTC`, `Europe/London`, `America/New_York`, `Europe/Paris`, `Asia/Tokyo`, `Australia/Sydney`).
* **Theme-Adaptive**: Reacts dynamically to `ThemeService.isDark()` with deep obsidian dial & luminous diamond indices in dark mode, and opalescent frosted crystal & polished platinum in light mode.

#### Basic Usage Example:

```html
<!-- 1. HTML Template -->
<div class="dashboard-widget">
    <analogue-clock id="master-clock"></analogue-clock>
</div>
```

```typescript
// 2. Component Class: Configuration via Signals & @ViewChild
import { Component, ViewChild } from '@purity/core';
import '@widgets/analogue-clock/analogue-clock.component';
import type { AnalogueClockComponent } from '@widgets/analogue-clock/analogue-clock.component';

@Component({ selector: 'dashboard-view', templateUrl: './dashboard.html' })
export class DashboardViewComponent {
    @ViewChild('#master-clock')
    clock?: AnalogueClockComponent | null;

    protected onInit() {
        // Customize clock properties dynamically
        this.clock?.timezone.set('Europe/London');
        this.clock?.smoothSeconds.set(true);
        this.clock?.showNumbers.set(true);
        this.clock?.showDateBadge.set(true);
    }
```

---

### 24. 💬 Popover Component (`<popover>`, `PopoverComponent`)

Purity includes a native, anchored Popover component with smart viewport boundary collision detection, directional arrows, `<slot>` content projection, and programmatic control via `@ViewChild`:

* **Target Anchoring**: Binds to any DOM element via the `target-for` attribute (`target-for="'#my-target'"` or `target-for="#my-target"`).
* **Directional Placement**: Supports `position="top" | "bottom" | "left" | "right"` (defaults to `'bottom'`).
* **Viewport Boundary Collision Detection & Auto-Flipping**: Automatically measures target and popover bounding client rects. If the popover would exceed the viewport edge, it automatically flips between `bottom` ↔ `top` or `left` ↔ `right` and clamps within safe viewport margins.
* **Directional Specular Arrow**: Renders a 45° specular arrow indicator matching the effective applied direction.
* **Mouse Hover Interaction**: Automatically displays on target `mouseenter` and smoothly hides on `mouseleave` with a short debounced close timer allowing pointer movement onto the popover surface.
* **Direct Body Portal Attachment**: Teleports floating overlays to `document.body` at `z-index: 1050` to prevent parent `overflow: hidden` clipping.
* **Programmatic API via `@ViewChild`**: Provides `open()`, `close()`, `toggle()`, `setPosition()`, and `setTargetFor()` methods.

#### Basic Usage Example:

```html
<!-- 1. HTML Template: Anchored Popover with Slot Content -->
<div id="dom-with-popover" class="target-card">
    <span>Hover me for popover</span>
</div>

<popover target-for="'#dom-with-popover'" position="bottom">
    <h3>I am popover</h3>
    <div>Popover body content projected via slot.</div>
</popover>
```

```typescript
// 2. Component Class: Programmatic Control via @ViewChild
import { Component, ViewChild } from '@purity/core';
import '@components/popover/popover.component';
import type { PopoverComponent } from '@components/popover/popover.component';

@Component({ selector: 'my-view', templateUrl: './my-view.html' })
export class MyViewComponent {
    @ViewChild()
    private popover?: PopoverComponent | null;

    openPopover() {
        this.popover?.open('#dom-with-popover');
    }

    closePopover() {
        this.popover?.close();
    }
}
```

---

## 🛠️ DOM Utilities

Purity includes lightweight helpers for efficient DOM querying and synchronization:

| Utility | Description | Example |
|---|---|---|
| `getElement(selector, rootEl?)` | Query a single element | `const btn = getElement('.save-btn', this);` |
| `getElements(selectorsMap, rootEl?)` | Batch queries returning `Map<string, HTMLElement>` | `const map = getElements({ title: '#title' }, this);` |
| `updateTargets(elements, newValue, ifNullValue?)` | Batch update `innerHTML` | `updateTargets([displayEl], user(), 'Guest');` |
| `updateValues(elements, newValue, ifNullValue?)` | Batch update `HTMLInputElement.value` | `updateValues([inputEl], user());` |
| `updateStyles(elements, className)` | Batch update `element.className` | `updateStyles([statusEl], 'success');` |
| `eventListener(elements, event, handler)` | Attach listener with `{ dispose() }` cleanup | `const sub = eventListener([btn], 'click', handler);` |

---

## 🔄 Framework Lifecycles & Execution Phases

Purity components, directives, validators, and bootstrapping routines follow well-defined, synchronous lifecycle phases built directly on modern Web standards:

### 1. Web Component Lifecycle (`@Component`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPONENT MOUNTING PHASES                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. CONNECTED (connectedCallback)                                            │
│    ├── Captures initial nested HTML for <slot> content projection           │
│    ├── Inlines template synchronously via Vite ?raw / templateUrl / string  │
│    ├── Resolves <slot> projections (replaces with projected DOM or fallback)│
│    ├── Sanitizes strict input types (prevents browser parser warnings)      │
│    └── Mounts sanitized template into Custom Element innerHTML              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. QUERY & BINDING (bindTemplate)                                           │
│    ├── Binds @ViewChild property descriptors to getters                     │
│    ├── Structural Repeater: Parses for="let item of list" & creates scopes  │
│    ├── Text Interpolation: Splits {{ expr }} into reactive effect() nodes   │
│    ├── Directives: Instantiates matching @Directive classes (calls onInit)  │
│    ├── Validators: Attaches @Validator rules and event listeners            │
│    ├── Event Handlers: Compiles onclick/oninput to scoped functions         │
│    └── Attribute Reactivity: Tracks class and boolean attribute changes     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. USER INIT HOOK                                                           │
│    └── onInit() is executed (DOM is fully populated and reactive)           │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                              (Active Component State)
                                       │
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT UNMOUNTING PHASES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. DISCONNECTED (disconnectedCallback)                                      │
│    ├── Directives Teardown: Calls destroy() on all active directives        │
│    ├── Validators Teardown: Calls destroy() on active form validators       │
│    └── USER TEARDOWN HOOK: onDestroy() is executed                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Component Lifecycle Methods

| Hook / Method | Invocation Timing | Typical Usage |
|---|---|---|
| `constructor()` | Instantiation of the class instance | Initializing signal states and injecting DI dependencies. |
| `onInit()` | Invoked after DOM template is mounted, `<slot>` is resolved, and all bindings are active | Attaching behaviors (`drag`, `droppable`), starting intervals, making HTTP requests. |
| `onDestroy()` | Invoked when the custom element is disconnected from the DOM | Unsubscribing listeners, stopping timers, tearing down behaviors. |
| `render(html?: string)` | Programmatically replaces `innerHTML` and triggers `bindTemplate()` | Dynamic inline template re-rendering. |
| `disconnectedCallback()` | Native Custom Element unmount callback (automatically invokes `onDestroy()`) | Internal framework teardown. |

---

### 2. Custom Directive Lifecycle (`@Directive` & `BaseDirective`)

```
[Element Matched by Selector]
              │
              ▼
   1. Constructor(element, value, options)
              │
              ▼
   2. onInit() ──> Initial DOM class & attribute setup
              │
   ┌──────────┴──────────────────────────────────────┐
   │                                                 │
   ▼                                                 ▼
3. onChanges(newValue, oldValue)         4. onDOMChange(record | event)
   Triggered via effect() whenever          Triggered via MutationObserver on DOM
   dynamic [directive]="signalVal()"         mutations, or host input/change events.
   changes.                                  │
   │                                         │
   └──────────┬──────────────────────────────┘
              │
              ▼
   5. destroy() / onDestroy()
      Disconnects MutationObserver, removes event listeners, and cleans up references.
```

---

### 3. Form Validator Lifecycle (`@Validator` & `BaseValidator`)

```
[Form or Input Element Matched]
              │
              ▼
   1. Field Binding: Attaches 'input', 'blur', and 'change' listeners
              │
              ▼
   2. Evaluation Phase: Runs custom validate[FieldName]() and validateAll() rules
              │
              ▼
   3. DOM State Reflection:
      ├── Toggles CSS state classes (.is-valid, .is-invalid, .is-touched, .is-dirty)
      └── Enables or disables the submit button reactively
              │
              ▼
   4. destroy(): Unbinds all field event listeners upon component unmount
```

---

### 4. Application Bootstrapping Lifecycle (`bootstrapApplication`)

```
bootstrapApplication(RootComponent, options)
  │
  ├── 1. Environment Registration: Binds environment profile under 'ENVIRONMENT' DI token
  ├── 2. Provider Instantiation: Registers and instantiates singleton providers in DI
  ├── 3. Theme Synchronization: Initializes ThemeService from localStorage & OS preferences
  ├── 4. HTTP Pipeline Assembly: Configures interceptors: [...] inside HttpClient
  ├── 5. Root Element Mounting: Resolves <app-component> and triggers component lifecycle
  └── 6. Returns Promise<ApplicationRef> ({ destroy(), rootElement, environment })
```

---

## 📐 Best Practices & Conventions

1. **Side-Effect Imports with Path Aliases**:
   Components, directives, pipes, and validators register themselves upon module evaluation. Import them cleanly using path aliases (avoid relative `../../` paths):
   ```typescript
   import '@pages/custom/custom.component';
   import '@pages/http-sample/http-sample.component';
   import '@widgets/analogue-clock/analogue-clock.component';
   import '@directives/highlight/highlight.directive';
   import '@pipes/transform-sample.pipe';
   import '@validators/forms-validation.validator';
   ```
   For TypeScript type references, use explicit type-only imports:
   ```typescript
   import type { CustomComponent } from '@pages/custom/custom.component';
   import type { AnalogueClockComponent } from '@widgets/analogue-clock/analogue-clock.component';
   ```

2. **Clean Path Aliases (Zero `../` Relative Imports)**:
   Use path aliases across TypeScript and SCSS:
   - Framework Primitives: `@purity/core`, `@purity/*`
   - Environments: `@environments`, `@environments/*`
   - Data Layer: `@data/*`
   - Application Root: `@app/*`
   - Pages & Showcases: `@pages/*`
   - Reusable Components: `@components/*`
   - Standalone Widgets: `@widgets/*`
   - Directives: `@directives/*`
   - Pipes: `@pipes/*`
   - Validators: `@validators/*`
   - Behaviors: `@behaviors/*`
   - SCSS Design System: `@use '@styles' as *;`

3. **CSS Classes over Inline Styles**:
   All visual modifications, state changes, directives, and behaviors apply CSS classes rather than mutating `element.style` directly.

4. **Overlay & Popover Layering**:
   Modal dialogs (`<modal-view>`), radial context menus (`<radial-context-menu>`), and dropdown popovers (`<date-time-picker>`) are attached directly to `document.body` at high z-indexes (`1000` / `9999`) to prevent parent `backdrop-filter` or `transform` stacking context clipping.

5. **Component Lifecycle & Event Listener Binding**:
   - Setup DOM queries, behaviors, and event listener closures inside `protected onInit()`.
   - Clean up event listeners and behavior instances in `onDestroy()` / `disconnectedCallback()`.
   - Never initialize event listener closures in class field initializers.

6. **Strict TypeScript**:
   - The project uses strict compiler options (`"verbatimModuleSyntax": true`, `"noUnusedLocals": true`, `"erasableSyntaxOnly": true`).

---

## 🧪 Automated Testing Engine (Vitest & happy-dom)

Purity includes a dedicated unit testing setup built on top of **Vitest** and **happy-dom**, providing native Custom Elements v1 simulation, synchronous signal evaluation, decorator transpilation, and template inlining:

### Available Test Commands

| Command | Purpose |
|---|---|
| `npm test` | Executes the full test suite once (`vitest run`) |
| `npm run test:watch` | Starts Vitest in interactive watch mode for real-time TDD |
| `npm run test:detailed` | Executes `scripts/run-tests.sh` with test discovery metrics, environment verification, and per-test execution telemetry |

### Writing Component Tests

Tests are colocated directly adjacent to source files using the `*.spec.ts` naming convention:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
    let element: HTMLElement;
    let loader: LoaderComponent;

    beforeEach(() => {
        element = document.createElement('loader-component');
        document.body.appendChild(element);
        loader = element as unknown as LoaderComponent;
    });

    afterEach(() => {
        element.remove();
    });

    it('should initialize with default values', () => {
        expect(loader.isLoading()).toBe(false);
        expect(loader.message()).toBe('Loading...');
    });

    it('should update reactive state on show()', () => {
        loader.show('Fetching records...');
        expect(loader.isLoading()).toBe(true);
        expect(loader.message()).toBe('Fetching records...');
    });
});
```

---

## 📄 License

MIT License. Feel free to use, modify, and build upon Purity!
