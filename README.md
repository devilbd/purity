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
  <img src="https://img.shields.io/badge/Firebase-Hosting-FFCA28?logo=firebase" alt="Firebase Hosting" />
  <img src="https://img.shields.io/badge/Dependencies-Zero_Runtime-brightgreen" alt="Zero Dependencies" />
</p>

---

## 📖 Overview

**Purity** is a minimalist, modern frontend framework built from scratch on top of web standards. It avoids the overhead of virtual DOM reconciliation by combining **fine-grained reactive signals** with standard **Custom Elements v1**, a lightweight **Dependency Injection** container, a native **HTTP Client & Interceptor Engine**, **Transform Pipes**, **Decoupled Form Validation**, and **Composable DOM Behaviors**.

### Key Highlights

- ⚡ **Zero Heavy Runtime Dependencies**: Pure TypeScript and Web APIs bundled with Vite.
- 🔄 **Fine-Grained Reactivity**: Synchronous `signal` and `effect` primitives with automated dependency tracking.
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
- 📅 **Date & Time Picker System (`<date-time-picker>`)**: Modern reactive calendar & 24h scrollable time picker in GNOME 50 Adwaita aesthetic, featuring smart viewport auto-placement, body teleportation at `z-index: 9999`, year submenu, date restrictions, glassmorphic blur, and `@Pipe('date')` integration.
- 🎯 **Radial Context Menu (`<radial-context-menu>`)**: Glassmorphic circular context menu with dual representation usages (Unicode Emojis or Lucide SVG vector assets), dynamic polygon pie slices, multi-level nested submenus, center button navigation, real-time telemetry state signals, and single-source-of-truth right-click context menu delegation via `setSelector()`.
- 🪟 **Modal Dialog System (`<modal-view>`)**: Reusable dialogs with `open()`, `close()`, `maximize()`, `position: absolute`, and `document.body` prepending with `z-index: 1000`.
- 🎮 **Interactive Sandpack Playground (`<playground-view>`)**: Split-pane live code editor (GNOME 50 / Palenight styling) for TypeScript, HTML, and SCSS with instant in-browser compilation and execution.
- 🚀 **Application Bootstrapping & Environment Profiles**: Clean `bootstrapApplication()` API with DI integration and separate build environment files (`environment.ts`, `environment.prod.ts`) swapped seamlessly by Vite.
- 🔥 **Firebase & Google Analytics 4 (GA4)**: Built-in zero-dependency GA4 analytics engine with automatic page view monitoring, typed event logging, and Firebase Console integration.
- 🎨 **GNOME Adwaita Design**: Modern, translucent glassmorphic design system built with SCSS.
- 🚀 **Firebase Hosting Ready**: Built-in Firebase configuration and single-command deployment (`npm run deploy`).

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
| `npm run preview` | Serves the production build locally for testing |
| `npm run deploy` | Builds production bundle and deploys to Firebase Hosting |
| `npm run deploy:hosting` | Builds production bundle and deploys only to Firebase Hosting |

---

## 🏛️ Project Structure

```
purity/
├── public/                      # Static assets served at root (purity_logo.png, favicon)
│   └── purity_logo.png
├── index.html                   # HTML entry point mounting <app-component>
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # Strict TypeScript configuration
├── firebase.json                # Firebase Hosting configuration (public: dist, SPA rewrites)
├── .firebaserc                  # Firebase project ID mapping
├── .env.example                 # Environment variables reference template
├── vite.config.ts               # Vite configuration & decorator / template inlining plugin
├── README.md                    # Project documentation (this file)
├── GEMINI.md                    # Agent context & architecture reference
└── src/
    ├── main.ts                  # Application entry point (bootstraps root component & imports global style.scss)
    ├── style.scss               # Master global stylesheet importing modular design system
    ├── styles/                  # Modular SCSS architecture & Theme Engine
    │   ├── _variables.scss      # Global non-theme variables (radii, typography, spacing, transitions, blur filters)
    │   ├── _mixins.scss         # SCSS mixins (glassmorphism, flex, button lifts, scrollbars)
    │   ├── _theme-dark.scss     # GNOME Adwaita Dark theme tokens (baseline default)
    │   ├── _theme-light.scss    # GNOME Adwaita Light theme tokens
    │   ├── _themes.scss         # Theme loader (binds :root, html, body & [data-theme='dark'|'light'])
    │   ├── _base.scss           # Base typography, body, window, buttons, code blocks, and inputs
    │   └── index.scss           # Barrel export for @use '@styles' as *;
    ├── framework/               # Core framework modules
    │   ├── core.ts              # Signals, effects, DOM utilities, and module re-exports
    │   ├── component.ts         # @Component, @ViewChild, lifecycle, template inliner, slot & pipe engine
    │   ├── di.ts                # Dependency Injection container and @Injectable decorator
    │   ├── bootstrap.ts         # bootstrapApplication entry, providers, and environment tokens
    │   ├── http.ts              # HttpClient service, HttpInterceptor pipeline, HttpHeaders, HttpParams, and resources
    │   ├── pipe.ts              # @Pipe decorator, BasePipe, PipeTransform, pipe registry
    │   ├── directive.ts         # @Directive decorator, BaseDirective, DOM mutation tracking
    │   ├── validator.ts         # @Validator decorator, BaseValidator, form/field validation
    │   └── common.ts            # Shared framework exports
    ├── environments/            # Build configuration & environment profiles
    │   ├── environment.interface.ts # Environment configuration contract
    │   ├── environment.ts       # Development environment (default)
    │   └── environment.prod.ts  # Production environment (swapped on build)
    ├── data/                    # Data services, Theme & Firebase configuration
    │   ├── data.service.ts      # Service layer
    │   ├── theme.service.ts     # Reactive ThemeService for Dark/Light mode & localStorage
    │   └── firebase.ts          # Firebase config & Google Analytics (GA4) service
    └── app/                     # Sample application & showcases
        ├── app.component.html   # Root template
        ├── app.component.scss   # Root styling
        ├── app.component.ts     # Root <app-component> class
        ├── assets/              # Fonts (Adwaita Mono) and static assets (radial menu SVGs)
        ├── pages/               # Application pages, views & feature showcases (header, intro, playground, demo, http-sample, date-time-picker-sample, radial-context-menu-sample, custom, directive-sample, forms-validation, for-sample, pipe-sample, raw-template)
        └── shared/
            ├── behaviors/       # Composable DOM behaviors (draggable, droppable)
            ├── directives/      # Reusable DOM directives (highlight)
            ├── pipes/           # Reusable transform pipes (date, transform-sample, uppercase)
            ├── validators/      # Form & field validation classes (forms-validation)
            └── components/      # Reusable UI Web Components (modal, loader, date-time-picker, radial-context-menu)
```

