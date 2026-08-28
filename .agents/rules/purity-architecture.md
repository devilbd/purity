# Purity Framework - Architecture & Quality Rules

## 1. Core Architectural Constraints
- **Native Web Components**: Standard classes decorated with `@Component` transformed into Custom Elements. External templates (`templateUrl`) inlined at build time. Declarative `<slot>`, structural `for="let item of items"` / `virtual-for`, and structural `if="expr"` / `else-if` / `else`.
- **Fine-Grained Reactivity**: Use `signal()`, `computed()`, `effect()` from `@purity/core`. Synchronous updates with sub-microsecond latency.
- **Dependency Injection**: Services decorated with `@Injectable('Name')` / `@Service('Name')`, resolved via `inject(Token)`.
- **HTTP Client & Interceptors**: `HttpClient` service consuming centralized class-based interceptors (`HttpInterceptor`) under `@interceptors/*`.
- **Transform Pipes**: Reusable formatting classes with `@Pipe('name')` extending `BasePipe`.
- **Custom Directives**: Attribute-level reactivity with `@Directive('name')` extending `BaseDirective`.
- **Decoupled Form Validation**: Form and field validation engine with `@Validator` extending `BaseValidator`.
- **Composable Behaviors**: Modular interaction helpers (`drag`, `droppable`) under `@behaviors/*`.
- **Signal Router**: Native routing with `<router-layout>` and `routerLink` directive.

## 2. Design System: GNOME 50 Adwaita & KDE Breeze Cursors
- Surfaces: `var(--gnome-surface)`, `var(--gnome-card)`, `var(--blur-effect)`, `var(--gnome-border)`.
- Corner Radii: Window (16px), Card (12px), Control (8px), Pill/Badge (999px).
- Breeze Cursors: `var(--cursor-default)`, `var(--cursor-pointer)`, `var(--cursor-text)`, `var(--cursor-grab)`, `var(--cursor-grabbing)`, `var(--cursor-not-allowed)`, `var(--cursor-progress)`.
- Styling: Modular SCSS (`@use '@styles' as *;`). Never use inline `style="..."` attributes.

## 3. TypeScript & Path Aliases
- Strict mode: `"verbatimModuleSyntax": true`, `"noUnusedLocals": true`, `"strict": true`.
- Path aliases mandatory: `@purity/core`, `@purity/*`, `@environments`, `@data/*`, `@app/*`, `@pages/*`, `@components/*`, `@shared/*`, `@directives/*`, `@pipes/*`, `@validators/*`, `@behaviors/*`, `@interceptors/*`, `@widgets/*`, `@styles`. No relative `../` parent traversals.

## 4. Testing Framework: Vitest
- Use **Vitest** for unit and integration testing.
- Colocate tests (`*.spec.ts` or `*.test.ts`) with implementation files or in `__tests__/`.

## 5. Naming Conventions
- Files: `kebab-case.role.ts` (e.g. `auth.interceptor.ts`, `custom.component.ts`).
- Classes: `PascalCase` with role suffix (`AuthInterceptor`, `CustomComponent`).
- Custom Elements: `kebab-case` (`custom-component`, `date-time-picker`).
- Signals / Methods: `camelCase` (`currentUser`, `onInit()`).
- CSS Classes: `kebab-case` (`.button-primary`, `.is-valid`).
