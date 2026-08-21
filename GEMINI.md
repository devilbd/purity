# Purity Framework

## Overview

**Purity** is a lightweight, native TypeScript frontend framework built from scratch on top of modern web standards:
- **Fine-Grained Reactivity**: Built-in signal and effect system (`signal`, `effect`).
- **Native Web Components**: Components extend native `HTMLElement` (Custom Elements v1) with asynchronous template resolution, caching, and lifecycle management.
- **Composable Behaviors**: Modular interaction modules (e.g., drag and drop) that attach seamlessly to DOM elements.
- **Zero Heavy Runtime Dependencies**: Pure TypeScript and Web APIs bundled with Vite.

---

## Project Structure

```
purity/
├── index.html                   # Application entry HTML mounting <app-component>
├── package.json                 # Project dependencies, scripts (Vite + TypeScript + Sass)
├── tsconfig.json                # Strict TypeScript configuration
├── GEMINI.md                    # Project context & architecture guide (this file)
└── src/
    ├── main.ts                  # Application entry point (registers root components)
    ├── style.scss               # Global styles & GNOME Adwaita-inspired design system
    ├── framework/               # Core framework modules
    │   ├── core.ts              # Signals, effects, Component base class, DOM helpers, defineComponent
    │   └── common.ts            # Shared utilities and future framework extensions
    ├── data/                    # Data services and state management
    │   └── data.service.ts      # Service layer
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
            └── components/      # UI Web Components
                ├── custom/      # <custom-component> with two-way signal bindings
                ├── directive-sample/ # <directive-sample> demonstrating directive usage
                ├── forms-validation/ # <forms-validation> sample form component
                ├── header/      # <header-component> navigation bar
                ├── modal/       # Modal dialog components
                └── raw-template/# <raw-template> dynamic inline template rendering
```

---

## Core Framework Architecture (`src/framework/`)

### 1. Reactivity (`core.ts`)

Purity features a synchronous reactive primitives engine:

* **`signal<T>(initialValue: T): Signal<T>`**:
  Creates a reactive value container.
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

### 2. Web Component Model (`Component` & `defineComponent`)

* **`Component`**: Abstract class extending `HTMLElement`.
  - **`templateUrl?: string`**: Path to an external HTML template. Templates are fetched once via `fetch()` and cached in `templateCache`.
  - **`onInit(): void`**: Lifecycle method invoked after the template is loaded and the component is mounted in the DOM.
  - **`bindTemplate(root?: HTMLElement)`**: Automatically parses and binds reactive `{{ expression }}` handlebars interpolations in text nodes and attributes.
  - **`render(content?: string)`**: Programmatically assigns template strings directly to `innerHTML` and triggers `bindTemplate()`.
  - **`disconnectedCallback(): void`**: Native Web Component lifecycle hook for cleaning up subscriptions and behavior instances.

* **`defineComponent(name: string, component: CustomElementConstructor)`**:
  Safely registers the custom element with `customElements.define` if not already registered.

  ```typescript
  export class MyComponent extends Component {
      templateUrl = './src/app/my-component.html';

      protected onInit() {
          // Initialize signals, DOM queries, effects
      }
  }

  defineComponent('my-component', MyComponent);
  ```

### 3. DOM Utilities

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
  // Resolve by string name:
  const dataService = inject<DataService>('DataService');

  // Or resolve by class constructor:
  const dataService = inject(DataService);
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

---

## Composable Behaviors (`src/app/shared/behaviors/`)

Behaviors enhance DOM elements without requiring complex inheritance trees:

* **Draggable (`drag`)**:
  - Pointer event capture with movement threshold (`DRAG_THRESHOLD = 3px`).
  - Container boundary constraints (`constrainTo`).
  - Handle selector support (`handle`).
  - Drop target integration & center snapping (`snapTo`).
  - Smooth animation frame scheduling via `requestAnimationFrame`.
  - Returns `{ destroy() }` for clean teardown.

* **Droppable (`droppable`)**:
  - Registers elements as valid drop zones with selector filtering (`accepts`).
  - Automatic hover detection (`hoverClass`, `onEnter`, `onLeave`, `onDrop`).
  - Returns `{ destroy() }` for unregistering.

---

## Key Conventions & Best Practices

1. **Side-Effect Imports for Components**:
   Because components register themselves with `defineComponent` at module evaluation time, import them as side effects:
   ```typescript
   import './shared/components/custom/custom.component';
   ```
   If referencing component types for TypeScript typings, use explicit type-only imports:
   ```typescript
   import type { CustomComponent } from './shared/components/custom/custom.component';
   ```

2. **Component Lifecycle & Memory Management**:
   - Initialize behaviors, services, and setup inside `protected onInit()`.
   - Clean up event listeners, behaviors, or timers inside `disconnectedCallback()`.

3. **Reactivity inside Components**:
   - Use declarative `{{ expression }}` template interpolations in HTML templates for fine-grained reactive updates.
   - Use `effect(() => { ... })` for custom side effects when needed.

4. **TypeScript Configuration**:
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

### Adding New Features

* **New Framework Features**: Place core abstractions (e.g. state management, routing, template parsers) in `src/framework/`.
* **New UI Components**: Place custom elements in `src/app/shared/components/<component-name>/` with their corresponding `.ts`, `.html`, and `.scss` files, and call `defineComponent('tag-name', ClassName)`.
* **New Behaviors**: Place modular interaction helpers in `src/app/shared/behaviors/<behavior-name>/`.
