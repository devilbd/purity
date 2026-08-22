<p align="center">
  <img src="public/purity_logo.png" alt="Purity Logo" width="190" height="190" />
</p>

<h1 align="center">Purity</h1>

<p align="center">
  <strong>A lightweight, native TypeScript frontend framework powered by fine-grained signals and native Web Components.</strong>
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

**Purity** is a minimalist, modern frontend framework built from scratch on top of web standards. It avoids the bloat of heavy virtual DOM engines by combining **fine-grained reactive signals** with standard **Custom Elements v1**.

### Key Highlights

- ⚡ **Zero Heavy Runtime Dependencies**: Built with pure TypeScript targeting native Web APIs.
- 🔄 **Fine-Grained Reactivity**: Synchronous `signal` and `effect` primitives with automatic dependency tracking.
- 🧩 **Native Web Components**: Plain classes decorated with `@Component` transformed into native Custom Elements with automatic template inlining, expression compilation caching, and lifecycle hooks.
- 💉 **Dependency Injection**: First-class `@Injectable` decorator with instant singleton resolution via `inject()`.
- 🏷️ **Custom Directives**: Attribute-level reactivity and DOM tracking via `@Directive` and `BaseDirective`.
- 📋 **Decoupled Form Validation**: Form and field validation engine with `@Validator` and `BaseValidator` utilizing CSS state classes and automatic submit button state management.
- 🎯 **Composable Behaviors**: Modular interaction helpers (e.g. pointer-based `drag` & `droppable` with GPU acceleration, center snap, boundary constraints, and hover states) that attach without inheritance overhead.
- 🎨 **GNOME Adwaita Design**: Modern, glassmorphic UI styling foundation built with SCSS.
- 🚀 **Firebase Hosting Ready**: Built-in Firebase configuration and one-step deployment script (`npm run deploy`).

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
| `npm run preview` | Serves the production build locally for testing |
| `npm run deploy` | Builds the app and deploys to Firebase Hosting |
| `npm run deploy:hosting` | Builds the app and deploys only to Firebase Hosting |

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
├── README.md                    # Project documentation
├── GEMINI.md                    # Agent context & architecture reference
└── src/
    ├── main.ts                  # Application entry point (registers root components)
    ├── style.scss               # Global styles (GNOME Adwaita design system)
    ├── framework/               # Core framework modules
    │   ├── core.ts              # Signals, effects, DOM utilities, and module re-exports
    │   ├── component.ts         # @Component decorator, custom element lifecycle, template loader
    │   ├── di.ts                # Dependency Injection container and @Injectable decorator
    │   ├── directive.ts         # @Directive decorator, BaseDirective, DOM mutation tracking
    │   ├── validator.ts         # @Validator decorator, BaseValidator, form/field validation
    │   └── common.ts            # Shared framework exports
    ├── data/                    # Data services & Firebase configuration
    │   ├── data.service.ts      # Service layer
    │   └── firebase.ts          # Firebase config & service
    └── app/                     # Sample application
        ├── app.component.html   # Root template
        ├── app.component.scss   # Root styling
        ├── app.component.ts     # Root <app-component> class
        ├── assets/              # Fonts (Adwaita Mono) and static assets
        └── shared/
            ├── behaviors/       # Composable DOM behaviors (draggable, droppable)
            ├── directives/      # Reusable DOM directives (highlight)
            ├── validators/      # Form & field validation classes (forms-validation)
            └── components/      # UI Web Components (intro, header, demo, custom, modal, raw-template, forms-validation, directive-sample)
```

---

## 🧩 Framework Core Concepts & API

### 1. Reactivity (`signal` & `effect`)

Purity provides fine-grained reactive primitives:

```typescript
import { signal, effect } from '@purity/core';

// Create a signal
const username = signal<string | null>(null);

// Read current value (getter)
console.log(username()); // null

// Set new value
username.set('Alice');

// Update based on current value
username.update(prev => `${prev} Cooper`);

// Effects automatically track accessed signals and re-run on changes
effect(() => {
    console.log(`Current user: ${username()}`);
});
```

---

### 2. Native Web Components (`@Component` Decorator)

Classes are decorated with `@Component` to turn them into native Web Components with fine-grained reactivity, template inlining, and lifecycle hooks:

#### Example: Component with External Template

```typescript
// src/app/shared/components/custom/custom.component.ts
import { Component, signal } from '@purity/core';
import './custom.component.scss';

@Component({
    selector: 'custom-component',
    templateUrl: './src/app/shared/components/custom/custom.component.html',
})
export class CustomComponent {
    customProperty = signal<string | null>(null);

    onInput(element: HTMLInputElement) {
        this.customProperty.set(element.value);
    }

    onClear() {
        this.customProperty.set(null);
    }
}
```

#### Example: Child View & Component References (`@ViewChild`)

Use the `@ViewChild(selector)` decorator to query child DOM elements and child components:

```typescript
import { Component, ViewChild } from '@purity/core';
import type { CustomComponent } from './shared/components/custom/custom.component';

@Component({
    selector: 'app-component',
    templateUrl: './src/app/app.component.html',
})
export class AppComponent {
    @ViewChild('#component1')
    customComponent1?: CustomComponent | null;

    protected onInit() {
        this.customComponent1?.customProperty.set('Hello Purity');
    }
}
```

#### Example: Reactive Handlebars Template Interpolation

Purity supports declarative `{{ expression }}` template interpolations. Text nodes and element attributes automatically bind to signals and re-render fine-grained when signal dependencies change:

```html
<!-- app.component.html -->
<div class="user-card">
    <h3>User: {{loggedUser()}}</h3>
    <div id="custom-status">{{customComponent1?.customProperty()}}</div>
