# Purity Framework

## Overview

**Purity** is a lightweight, native TypeScript frontend framework built from scratch on top of modern web standards:
- **Fine-Grained Reactivity**: Built-in signal and effect system (`signal`, `effect`) with automatic dependency tracking.
- **Native Web Components**: Plain classes decorated with `@Component` transformed into native Custom Elements (Custom Elements v1) with synchronous template inlining, expression caching, and lifecycle management.
- **Dependency Injection**: First-class DI container with `@Injectable` decorator and `inject()` resolution.
- **Custom Directives**: Attribute-level reactivity and DOM augmentation with `@Directive` and `BaseDirective`.
- **Decoupled Form Validation**: Form and field validation engine with `@Validator` and `BaseValidator` utilizing CSS state classes and automatic submit button state management.
- **Composable Behaviors**: Modular interaction helpers (e.g. pointer-based drag & droppable with GPU acceleration, boundary constraints, and snap support) that attach seamlessly without inheritance.
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
    ├── main.ts                  # Application entry point (registers root components)
    ├── style.scss               # Global styles & GNOME Adwaita-inspired design system
    ├── framework/               # Core framework modules
    │   ├── core.ts              # Signals, effects, DOM helpers, and module re-exports
    │   ├── component.ts         # @Component decorator, custom element lifecycle, template loader, slot & pipe engine
    │   ├── di.ts                # Dependency Injection container and @Injectable decorator
    │   ├── bootstrap.ts         # bootstrapApplication entry, providers, and environment tokens
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
    │   └── firebase.ts          # Firebase configuration and service
    └── app/                     # Demo / application source
        ├── app.component.html   # Root template
        ├── app.component.scss   # Root styles
        ├── app.component.ts     # Root <app-component> implementation
        ├── assets/              # Fonts (Adwaita Mono) and static assets
        ├── pages/               # Application pages, views & feature showcases
        │   ├── custom/          # <custom-component> with two-way signal bindings
        │   ├── date-time-picker-sample/ # <date-time-picker-sample> showcase of date-time-picker configurations
        │   ├── demo/            # <demo-component> live framework interactive showcase
        │   ├── directive-sample/ # <directive-sample> demonstrating directive usage
        │   ├── forms-validation/ # <forms-validation> sample form component with submit validation
        │   ├── for-sample/      # <for-sample> demonstrating structural for array repeater
        │   ├── intro/           # <intro-component> framework overview & code samples
        │   ├── pipe-sample/     # <pipe-sample> demonstrating handlebars pipe transformations
        │   ├── playground/      # <playground-view> Sandpack-inspired live editor & preview (GNOME 50 / Palenight)
        │   └── raw-template/    # <raw-template> dynamic inline template rendering
        └── shared/
            ├── behaviors/       # Composable DOM behaviors
            │   ├── draggable/   # Pointer-based drag interaction with boundary & snap support
            │   └── droppable/   # Drop target registration & hover/drop detection
            ├── directives/      # Reusable DOM directives (e.g. highlight)
            ├── pipes/           # Reusable transform pipes (e.g. date, transform-sample, uppercase)
            ├── validators/      # Form & field validation classes (e.g. forms-validation)
            └── components/      # Reusable UI Web Components
                ├── date-time-picker/ # <date-time-picker> reactive date & time picker component
                ├── header/      # <header-component> navigation bar with logo
                └── modal/       # <modal-view> dialog component with open/close/maximize & z-index: 1000
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
  - **`bindTemplate(root?: HTMLElement)`**: Parses and binds reactive `{{ expression }}` handlebars interpolations using cached compiled expression functions (`expressionCache`), and initializes active directives and validators.
  - **`render(content?: string)`**: Programmatically assigns template strings directly to `innerHTML` and triggers `bindTemplate()`.
  - **`disconnectedCallback(): void`**: Native Web Component lifecycle hook for cleaning up directives, validators, and subscriptions.

* **`@ViewChild(selector: string)`**:
  Property decorator that automatically queries and binds matching child elements or custom components by CSS selector (with fallback resolution across teleported / body-prepended elements):
  ```typescript
  @Component({ selector: 'my-component' })
  export class MyComponent {
      @ViewChild('#childComponent')
      childComponent?: CustomComponent | null;

      protected onInit() {
          this.childComponent?.customProperty.set('value');
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

  ```typescript
  @Component({
      selector: 'my-component',
      templateUrl: './src/app/my-component.html',
  })
  export class MyComponent {
      count = signal(0);

      protected onInit() {
          // Initialize signals, behaviors, effects
      }
  }
  ```

### 3. DOM Utilities (`core.ts`)

Helper functions for declarative DOM updates:
* `getElement(selector, rootEl?)`: Query selector returning `HTMLElement | null`.
* `getElements(selectorsRecord, rootEl?)`: Batch query selector returning a `Map<string, HTMLElement>`.
* `updateTargets(elements, newValue, ifNullValue?)`: Updates `innerHTML` across an array of target elements.
* `updateValues(elements, newValue, ifNullValue?)`: Updates `.value` on `HTMLInputElement` arrays.
* `updateStyles(elements, className)`: Sets `className` across target elements.
* `eventListener(elements, event, handler)`: Attaches event listeners and returns a `{ dispose() }` handle.

### 4. Dependency Injection (`di.ts`)

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

* **Handlebars Pipe Usage**:
  ```html
  <!-- Static arguments -->
  <div>{{ count() | myTransformPipe: true }}</div>

  <!-- Dynamic reactive signal arguments -->
  <div>{{ user() | myTransformPipe: isVipSignal() : 'VIP' }}</div>

  <!-- Chained pipes -->
  <div>{{ total() | currency: '$' : 2 | bold }}</div>
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
  - **Form State & Submit Buttons**: Automatically tracks field mutations, manages form CSS classes (`is-valid` / `is-invalid`), and toggles submit button `disabled` states and `.disabled` class.

  ```typescript
  @Validator({
      form: '.forms-validation-form',
      fields: {
          input1: '#input1',
          input2: '#input2',
      },
      validClass: 'is-valid',
      invalidClass: 'is-invalid',
  })
  export class FormsValidationValidator extends BaseValidator {
      validateInput1(value: string): boolean {
          return value.trim().length >= 3;
      }

      validateInput2(value: string): boolean {
          return value.trim().length >= 5;
      }
  }
  ```