---

## 💻 Core Framework Architecture & Primitives

### 1. 🔄 Fine-Grained Reactive Signals & Effects (`core.ts`)

Purity features a synchronous reactivity engine with automated dependency tracking and sub-microsecond updates:

```typescript
import { signal, effect } from '@purity/core';

// 1. Create typed reactive signals
const count = signal<number>(0);
const multiplier = signal<number>(2);

// 2. Read value via getter call
console.log(count()); // 0

// 3. Mutate value with .set() or computed .update()
count.set(10);
count.update(n => n + 1); // 11

// 4. Effects automatically register signal dependencies and re-run on changes
effect(() => {
    const total = count() * multiplier();
    console.log(`Calculated total: ${total} (count: ${count()})`);
});
```

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

---

### 4. 🌓 Modular SCSS Theming & ThemeService (`theme.service.ts`)

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

### 9. 🚀 Application Bootstrapping & Environment Profiles (`bootstrap.ts`, `environments/`)

Purity provides a clean `bootstrapApplication()` initialization API that binds environment profiles, registers custom service providers, and mounts root Web Components:

```typescript
import './style.scss';
import { bootstrapApplication } from '@purity/core';
import { AppComponent } from '@app/app.component';
import { environment } from '@environments/environment';
import { FirebaseService, initGoogleAnalytics } from '@data/firebase';
import { ThemeService } from '@data/theme.service';
import { LoggingInterceptor } from '@interceptors/logging.interceptor';
import { AuthInterceptor } from '@interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
    environment,
    providers: [FirebaseService, ThemeService],
    interceptors: [LoggingInterceptor, AuthInterceptor],
}).then(() => {
    initGoogleAnalytics();
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

### 10. 🧩 Native Web Components (`@Component` Decorator)

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

### 11. 🔍 Child View & Component Queries (`@ViewChild`)

Use the `@ViewChild(selector)` decorator to query child DOM elements and child components with fallback resolution for teleported or body-prepended elements:

```typescript
import { Component, ViewChild, signal } from '@purity/core';
import type { CustomComponent } from '@pages/custom/custom.component';
import type { ModalViewComponent } from '@components/modal/modal-view.component';

@Component({
    selector: 'demo-component',
    templateUrl: './demo.component.html',
})
export class DemoComponent {
    // Automatically query child elements / components
    @ViewChild('#component1')
    customComponent1?: CustomComponent | null;

    @ViewChild('#demo-modal')
    modalView?: ModalViewComponent | null;

