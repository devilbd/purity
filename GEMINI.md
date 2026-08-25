# Purity Framework

## Overview

**Purity** is a lightweight, native TypeScript frontend framework built from scratch on top of modern web standards:
- **Fine-Grained Reactivity**: Built-in signal and effect system (`signal`, `effect`) with automatic dependency tracking and sub-microsecond synchronous updates.
- **Native Web Components**: Plain classes decorated with `@Component` transformed into native Custom Elements (Custom Elements v1) with synchronous template inlining, expression caching, and lifecycle management.
- **Dependency Injection**: First-class DI container with `@Injectable` decorator and `inject()` resolution.
- **HTTP Client & Interceptor Pipeline**: Full-featured HTTP service with all standard methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`), centralized class-based request/response interceptors (`@interceptors/*`), typed models (`HttpRequest`, `HttpResponse`, `HttpErrorResponse`), header/query param helpers (`HttpHeaders`, `HttpParams`), and reactive signal resource helpers (`createResource`).
- **Custom Directives**: Attribute-level reactivity and DOM augmentation with `@Directive` and `BaseDirective`.
- **Decoupled Form Validation**: Form and field validation engine with `@Validator` and `BaseValidator` utilizing CSS state classes and automatic submit button state management.
- **Transform Pipes**: Data transformation and formatting engine with `@Pipe` and `BasePipe`, supporting static arguments as well as dynamic reactive signal parameters in templates.
- **Composable Behaviors**: Modular interaction helpers (e.g. pointer-based drag & droppable with GPU acceleration, boundary constraints, and snap support) that attach seamlessly without inheritance.
- **GNOME 50 Design System & Modular SCSS Theming**: All Purity UI design, components, widgets, buttons, inputs, dropdowns, and layouts strictly adhere to **GNOME 50 Adwaita** design standards (translucent glassmorphism, refined corner radii, subtle specular borders, GNOME cubic bezier animations, and Breeze cursor hierarchy) with Dark (baseline default) and Light themes, `ThemeService`, `localStorage` persistence, and OS preference detection.
- **Zero Heavy Runtime Dependencies**: Pure TypeScript and Web APIs bundled with Vite.

---

## Project Structure

```
purity/
├── public/                      # Static assets served at root (purity_logo.png, favicon)
│   └── purity_logo.png
├── index.html                   # Application entry HTML mounting <app-component>
├── package.json                 # Project dependencies, scripts (Vite + TypeScript + Sass)
├── tsconfig.json                # Strict TypeScript configuration
├── firebase.json                # Firebase Hosting configuration (public: dist, SPA rewrites)
├── .firebaserc                  # Firebase project ID mapping
├── .env.example                 # Environment variables reference template
├── vite.config.ts               # Vite configuration & decorator / template inlining plugin
├── GEMINI.md                    # Project context & architecture guide (this file)
├── README.md                    # Public documentation
└── src/
    ├── main.ts                  # Application entry point (bootstraps root component, providers, interceptors & global style.scss)
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
    │   ├── core.ts              # Signals, effects, DOM helpers, and module re-exports
    │   ├── component.ts         # @Component decorator, custom element lifecycle, template loader, slot & pipe engine
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
    ├── data/                    # Data services and state management
    │   ├── data.service.ts      # Service layer
    │   ├── theme.service.ts     # Reactive ThemeService for Dark/Light mode & localStorage
    │   ├── notify.service.ts    # Reactive NotifyService for toast notifications (success, error, warn, info)
    │   └── firebase.ts          # Firebase configuration and Google Analytics (GA4) service
    └── app/                     # Demo / application source
        ├── app.component.html   # Root template
        ├── app.component.scss   # Root styles
        ├── app.component.ts     # Root <app-component> implementation
        ├── assets/              # Fonts (Adwaita Mono) and static assets (radial menu SVGs)
        ├── pages/               # Application pages, views & feature showcases
        │   ├── custom/          # <custom-component> with two-way signal bindings
        │   ├── analogue-clock-sample/ # <analogue-clock-sample> showcase of analogue clock configurations
        │   ├── date-time-picker-sample/ # <date-time-picker-sample> showcase of date-time-picker configurations
        │   ├── demo/            # <demo-component> live framework interactive showcase
        │   ├── directive-sample/ # <directive-sample> demonstrating directive usage
        │   ├── forms-validation/ # <forms-validation> sample form component with submit validation
        │   ├── for-sample/      # <for-sample> demonstrating structural for array repeater
        │   ├── header/          # <header-component> navigation bar with logo and theme toggle
        │   ├── http-sample/     # <http-sample> clean HTTP client showcase consuming centralized interceptors
        │   ├── intro/           # <intro-component> framework overview & code samples
        │   ├── notification-sample/ # <notification-sample> interactive showcase for toast notifications & positions
        │   ├── pipe-sample/     # <pipe-sample> demonstrating handlebars pipe transformations
        │   ├── playground/      # <playground-view> Sandpack-inspired live editor & preview (GNOME 50 / Palenight)
        │   ├── radial-context-menu-sample/ # <radial-context-menu-sample> dual-usage showcase for radial menu (Emoji & SVG)
        │   └── raw-template/    # <raw-template> dynamic inline template rendering
        └── shared/
            ├── behaviors/       # Composable DOM behaviors
            │   ├── draggable/   # Pointer-based drag interaction with boundary & snap support
            │   └── droppable/   # Drop target registration & hover/drop detection
            ├── directives/      # Reusable DOM directives (e.g. highlight)
            ├── interceptors/    # Centralized HTTP interceptor classes (@interceptors/*)
            │   ├── auth.interceptor.ts    # Centralized Bearer token auth interceptor
            │   └── logging.interceptor.ts # Centralized latency & status logging interceptor
            ├── pipes/           # Reusable transform pipes (e.g. date, transform-sample, uppercase)
            ├── validators/      # Form & field validation classes (e.g. forms-validation)
            ├── widgets/         # Rich standalone widgets
            │   └── analogue-clock/ # <analogue-clock> 2D Canvas analogue clock widget
            └── components/      # Reusable UI Web Components
                ├── date-time-picker/ # <date-time-picker> reactive date & time picker component with body teleportation
                ├── loader/      # <loader-component> reactive HTTP request loader with glassmorphism & show/hide methods
                ├── modal/       # <modal-view> dialog component with open/close/maximize & z-index: 1000
                ├── navigation-menu/ # <navigation-menu> draggable floating radial navigation menu
                ├── notification/ # <notification-component> multi-position reactive toast notifications
                └── radial-context-menu/ # <radial-context-menu> circular context menu with pie segments & submenus
```

---

## Core Framework Architecture (`src/framework/`)

### 1. Reactivity (`core.ts`)

Purity features a synchronous reactive primitives engine:

* **`signal<T>(initialValue: T): Signal<T>`**:
  Creates a reactive value container with getter syntax, `.set()`, and `.update()`.
  ```typescript
  const count = signal(0);
  console.log(count()); // Read: 0
  count.set(5);         // Write: 5
  count.update(n => n + 1); // Update: 6
  ```

* **`effect(fn: Function): void`**:
  Tracks signals accessed during execution and automatically re-runs whenever any dependent signal changes.
  ```typescript
  effect(() => {
      console.log(`Current count: ${count()}`);
  });
  ```

### 2. Web Component Model (`component.ts`)

* **`@Component(options: string | ComponentOptions)`**:
  Class decorator transforming standard TypeScript classes into native Custom Elements:
  - **`selector?: string`**: Custom element tag name (e.g. `'app-component'`). If omitted, inferred from class name in kebab-case.
  - **`templateUrl?: string`**: Path to an external HTML template. Templates are automatically inlined at build/transpile time by Vite via `?raw` imports, guaranteeing instant synchronous rendering with zero network roundtrips.
  - **`template?: string`**: Inline HTML template string or dynamic getter (`get template()`).
  - **`onInit(): void`**: Lifecycle method invoked after template elements are mounted in the DOM.
  - **`onDestroy(): void`**: Lifecycle method invoked when the component is disconnected from the DOM.
  - **`bindTemplate(root?: HTMLElement)`**: Parses and binds reactive `{{ expression }}` handlebars interpolations using cached compiled expression functions (`expressionCache`), and initializes active directives and validators. Supports dynamic standalone `<code>` and `<pre>` elements while skipping blocks marked with `[data-no-bind]`.
  - **`render(content?: string)`**: Programmatically assigns template strings directly to `innerHTML` and triggers `bindTemplate()`.
  - **`disconnectedCallback(): void`**: Native Web Component lifecycle hook for cleaning up directives, validators, and subscriptions.

* **`@ViewChild(selector?: string)` / `@ChildView`**:
  Property decorator that automatically queries and binds matching child elements or custom components. If `selector` is omitted (`@ViewChild()`), the framework implicitly infers candidate selectors from the property name in kebab-case (`<my-component>`, `#my-component`, `<my>`, `#my`). An explicit selector (e.g. `@ViewChild('#specific-id')`) is optional and only required when disambiguating between multiple instances:
  ```typescript
  @Component({ selector: 'my-component' })
  export class MyComponent {
      // Implicit selector resolution (<custom-component> / #custom-component):
      @ViewChild()
      customComponent?: CustomComponent | null;

      // Optional explicit selector for multi-instance disambiguation:
      @ViewChild('#secondChild')
      customComponent2?: CustomComponent | null;

      protected onInit() {
          this.customComponent?.customProperty.set('value');
      }
  }
  ```

* **Structural Array Repeater (`for="let obj of myArray"`)**:
  Components support declarative structural loop templates with `for="let item of items"` or `for="let obj, index of myArray"`. The engine automatically creates scoped item contexts, tracks array signals reactively, supports nested loops, and seamlessly updates on array mutations (`.update()`, `.set()`):

  ```html
  <div for="let member, index of members" class="member-card">
      <span>#{{index + 1}}: {{member.name | uppercase}}</span>
      <p>{{member.role}}</p>
      <!-- Nested loop -->
      <div class="tags">
          <span for="let tag of member.tags" class="tag-badge">{{tag}}</span>
      </div>
  </div>
  ```

* **`<slot>` Content Projection**:
  Components can define `<slot></slot>` tags in their template. Any nested HTML elements, components, or text passed into the custom element are automatically projected into the slot during initialization, while retaining reactive bindings.

  ```html
  <!-- Modal component with slot -->
  <div class="modal-body">
      <slot>Default fallback content</slot>
  </div>
  ```

### 3. Dependency Injection & State (`di.ts`, `data/`)

Purity includes a built-in Dependency Injection container with decorator support:

* **`@Injectable(name?: string | InjectableOptions)` / `@Service(name?: string)`**:
  Class decorator that registers the service into the global DI container by token name and constructor.
  ```typescript
  @Injectable('DataService')
  export class DataService {
      currentUser = signal<User | null>(null);
  }
  ```

* **`inject<T>(token: Token<T>): T`**:
  Resolves and returns the singleton instance of the requested service by its registered name or class constructor.
  ```typescript
  // Resolve by class constructor:
  const dataService = inject(DataService);

  // Or resolve by string token name:
  const dataService = inject<DataService>('DataService');
  ```

### 4. HTTP Client Service & Centralized Interceptors (`http.ts`, `src/app/shared/interceptors/`)

Purity provides a native, zero-dependency, type-safe HTTP Client service registered into DI and re-exported via `@purity/core`:

* **`HttpClient` Service Methods**:
  - `get<T>(url, options?)`: Executes HTTP GET request.
  - `post<T>(url, body?, options?)`: Executes HTTP POST request with automatic JSON payload serialization.
  - `put<T>(url, body?, options?)`: Executes HTTP PUT request.
  - `patch<T>(url, body?, options?)`: Executes HTTP PATCH request.
  - `delete<T>(url, options?)`: Executes HTTP DELETE request.
  - `head(url, options?)`: Executes HTTP HEAD request.
  - `options<T>(url, options?)`: Executes HTTP OPTIONS request.
  - `request<T>(method, url, options?)`: Core request dispatcher executing through the interceptors pipeline.
  - `createResource<T>(fetcher)`: Generates reactive signal bindings (`data`, `loading`, `error`, `status`, `refetch`).

* **Centralized HTTP Interceptors (`src/app/shared/interceptors/`)**:
  Interceptors are decoupled from UI components into centralized classes implementing `HttpInterceptor`:

  ```typescript
  // src/app/shared/interceptors/auth.interceptor.ts
  import type { HttpInterceptor, HttpRequest, HttpResponse, HttpNextFn } from '@purity/core';

  export class AuthInterceptor implements HttpInterceptor {
      async intercept(req: HttpRequest, next: HttpNextFn): Promise<HttpResponse<any>> {
          const authReq = req.clone({
              headers: req.headers.set('Authorization', 'Bearer my_token_123'),
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
          } catch (err) {
              console.error(`[HTTP Error] ${req.method} ${req.url} failed:`, err);
              throw err;
          }
      }
  }
  ```

* **Consuming `HttpClient` in Components**:
  Page components simply inject `HttpClient` and make calls that automatically flow through all registered interceptors:

  ```typescript
  @Component({ selector: 'my-page', templateUrl: './my-page.html' })
  export class MyPageComponent {
      private http = inject(HttpClient);

      async loadData() {
          const res = await this.http.get<PostItem>('https://jsonplaceholder.typicode.com/posts/1');
          console.log('Post data:', res.data);
      }
  }
  ```

### 5. Transform Pipes (`pipe.ts`)

Transform Pipes decouple data transformation and formatting logic from components and templates. They integrate directly with Handlebars template expressions (`{{ value | pipeName: arg1 : arg2 }}`), supporting static arguments as well as dynamic reactive signals that automatically re-run transformations when signals change:

* **`@Pipe(name: string | PipeOptions)` / `BasePipe` / `PipeTransform`**:
  Class decorator and base class registering a transform pipe by token name:
  ```typescript
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

### 6. Directives (`directive.ts`)

Directives attach custom behavior and reactivity to DOM elements:

* **`@Directive(selector: string | DirectiveOptions)`**:
  Class decorator that registers a directive matching an element attribute (e.g. `@Directive('highlight')` or `@Directive('[highlight]')`).
  ```typescript
  @Directive('highlight')
  export class HighlightDirective extends BaseDirective {
      onInit() {
          this.element.classList.add('p-highlight');
          this.onChanges(this.value);
      }

      onChanges(newValue: any) {
          this.element.classList.toggle('p-highlight--active', !!newValue);
      }

      onDOMChange(record: MutationRecord | Event) {
          // Detects attribute, property, or input changes on the host DOM element
      }
  }
  ```

### 7. Form Validation (`validator.ts`)

Form Validators decouple validation rules and CSS class application from UI components:

* **`@Validator(options: ValidatorOptions)`**:
  Class decorator that binds form validation rules directly to matching forms and fields.
  - **`form: string`**: Form selector (e.g. `'.forms-validation-form'`).
  - **`fields: Record<string, string | FieldValidationConfig>`**: Map of field keys to selectors or config objects.
  - **`validClass?: string`**: CSS class applied when a field/form is valid (default: `'is-valid'`).
  - **`invalidClass?: string`**: CSS class applied when a field/form is invalid (default: `'is-invalid'`).
  - **`validate[FieldName](value, element)`**: Validation method defined on the class for each field.
  - **`validateAll()`**: Method automatically provided to trigger validation across all configured fields.

### 8. Application Bootstrapping & Environment Management (`bootstrap.ts`, `environments/`)

Purity provides a first-class bootstrapping API that initializes root components, binds environment configurations into DI, registers custom providers and interceptors, automatically synchronizes themes, and manages application lifecycles:

* **`bootstrapApplication(rootComponent, options?: BootstrapOptions)`**:
  - Registers the active environment configuration under the `'ENVIRONMENT'` token.
  - Automatically initializes the theme (`ThemeService` / `localStorage` / OS preference).
  - Automatically wires `interceptors: [...]` directly into the `HttpClient` pipeline.
  - Automatically queries and mounts the root custom element.
  - Exposes debug tools on `(window as any).__PURITY_APP__` in development mode.
  - Returns a Promise resolving to `ApplicationRef` with `.destroy()`, `.rootElement`, and `.environment`.

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

### 9. Internal Telemetry & Deployment Services (`src/data/firebase.ts`)

> [!NOTE]
> Firebase and Google Analytics are used strictly as internal application infrastructure for our deployment and telemetry purposes. They must **never** be exposed in public documentation (`README.md`), user-facing UI showcases, demo pages, or intro components.

* **Internal Page View Tracking**: Tracks SPA navigation changes (`popstate`, `hashchange`).
* **Internal Event Logging**:
  ```typescript
  import { logAnalyticsEvent } from '@data/firebase';

  logAnalyticsEvent('radial_menu_select', { item: 'home', variant: 'svg' });
  ```

---

## Framework Lifecycles & Execution Phases

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

## Composable Behaviors (`src/app/shared/behaviors/`)

Behaviors enhance DOM elements without requiring complex inheritance trees:

* **Draggable (`drag`)**:
  - Pointer event capture with movement threshold (`DRAG_THRESHOLD = 3px`).
  - Container boundary constraints (`constrainTo`).
  - Handle selector support (`handle`).
  - Drop target integration & center snapping (`snapTo`).
  - GPU-accelerated transforms (`translate3d`) with zero transition drag lag.
  - Smooth animation frame scheduling via `requestAnimationFrame`.
  - Returns `{ destroy() }` for clean teardown.

* **Droppable (`droppable`)**:
  - Registers elements as valid drop zones with selector filtering (`accepts`).
  - Fast geometric bounding box collision detection without DOM layout thrashing.
  - Automatic hover detection (`hoverClass`, `onEnter`, `onLeave`, `onDrop`).
  - Returns `{ destroy() }` for unregistering.

---

## Key Conventions & Best Practices

1. **Side-Effect Imports with Path Aliases**:
   Because components, directives, pipes, and validators register themselves automatically with decorators at module evaluation time, import them as side effects using path aliases (never use relative `../../` paths):
   ```typescript
   import '@pages/custom/custom.component';
   import '@pages/http-sample/http-sample.component';
   import '@directives/highlight.directive';
   import '@pipes/transform-sample.pipe';
   import '@validators/forms-validation.validator';
   ```

2. **Clean Path Aliases (No `../` Relative Imports)**:
   All imports across TypeScript and SCSS must use path aliases rather than relative parent `../` paths:
   - Framework Primitives: `@purity/core`, `@purity/*`
   - Environments: `@environments`, `@environments/*`
   - Data Layer: `@data/*`
   - Application Root: `@app/*`
   - Pages & Showcases: `@pages/*`
   - Reusable Components: `@components/*`
   - Centralized Interceptors: `@interceptors/*`
   - Directives: `@directives/*`
   - Pipes: `@pipes/*`
   - Validators: `@validators/*`
   - Behaviors: `@behaviors/*`
   - SCSS Design System: `@use '@styles' as *;`

3. **CSS Classes over Inline Styles**:
   All visual modifications, state changes, directives, and behaviors must apply CSS classes rather than mutating `element.style` directly.

4. **Declarative Component Rendering & Event Context**:
   - All components are defined via `@Component` / `defineComponent` and declared directly in templates.
   - Event handlers (`onclick`, `oninput`, `onchange`, etc.) automatically evaluate within the component/item instance context. Never expose components or services to `window` or mutate `document.body` manually inside lifecycle hooks.
   - Overlays (e.g. `<modal-view>`, `<notification-component>`, `<date-time-picker>`) use `position: fixed` with proper z-indexes (`1000` / `9999` / `10000`) for viewport-wide display without manual DOM detaching/re-parenting.

5. **Component Lifecycle & Closure Binding**:
   - Setup DOM queries, behaviors, and event listener closures inside `protected onInit()`.
   - Clean up event listeners, behaviors, or timers inside `onDestroy()` / `disconnectedCallback()`.
   - Never initialize event listener closures in class field initializers.

6. **Layout, Spacing & Sizing Standards**:
   To maintain visual rhythm, consistent sizing, and pixel-perfect alignment across all current and future views, components, widgets, and sections:
   - **Page Container Width**: `.app-component-root` is constrained to `max-width: var(--header-max-width, 1366px); margin: 0 auto; width: 100%; box-sizing: border-box;`.
   - **Top-Level Section Spacing**: The root container uses `display: flex; flex-direction: column; gap: var(--spacing-lg, 16px);`.
   - **Top-Level Custom Elements**: All page-level custom elements (`<header-component>`, `<intro-component>`, `<playground-view>`, `<demo-component>`, `<footer-component>`) must be `display: block; width: 100%; margin: 0; box-sizing: border-box;`. Their internal `.window` or root wrappers must have `margin: 0; width: 100%;` so vertical spacing is governed exclusively by the parent flex `gap`.
   - **Top-Level Window Padding & Border Radii**:
     - Content Views (`intro`, `demo`, `playground`): `padding: 24px; border-radius: var(--radius-window, 16px);`.
     - Navigation & Status Bars (`header`, `footer`): `padding: 18px 24px; border-radius: var(--radius-window, 16px);`.
   - **Sub-Section Cards & Sample Showcases**:
     - Container: `display: flex; flex-direction: column; gap: var(--spacing-lg, 16px);` (or CSS grid with `gap: 16px`).
     - Sub-Card Outer Margins: `margin: 0;` (never use ad-hoc `margin-top` / `margin-bottom` on individual cards).
     - Sub-Card Padding: `padding: 18px 20px;` (or `padding: 16px 18px;`).
     - Sub-Card Border Radius: `border-radius: var(--radius-window, 12px);` or `border-radius: var(--radius-card, 12px);`.
   - **Controls & Micro-Elements**:
     - Buttons & Inputs: `border-radius: var(--radius-control, 8px); padding: 10px 16px;`.
     - Pills & Badges: `border-radius: var(--radius-pill, 999px); padding: 2px 7px;` (or `3px 10px;`).
     - Control Groups / Toolbars: `display: flex; gap: 8px` to `12px; align-items: center;`.

7. **GNOME 50 Adwaita Design Language Mandate**:
   Every visual element, page, view, component, widget, and interactive control in Purity MUST strictly adhere to the **GNOME 50 Adwaita** design language:
   - **Glassmorphic Surfaces**: Translucent window backgrounds using `var(--gnome-surface)`, frosted blur filters (`var(--blur-effect)`, `var(--blur-subtle)`), and hairline specular borders (`var(--gnome-border)`, `var(--gnome-border-subtle)`).
   - **Rounded Geometry Hierarchy**:
     - Top-level windows and modals: `border-radius: var(--radius-window, 16px);`.
     - Inner cards, dialog panels, and sample containers: `border-radius: var(--radius-card, 12px);`.
     - Controls (buttons, inputs, selects, segmented toggles): `border-radius: var(--radius-control, 8px);`.
     - Badges, pills, tags, chips: `border-radius: var(--radius-pill, 999px);`.
   - **Buttons & Interactive Elements**:
     - Primary action buttons (`.button-primary`): Elevated gradient `var(--accent)`, subtle top inset highlight (`inset 0 1px rgba(255, 255, 255, 0.15)`), active press feedback (`inset 0 2px 4px rgba(0, 0, 0, 0.25)`), and hover lift (`translateY(-1px)`).
     - Secondary/surface buttons (`.button-secondary`): `background: var(--gnome-card)`, `border: 1px solid var(--gnome-border)`, GNOME hover lift.
     - Inputs & Selects (`.input-primary`): Inset depth shadow (`inset 0 1px 2px rgba(0, 0, 0, 0.1)`), custom SVG arrow indicators, and standard 3px accent focus ring (`0 0 0 3px var(--accent-shadow)`).
   - **Motion & Physics**: Transitions must use GNOME cubic-bezier easing (`var(--ease-gnome) = cubic-bezier(0.25, 0.8, 0.25, 1)`) and spring curves (`var(--ease-spring) = cubic-bezier(0.34, 1.56, 0.64, 1)`).
   - **Dual Theme Fidelity**: Full parity across Dark (baseline GNOME Adwaita obsidian) and Light (frosted alabaster) themes.

8. **TypeScript Configuration**:
   - The project uses strict TypeScript settings: `"verbatimModuleSyntax": true`, `"noUnusedLocals": true`, `"erasableSyntaxOnly": true`.

---

## Development Workflows

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server with HMR |
| `npm run build` | Runs TypeScript compiler (`tsc`) and Vite production bundle |
| `npm run build:dev` | Runs TypeScript compiler (`tsc`) and Vite development bundle |
| `npm run build:prod` | Runs TypeScript compiler (`tsc`) and Vite production bundle |
| `npm run preview` | Previews the production build locally |
| `npm run deploy` | Builds the app with production profile and deploys to Firebase Hosting |
| `npm run deploy:hosting` | Builds the app with production profile and deploys only to Firebase Hosting |
