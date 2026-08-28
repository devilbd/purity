# Purity Framework - Agent Guidelines & Architecture Rules

This document defines the architectural guidelines, conventions, testing standards, and design system requirements for AI agents operating within the **Purity** repository.

For complete deep-dive documentation, also see [GEMINI.md](file:///run/media/devilbd/d/Development/purity/GEMINI.md).

---

## 1. Architectural Principles

- **Framework**: Purity is a native TypeScript framework built on Custom Elements v1, fine-grained synchronous signals (`signal`, `computed`, `effect`), and Dependency Injection (`@Injectable`, `inject`).
- **Component Model**: Plain classes decorated with `@Component({ selector, templateUrl })` with compile-time template inlining (`?raw`), `<slot>` content projection, structural iteration (`for="let item of items"` and `virtual-for`), and structural conditionals (`if`, `else-if`, `else`).
- **HTTP Client**: `HttpClient` service consuming centralized class-based interceptors (`HttpInterceptor`) under `@interceptors/*` and driving the KDE Plasma Breeze progress cursor engine.
- **Transform Pipes**: Reusable data transformers implementing `BasePipe` and decorated with `@Pipe('name')` integrated into Handlebars expressions (`{{ val | pipe: arg1 }}`).
- **Custom Directives**: Attribute and tag-level reactivity and DOM augmentation with `@Directive` and `BaseDirective` (e.g. `highlight`, `<dropdown>`).
- **Form Validators**: Decoupled validation classes implementing `BaseValidator` and decorated with `@Validator({ form, fields })`.
- **Composable Behaviors**: Modular interaction helpers (`drag`, `droppable`) under `@behaviors/*`.
- **Routing**: Signal Router with `<router-layout>` and `routerLink` directive.

---

## 2. Design System & Theming Mandate (GNOME 50 Adwaita & KDE Breeze Cursors)

- **Aesthetics**: Glassmorphic surfaces (`var(--gnome-surface)`, `var(--gnome-card)`), frosted blur (`var(--blur-effect)`), subtle specular borders (`var(--gnome-border)`).
- **Corner Radii Hierarchy**:
  - Windows & top containers: `var(--radius-window, 16px)`
  - Inner cards, dialog panels: `var(--radius-card, 12px)`
  - Controls (buttons, inputs): `var(--radius-control, 8px)`
  - Pills, badges, chips: `var(--radius-pill, 999px)`
- **KDE Plasma Breeze Cursor System**:
  - `var(--cursor-default)`, `var(--cursor-pointer)`, `var(--cursor-text)`, `var(--cursor-grab)`, `var(--cursor-grabbing)`, `var(--cursor-not-allowed)`, `var(--cursor-progress)`.
- **SCSS Architecture**: All styling must use `@use '@styles' as *;` and never use inline `style="..."` attributes.

---

## 3. TypeScript & Path Aliases Rules

- **Strict Mode**: `"verbatimModuleSyntax": true`, `"erasableSyntaxOnly": true`, `"noUnusedLocals": true`, `"strict": true`.
- **Path Aliases Mandatory (NO Relative `../` Traversal)**:
  - `@purity/core`, `@purity/*`, `@environments`, `@data/*`, `@app/*`, `@pages/*`, `@components/*`, `@shared/*`, `@directives/*`, `@pipes/*`, `@validators/*`, `@behaviors/*`, `@interceptors/*`, `@widgets/*`, `@styles`.

---

## 4. Testing Framework & Conventions

- **Framework**: **Vitest**.
- **Test Colocation**: `*.spec.ts` or `*.test.ts` placed adjacent to source files or in `__tests__/` directories.
- **Coverage Focus**: Synchronous signal reactivity, custom element lifecycle, pipe transformations, validator logic, and HTTP interceptor pipelines.

---

## 5. Naming Conventions

- **Files**: `kebab-case.role.ts` (e.g., `auth.interceptor.ts`, `date-time-picker.component.ts`, `highlight.directive.ts`, `_variables.scss`).
- **Classes**: `PascalCase` with role suffix (`AppComponent`, `AuthInterceptor`, `DatePipe`, `UserValidator`).
- **Custom Elements**: `kebab-case` tag name (`app-component`, `date-time-picker`, `router-layout`).
- **Signals / Methods**: `camelCase` (`currentUser`, `onInit()`, `validateAll()`).
- **CSS Classes**: `kebab-case` (`.button-primary`, `.input-primary`, `.window`, `.is-valid`).
