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
    │   ├── component.ts         # @Component decorator, custom element lifecycle, template loader
    │   ├── di.ts                # Dependency Injection container and @Injectable decorator
    │   ├── directive.ts         # @Directive decorator, BaseDirective, DOM mutation tracking
    │   ├── validator.ts         # @Validator decorator, BaseValidator, form/field validation
    │   └── common.ts            # Shared framework exports
    ├── data/                    # Data services and state management
    │   ├── data.service.ts      # Service layer
    │   └── firebase.ts          # Firebase configuration and service
    └── app/                     # Demo / application source
        ├── app.component.html   # Root template
        ├── app.component.scss   # Root styles
        ├── app.component.ts     # Root <app-component> implementation
        ├── assets/              # Fonts (Adwaita Mono) and static assets
        └── shared/
            ├── behaviors/       # Composable DOM behaviors
            │   ├── draggable/   # Pointer-based drag interaction with boundary & snap support
            │   └── droppable/   # Drop target registration & hover/drop detection
            ├── directives/      # Reusable DOM directives (e.g. highlight)
            ├── validators/      # Form & field validation classes (e.g. forms-validation)
            └── components/      # UI Web Components
                ├── custom/      # <custom-component> with two-way signal bindings
                ├── directive-sample/ # <directive-sample> demonstrating directive usage
                ├── forms-validation/ # <forms-validation> sample form component with submit validation
                ├── header/      # <header-component> navigation bar with logo
                ├── intro/       # <intro-component> framework overview & code samples
                ├── modal/       # Modal dialog components
                └── raw-template/# <raw-template> dynamic inline template rendering
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

### 5. Directives (`directive.ts`)

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

### 6. Form Validation (`validator.ts`)

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

1. **Side-Effect Imports for Custom Elements, Directives, and Validators**:
   Because components, directives, and validators register themselves automatically with decorators at module evaluation time, import them as side effects:
   ```typescript
   import './shared/components/custom/custom.component';
   import './shared/directives/highlight.directive';
   import './shared/validators/forms-validation.validator';
   ```
   If referencing types for TypeScript typings, use explicit type-only imports:
   ```typescript
   import type { CustomComponent } from './shared/components/custom/custom.component';
   ```

2. **CSS Classes over Inline Styles**:
   All visual modifications, state changes, directives, and behaviors must apply CSS classes (e.g. `.p-highlight`, `.is-valid`, `.is-dragging`) rather than mutating `element.style` directly.

3. **Component Lifecycle & Memory Management**:
   - Setup DOM queries and behaviors inside `protected onInit()`.
   - Clean up event listeners, behaviors, or timers inside `onDestroy()` / `disconnectedCallback()`.

4. **Reactivity inside Components**:
   - Use declarative `{{ expression }}` template interpolations in HTML templates for fine-grained reactive updates.
   - Use `effect(() => { ... })` for custom side effects when needed.

5. **TypeScript Configuration**:
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
* **New Validators**: Place form validation rules in `src/app/shared/validators/` decorated with `@Validator(...)` extending `BaseValidator`.
* **New Behaviors**: Place modular interaction helpers in `src/app/shared/behaviors/<behavior-name>/`.
