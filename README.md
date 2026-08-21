# Purity

<p align="center">
  <strong>A lightweight, native TypeScript frontend framework powered by fine-grained signals and native Web Components.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Web_Components-Custom_Elements_v1-orange?logo=web-components" alt="Web Components" />
  <img src="https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Dependencies-Zero_Runtime-brightgreen" alt="Zero Dependencies" />
</p>

---

## 📖 Overview

**Purity** is a minimalist, modern frontend framework built from scratch on top of web standards. It avoids the bloat of heavy virtual DOM engines by combining **fine-grained reactive signals** with standard **Custom Elements v1**.

### Key Highlights

- ⚡ **Zero Heavy Runtime Dependencies**: Built with pure TypeScript targeting native Web APIs.
- 🔄 **Fine-Grained Reactivity**: Synchronous `signal` and `effect` primitives with automatic dependency tracking.
- 🧩 **Native Web Components**: Standard `HTMLElement` custom elements with built-in template loading, caching, and lifecycle hooks.
- 🛠️ **Declarative DOM Helpers**: Lightweight utilities for querying and batch-updating targets, values, and styles.
- 🎯 **Composable Behaviors**: Modular interaction helpers (e.g. pointer-based `drag` & `droppable` with snap, boundary constraints, and hover states) that attach without inheritance overhead.
- 🎨 **GNOME Adwaita Design**: Modern, glassmorphic UI styling foundation.

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd purity
npm install
```

### 2. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Runs TypeScript type checks (`tsc`) and builds the production bundle with Vite |
| `npm run preview` | Serves the production build locally for testing |

---

## 🏛️ Project Structure

```
purity/
├── index.html                   # HTML entry point mounting <app-component>
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # Strict TypeScript configuration
├── README.md                    # Project documentation
├── GEMINI.md                    # Agent context & architecture reference
└── src/
    ├── main.ts                  # Application entry point (registers root components)
    ├── style.scss               # Global styles (GNOME Adwaita design system)
    ├── framework/               # Core framework modules
    │   ├── core.ts              # Signals, effects, Component base class, DOM utilities, defineComponent
    │   └── common.ts            # Shared utilities & framework extensions
    ├── data/                    # Data services & global state management
    │   └── data.service.ts      # Service layer
    └── app/                     # Sample application
        ├── app.component.html   # Root template
        ├── app.component.scss   # Root styling
        ├── app.component.ts     # Root <app-component> class
        ├── assets/              # Fonts (Adwaita Mono) and static assets
        └── shared/
            ├── behaviors/       # Composable DOM behaviors (draggable, droppable)
            └── components/      # UI Web Components (custom, header, raw-template, modal)
```

---

## 🧩 Framework Core Concepts & API

### 1. Reactivity (`signal` & `effect`)

Purity provides fine-grained reactive primitives:

```typescript
import { signal, effect } from './framework/core';

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

### 2. Native Web Components (`Component` & `defineComponent`)

Components extend `Component` (which subclasses `HTMLElement`).

#### Example: Component with External Template

```typescript
// src/app/shared/components/custom/custom.component.ts
import { Component, defineComponent, effect, signal, getElements, updateTargets, updateValues } from '../../../../framework/core';
import './custom.component.scss';

export class CustomComponent extends Component {
    // External template loaded asynchronously and cached
    templateUrl = './src/app/shared/components/custom/custom.component.html';

    customProperty = signal<string | null>(null);

    protected onInit() {
        const elements = getElements({
            input: '.input-field',
            display: '.display-target'
        }, this);

        // Bind reactivity to DOM
        effect(() => {
            const val = this.customProperty();
            const input = elements.get('input') as HTMLInputElement;
            const display = elements.get('display');

            if (input) updateValues([input], val);
            if (display) updateTargets([display], val, 'No value');
        });
    }
}

// Register the custom element
defineComponent('custom-component', CustomComponent);
```

#### Example: Inline Template Rendering

```typescript
import { Component, defineComponent, effect, signal } from '../../../../framework/core';

export class RawTemplateComponent extends Component {
    count = signal(0);

    get template() {
        return `
            <div class="counter-box">
                <h2>Count: ${this.count()}</h2>
            </div>
        `;
    }

    protected onInit() {
        effect(() => {
            this.render(this.template);
        });
    }
}

defineComponent('raw-template', RawTemplateComponent);
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

Purity includes a built-in Dependency Injection container that enables service registration via TypeScript decorators and instant resolution using `inject()`:

#### Declaring a Service with `@Injectable`

```typescript
import { Injectable, signal } from './framework/core';

@Injectable('DataService')
export class DataService {
    currentUser = signal<string | null>(null);

    login(username: string) {
        this.currentUser.set(username);
    }
}
```

#### Injecting and Resolving Services

You can resolve registered services by their name token or directly by class constructor:

```typescript
import { Component, defineComponent, inject } from './framework/core';
import { DataService } from './data/data.service';

export class AppComponent extends Component {
    // Resolve singleton by class constructor
    private dataService = inject(DataService);

    // Or resolve by registered token name
    // private dataService = inject<DataService>('DataService');

    onLogin() {
        this.dataService.login('Alice');
    }
}

defineComponent('app-component', AppComponent);
```

---

### 5. Composable Behaviors

Enhance elements without deep inheritance trees:

#### Draggable (`drag`)

```typescript
import { drag } from './shared/behaviors/draggable/draggable';

const dragInstance = drag({
    selector: '#my-draggable-card',
    constrainTo: 'body',
    handle: '.drag-handle',
    snapTo: '#drop-zone',
    onDragStart: (el) => el.classList.add('dragging'),
    onDragEnd: (el) => el.classList.remove('dragging'),
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

1. **Side-Effect Imports for Custom Elements**:
   Components register themselves upon module evaluation. Import them using side-effect imports:
   ```typescript
   import './shared/components/custom/custom.component';
   ```
   For TypeScript type references, use explicit type imports:
   ```typescript
   import type { CustomComponent } from './shared/components/custom/custom.component';
   ```

2. **Component Lifecycle & Memory Management**:
   - Setup queries and `effect()` bindings in `protected onInit()`.
   - Clean up event listeners and behavior instances in `disconnectedCallback()`.

3. **Strict TypeScript**:
   - The project uses strict compiler options (`"verbatimModuleSyntax": true`, `"noUnusedLocals": true`, `"erasableSyntaxOnly": true`).

---

## 🔮 Future Roadmap (`src/framework/`)

- [ ] **Router**: Client-side history-based routing engine with outlet components.
- [ ] **Service & State Management**: Dependency injection or centralized reactive store primitives.
- [ ] **Fine-Grained Template Parser**: Inline reactive attribute and text-node bindings without full `innerHTML` re-renders.
- [ ] **Scoped Styling**: Optional Shadow DOM or scoped attribute-based style isolation.
- [ ] **Form Control Primitives**: Declarative two-way bindings for complex forms.

---

## 📄 License

MIT License. Feel free to use, modify, and build upon Purity!