</div>
```

#### Example: Dynamic Inline Template Rendering

```typescript
// src/app/shared/components/raw-template/raw-template.component.ts
import { Component, effect, signal } from '@purity/core';
import './raw-template.component.scss';

@Component({
    selector: 'raw-template',
})
export class RawTemplateComponent {
    customProperty = signal(0);
    declare render: (content: string) => void;

    get status() {
        return this.customProperty() % 2 === 0 ? 'success' : 'error';
    }

    get template() {
        return `
            <div class="raw-template-component-root window">
                <h2>Raw Template Component</h2>
                <div class="${this.status}">${this.customProperty()}</div>
            </div>
        `;
    }

    protected onInit() {
        effect(() => {
            this.render(this.template);
        });
    }
}
```

---

### 3. DOM Utilities

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

### 4. Dependency Injection (`@Injectable` & `inject`)

Purity includes a built-in Dependency Injection container that enables service registration via decorators and instant resolution using `inject()`:

#### Declaring a Service with `@Injectable`

```typescript
import { Injectable, signal } from '@purity/core';

@Injectable('DataService')
export class DataService {
    currentUser = signal<string | null>(null);

    login(username: string) {
        this.currentUser.set(username);
    }
}
```

#### Injecting and Resolving Services

You can resolve registered services by their class constructor or by registered token name:

```typescript
import { Component, inject } from '@purity/core';
import { DataService } from './data/data.service';

@Component({
    selector: 'app-component',
    templateUrl: './src/app/app.component.html',
})
export class AppComponent {
    // Resolve singleton by class constructor
    private dataService = inject(DataService);

    // Or resolve by registered token name
    // private dataService = inject<DataService>('DataService');

    onLogin() {
        this.dataService.login('Alice');
    }
}
```

---

### 5. Directives (`@Directive` & `BaseDirective`)

Directives attach custom behavior, styling, and reactive listeners directly to DOM elements via attributes:

#### Declaring a Directive

```typescript
import { Directive, BaseDirective } from '@purity/core';
import './highlight.directive.scss';

@Directive('highlight')
export class HighlightDirective extends BaseDirective {
    onInit() {
        // Access host DOM element and attach CSS classes
        this.element.classList.add('p-highlight');
        this.onChanges(this.value);
    }

    onChanges(newValue: any) {
        // Toggle modifier CSS class when value or reactive {{ expression }} changes
        this.element.classList.toggle('p-highlight--active', !!newValue);
    }

    onDOMChange(record: MutationRecord | Event) {
        // Triggered when DOM properties/attributes change or input events occur
        console.log('DOM changed on element:', record);
    }
}
```

#### Using Directives in Templates

```html
<p highlight="gold">Static highlight</p>
<div highlight="{{activeVariant()}}">Reactive highlight</div>
```

---

### 6. Form Validation (`@Validator` & `BaseValidator`)

Form Validators decouple validation logic from UI templates, automatically tracking field mutations, managing overall form validity, updating submit button `disabled` states, and applying customizable CSS state classes:

#### Declaring a Form Validator

```typescript
// src/app/shared/validators/forms-validation.validator.ts
import { Validator, BaseValidator } from '@purity/core';

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

### 7. Composable Behaviors

Enhance elements without deep inheritance trees:

#### Draggable (`drag`)

```typescript
import { drag } from './shared/behaviors/draggable/draggable';

const dragInstance = drag({
    selector: '#my-draggable-card',
    constrainTo: 'body',
    handle: '.drag-handle',
    snapTo: '#drop-zone',
    onDragStart: (el) => el.classList.add('is-dragging'),
    onDragEnd: (el) => el.classList.remove('is-dragging'),
});

// Teardown when component disconnects
dragInstance.destroy();
```

#### Droppable (`droppable`)

```typescript
import { droppable } from './shared/behaviors/droppable/droppable';

const dropInstance = droppable({
    selector: '#drop-zone',
    accepts: '#my-draggable-card',
    hoverClass: 'droppable-hover',
    onDrop: (draggedEl) => {
        console.log('Element dropped:', draggedEl);
    }
});

// Teardown when component disconnects
dropInstance.destroy();
```

---

## 📐 Best Practices & Conventions

1. **Side-Effect Imports for Custom Elements, Directives, and Validators**:
   Components, directives, and validators register themselves upon module evaluation. Import them using side-effect imports:
   ```typescript
   import './shared/components/custom/custom.component';
   import './shared/directives/highlight.directive';
   import './shared/validators/forms-validation.validator';
   ```
   For TypeScript type references, use explicit type-only imports:
   ```typescript
   import type { CustomComponent } from './shared/components/custom/custom.component';
   ```

2. **CSS Classes over Inline Styles**:
   All visual modifications, state changes, directives, and behaviors apply CSS classes (e.g. `.p-highlight`, `.is-valid`, `.is-dragging`) rather than mutating `element.style` directly.

3. **Component Lifecycle & Memory Management**:
   - Setup DOM queries and behaviors inside `protected onInit()`.
   - Clean up event listeners and behavior instances in `onDestroy()` / `disconnectedCallback()`.

4. **Strict TypeScript**:
   - The project uses strict compiler options (`"verbatimModuleSyntax": true`, `"noUnusedLocals": true`, `"erasableSyntaxOnly": true`).

---

## 📄 License

MIT License. Feel free to use, modify, and build upon Purity!