    onTriggerChild() {
        // Clean property access without manual querySelector boilerplate
        this.customComponent1?.customProperty.set('Updated by parent');
        this.modalView?.open({ title: 'Queried Modal' });
    }
}
```

---

### 12. 📄 Handlebars Template Interpolation & Pipes (`{{ expression | pipe }}`)

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

### 13. 🔁 Structural Array Repeater (`for="let obj of myArray"`)

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

### 14. 📦 Generic Components & Content Projection (`<slot>`)

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

### 15. 🪟 Modal Dialogs (`<modal-view>`)

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

### 16. 📅 Date & Time Picker Component (`<date-time-picker>`) & Date Pipe (`date`)

Purity includes a full-featured, reactive Date & Time Picker custom element styled in GNOME 50 Adwaita Dark and Light aesthetics with glassmorphic blur effects, body overlay teleportation, and smart viewport-aware auto-placement:

- **Reactivity & Signals**: State (`selectedDate`, `isOpen`, `viewDate`, `workingHours`, `workingMinutes`, `restrictions`, `enableBlur`) driven by fine-grained Purity signals.
- **Direct Body Overlay Teleportation**: Dropdown overlay automatically attaches directly to `document.body` at `z-index: 9999`, rendering cleanly above all other cards, stacking contexts, and radial menus without clipping.
- **Smart Viewport Auto-Placement**: Automatically measures available screen headroom and footroom to flip the popup above (`placement-top`) or below (`placement-bottom`) the trigger button, with horizontal auto-alignment and window scroll tracking.
- **Year Navigation Submenu**: Fast multi-year scrollable selector overlay with smooth animated chevron toggle.
- **24-Hour Time Capsule**: Dual numeric hours & minutes input supporting text entry, key navigation, and mouse-wheel scrolling (`handleWheel`).
- **Date & Time Restrictions**: Configurable boundaries via `DateRestriction` (`futureOnly`, `pastOnly`, `minDate`, `maxDate`, `daysBack`, `daysForward`, `minTime`, `maxTime`, `disabledDates`).
- **DatePipe Formatting**: Built-in `@Pipe('date')` transform pipe for flexible Handlebars date expressions (`{{ myDate() | date: 'EEEE, MMMM d, yyyy HH:mm' }}`).

---

### 17. 🎯 Radial Context Menu System (`<radial-context-menu>`)

Purity provides a native circular radial context menu component with glassmorphic GNOME Adwaita styling, dynamic polygon segment calculation, recursive multi-level submenus, center button breadcrumb navigation, real-time telemetry state signals, and single-source-of-truth right-click delegation via `setSelector()`:

* **Dynamic Pie Slices**: Automatically computes mathematical polygon clip paths (`innerDist = 26%`, `outerDist = 49.5%`) for any number of menu items.
* **Multi-Level Navigation**: Push/pop navigation stack for nested `children` submenus with smooth zoom/fade animations.
* **Viewport Boundaries**: Clamps menu coordinates so radial menus never overflow outside the viewport.
* **Dual Icon Representations**: Supports both Unicode Emojis and inlined Lucide SVG vector icons (`home.svg`, `edit.svg`, `search.svg`, `settings.svg`, `share.svg`, `user.svg` in `src/app/assets/radial-context-menu/`) with theme-adaptive stroke styling.
* **Direct Body Attachment**: Renders directly on `document.body` at `z-index: 9999`, immune to parent stacking contexts.
* **Center Navigation**: Displays back arrow `←` during nested navigation, close `×` at root, and shows active hovered segment names in real time.
* **Clean Context Menu Delegation**: Set trigger zones with `setSelector('.interactive-zone')`. The component automatically listens for right-clicks matching the selector and opens at cursor coordinates without conflicting duplicate event handlers.

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

## 📐 Best Practices & Conventions

1. **Side-Effect Imports with Path Aliases**:
   Components, directives, pipes, and validators register themselves upon module evaluation. Import them cleanly using path aliases (avoid relative `../../` paths):
   ```typescript
   import '@pages/custom/custom.component';
   import '@pages/http-sample/http-sample.component';
   import '@directives/highlight.directive';
   import '@pipes/transform-sample.pipe';
   import '@validators/forms-validation.validator';
   ```
   For TypeScript type references, use explicit type-only imports:
   ```typescript
   import type { CustomComponent } from '@pages/custom/custom.component';
   ```

2. **Clean Path Aliases (Zero `../` Relative Imports)**:
   Use path aliases across TypeScript and SCSS:
   - Framework Primitives: `@purity/core`, `@purity/*`
   - Environments: `@environments`, `@environments/*`
   - Data Layer: `@data/*`
   - Application Root: `@app/*`
   - Pages & Showcases: `@pages/*`
   - Reusable Components: `@components/*`
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

## 🔥 Firebase & Google Analytics (GA4) Integration

Purity includes a built-in, zero-dependency Google Analytics 4 (GA4) and Firebase Analytics service in [`src/data/firebase.ts`](file:///run/media/devilbd/d/Development/purity/src/data/firebase.ts):

* **Automatic Script Injection**: Injects `https://www.googletagmanager.com/gtag/js` asynchronously at startup when `VITE_FIREBASE_MEASUREMENT_ID` is present.
* **Automatic Page Views**: Automatically logs page views on application bootstrap and monitors SPA URL changes (`popstate`, `hashchange`).
* **Typed Custom Event Logging**:
  ```typescript
  import { logAnalyticsEvent } from '@data/firebase';

  logAnalyticsEvent('radial_menu_select', { item: 'home', variant: 'svg' });
  ```
* **Dependency Injection**:
  ```typescript
  import { inject } from '@purity/core';
  import { FirebaseService } from '@data/firebase';

  const firebase = inject(FirebaseService);
  firebase.logEvent('button_clicked', { button_id: 'open-menu' });
  ```

---

## 📄 License

MIT License. Feel free to use, modify, and build upon Purity!
