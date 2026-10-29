import { z } from 'zod';
export function registerPrompts(server) {
    // Prompt 1: Create Component
    server.prompt('purity-create-component', 'Design and generate an idiomatic Purity Custom Element with signals, template, SCSS, and Vitest test', {
        name: z.string().describe('Name of the component in kebab-case (e.g. "shopping-cart")'),
        description: z.string().describe('What the component should do and its interactive features'),
        hasInputs: z.string().optional().describe('Comma-separated list of inputs/attributes if any'),
    }, async ({ name, description, hasInputs }) => {
        const promptText = `You are designing a high-performance Custom Element for the Purity framework.

### Requirements:
1. Component Name: "${name}"
2. Description: "${description}"
${hasInputs ? `3. Inputs/Attributes: ${hasInputs}` : ''}

### Mandatory Purity Architectural Rules:
- Decorated with \`@Component({ selector: '${name}', templateUrl: './${name}.component.html' })\`.
- Reactive state managed solely via synchronous \`signal()\`, \`computed()\`, and \`effect()\` from \`@purity/core\`.
- All methods mutate state with \`.set()\` or \`.update()\`.
- NEVER use native \`addEventListener\`, \`removeEventListener\`, \`dispatchEvent\`, or \`CustomEvent\`.
- For events and state communication between nested components (parent/child), use signals and effects.
- For events and state communication between non-nested or distant components, use a shared \`@Injectable\` service variant with signals/effects.
- NEVER use query selectors (\`querySelector\`, \`querySelectorAll\`, \`getElementById\`, etc.). ALWAYS use \`@ViewChild\` decorators instead to reference child elements or components.
- External template inlined synchronously at build time with Vite (\`?raw\`).
- If iterating arrays, use structural repeater \`for="let item of items"\` or \`virtual-for\` if high volume.
- If using conditionals, use \`if="expr"\`, \`else-if="expr"\`, \`else\`.
- All styling must be in \`${name}.component.scss\` and begin with \`@use '@styles' as *;\`.
- Use Adwaita glassmorphism tokens (\`var(--gnome-surface)\`, \`var(--gnome-card)\`, \`var(--radius-card)\`, etc.).
- Use KDE Plasma Breeze cursor tokens (\`var(--cursor-pointer)\`, \`var(--cursor-default)\`, etc.).
- NEVER use inline \`style="..."\` attributes.
- Provide a colocated Vitest unit test in \`${name}.component.spec.ts\`.

Please generate the complete, production-ready code files for:
1. \`${name}.component.ts\`
2. \`${name}.component.html\`
3. \`${name}.component.scss\`
4. \`${name}.component.spec.ts\``;
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: promptText,
                    },
                },
            ],
        };
    });
    // Prompt 2: Review Code
    server.prompt('purity-review-code', 'Perform a comprehensive 12-point architectural audit of Purity code', {
        code: z.string().describe('The TypeScript, HTML, or SCSS code to audit'),
        fileName: z.string().optional().describe('File name with extension (e.g. "user.component.ts")'),
    }, async ({ code, fileName }) => {
        const promptText = `Perform a strict architectural and quality audit on the following Purity code ${fileName ? `(\`${fileName}\`)` : ''}:

\`\`\`
${code}
\`\`\`

Audit against the 12 Non-Negotiable Purity Framework Rules:
1. **Reactivity**: Are signals mutated via \`.set()\` or \`.update()\`? (NEVER \`signal = val\` or \`signal.value = val\`).
2. **Read Syntax**: Are signals invoked as functions in expressions (\`mySignal()\`)?
3. **No External State**: Zero imports from RxJS, Redux, Zustand, MobX.
4. **Custom Element Lifecycle**: Does it use \`protected onInit(): void\` and \`onDestroy()\`? (NEVER \`ngOnInit\` or \`componentDidMount\`).
5. **Path Aliases**: Are imports using \`@purity/*\`, \`@components/*\`, \`@styles\`? (NO \`../\` relative parent traversals).
6. **No Inline Styles**: Does the template contain any \`style="..."\` attributes? (Strictly forbidden).
7. **SCSS Architecture**: Does SCSS begin with \`@use '@styles' as *;\`?
8. **Design System Leakage**: Does the code contain the internal string "GNOME 50"? (Must use "Adwaita" publicly).
9. **Breeze Cursors & Tokens**: Are KDE Breeze cursor tokens and Adwaita corner radii used?
10. **Template Directives**: Are repeaters \`for="let item of items"\` and conditionals \`if="expr"\` instead of Angular/Vue directives?
11. **No Native Event Listeners / Dispatching**: Are native \`addEventListener\`, \`removeEventListener\`, \`dispatchEvent\`, or \`CustomEvent\` used? (Forbidden! Events between nested components must use signals and effects; distant/non-nested components must use a shared \`@Injectable\` service).
12. **No Query Selectors (@ViewChild Mandatory)**: Are direct DOM query selectors (\`querySelector\`, \`querySelectorAll\`, \`getElementById\`, etc.) used? (Forbidden! Always use \`@ViewChild\` decorators to reference child components or elements).

Provide a structured report listing:
- Status (PASS / FAIL)
- Numerical Score (0 - 100)
- Violations with line numbers and exact code replacements.`;
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: promptText,
                    },
                },
            ],
        };
    });
    // Prompt 3: Migrate Component
    server.prompt('purity-migrate-component', 'Migrate a component from React, Angular, or Vue into an idiomatic Purity Custom Element', {
        sourceFramework: z.enum(['react', 'angular', 'vue']).describe('Source framework'),
        sourceCode: z.string().describe('Source component code to convert'),
        componentName: z.string().describe('Target Purity component name in kebab-case'),
    }, async ({ sourceFramework, sourceCode, componentName }) => {
        const promptText = `Convert the following ${sourceFramework.toUpperCase()} component into an idiomatic Purity Web Component named \`<${componentName}>\`.

### Source Code (${sourceFramework}):
\`\`\`
${sourceCode}
\`\`\`

### Conversion Directives:
- Convert state hooks / ref / properties to Purity \`signal()\`, \`computed()\`, or \`effect()\`.
- Replace native event listeners / dispatching with signals and effects (nested components) or an \`@Injectable\` service (distant components).
- Replace DOM query selectors (\`querySelector\`, \`getElementById\`, \`useRef\`) with Purity's \`@ViewChild\` decorator. NEVER use \`querySelector\`.
- Separate code into:
  1. \`${componentName}.component.ts\` (\`@Component({ selector: '${componentName}', templateUrl: './${componentName}.component.html' })\`)
  2. \`${componentName}.component.html\` (Purity Handlebars bindings, \`for="let item of items"\`, \`if="expr"\`, slots)
  3. \`${componentName}.component.scss\` (\`@use '@styles' as *;\`, Adwaita glassmorphic styles)
  4. \`${componentName}.component.spec.ts\` (Vitest test verifying mounted Custom Element)
- Ensure zero external dependencies.`;
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: promptText,
                    },
                },
            ],
        };
    });
    // Prompt 4: Debug Reactivity
    server.prompt('purity-debug-reactivity', 'Diagnose and fix reactivity issues in Purity signals, effects, or repeater bindings', {
        code: z.string().describe('Code containing reactive signals, effects, or templates'),
        issueDescription: z.string().describe('Observed reactivity issue (e.g. effect not triggering, infinite loop, missing update)'),
    }, async ({ code, issueDescription }) => {
        const promptText = `Investigate this reactivity issue in Purity framework code:

### Observed Problem:
${issueDescription}

### Code:
\`\`\`typescript
${code}
\`\`\`

### Reactivity Principles in Purity:
- \`signal()\` reads register dependency in the currently executing \`effect()\` context synchronously.
- When an effect modifies a signal that it also reads without \`untrack()\`, an infinite loop or duplicate synchronous flush can occur.
- Child component attributes bound to signals in repeaters must use \`untrack()\` inside side-effects to prevent circular parent cascades.
- Calling \`.set()\` or \`.update()\` with the same value uses \`Object.is()\` and will intentionally NOT trigger subscribers.

Explain the root cause and provide the corrected code snippet.`;
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: promptText,
                    },
                },
            ],
        };
    });
}
//# sourceMappingURL=index.js.map