### 8. Application Bootstrapping & Environment Management (`bootstrap.ts`, `environments/`)

Purity provides a first-class bootstrapping API that initializes root components, binds environment configurations into DI, registers custom providers, and manages application lifecycles:

* **`bootstrapApplication(rootComponent, options?: BootstrapOptions)`**:
  - Registers the active environment configuration under the `'ENVIRONMENT'` token.
  - Automatically queries and mounts the root custom element.
  - Exposes debug tools on `(window as any).__PURITY_APP__` in development mode.
  - Returns a Promise resolving to `ApplicationRef` with `.destroy()`, `.rootElement`, and `.environment`.

  ```typescript
  import { bootstrapApplication } from '@purity/core';
  import { AppComponent } from './app/app.component';
  import { environment } from './environments/environment';

  bootstrapApplication(AppComponent, {
      environment,
      providers: [
          // Custom providers or singleton services
      ],
  }).catch((err) => {
      console.error('Failed to bootstrap Purity application:', err);
  });
  ```

* **Environment Swapping for Different Builds**:
  - `src/environments/environment.ts` for development (`production: false`, debug logging enabled).
  - `src/environments/environment.prod.ts` for production builds (`production: true`).
  - Swapped automatically at compile/build time via Vite depending on `--mode production` (`npm run build:prod`) or `--mode development` (`npm run build:dev`).

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
  - CSS state classes (`.draggable-target`, `.is-dragging`, `.snap-hit`).
  - Returns `{ destroy() }` for clean teardown.

* **Droppable (`droppable`)**:
  - Registers elements as valid drop zones with selector filtering (`accepts`).
  - Fast geometric bounding box collision detection without DOM layout thrashing.
  - Automatic hover detection (`hoverClass`, `onEnter`, `onLeave`, `onDrop`).
  - Returns `{ destroy() }` for unregistering.

---

## Key Conventions & Best Practices

1. **Side-Effect Imports for Custom Elements, Directives, Pipes, and Validators**:
   Because components, directives, pipes, and validators register themselves automatically with decorators at module evaluation time, import them as side effects:
   ```typescript
   import './shared/components/custom/custom.component';
   import './shared/directives/highlight.directive';
   import './shared/pipes/transform-sample.pipe';
   import './shared/validators/forms-validation.validator';
   ```
   If referencing types for TypeScript typings, use explicit type-only imports:
   ```typescript
   import type { CustomComponent } from './shared/components/custom/custom.component';
   ```

2. **Use `@purity/core` Path Alias**:
   All framework imports should use the `@purity/core` alias rather than relative `../../` paths:
   ```typescript
   import { Component, signal, effect, ViewChild, inject, Pipe, BasePipe } from '@purity/core';
   ```

3. **CSS Classes over Inline Styles**:
   All visual modifications, state changes, directives, and behaviors must apply CSS classes (e.g. `.p-highlight`, `.is-valid`, `.is-dragging`, `.button-primary`, `.button-secondary`, `.button-cancel`) rather than mutating `element.style` directly.

4. **Modal Dialog Positioning**:
   Modal dialogs and backdrop overlays must use **`position: absolute`** (never `position: fixed`) relative to `document.body` (`body { position: relative; }`), automatically prepend to `document.body` on initialization, and sit at `z-index: 1000`.

5. **Component Lifecycle & Memory Management**:
   - Setup DOM queries and behaviors inside `protected onInit()`.
   - Clean up event listeners, behaviors, or timers inside `onDestroy()` / `disconnectedCallback()`.

6. **Reactivity inside Components**:
   - Use declarative `{{ expression }}` template interpolations in HTML templates for fine-grained reactive updates.
   - Use `effect(() => { ... })` for custom side effects when needed.

7. **TypeScript Configuration**:
   - The project uses strict TypeScript settings: `"verbatimModuleSyntax": true`, `"noUnusedLocals": true`, `"erasableSyntaxOnly": true`.
   - Avoid unused variable declarations and make imports type-explicit where appropriate.

---

## Development Workflows

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server with HMR |
| `npm run build` | Runs TypeScript compiler (`tsc`) and Vite production bundle |
| `npm run preview` | Previews the production build locally |
| `npm run deploy` | Builds the app and deploys to Firebase Hosting |
| `npm run deploy:hosting` | Builds the app and deploys only to Firebase Hosting |

### Adding New Features

* **New Framework Features**: Place core abstractions (e.g. state management, routing, template parsers) in `src/framework/`.
* **New UI Components**: Place custom elements in `src/app/shared/components/<component-name>/` with their corresponding `.ts`, `.html`, and `.scss` files, decorated with `@Component(...)`.
* **New Directives**: Place custom directives in `src/app/shared/directives/` decorated with `@Directive(...)` extending `BaseDirective`.
* **New Pipes**: Place custom transform pipes in `src/app/shared/pipes/` decorated with `@Pipe(...)` extending `BasePipe`.
* **New Validators**: Place form validation rules in `src/app/shared/validators/` decorated with `@Validator(...)` extending `BaseValidator`.
* **New Behaviors**: Place modular interaction helpers in `src/app/shared/behaviors/<behavior-name>/`.
