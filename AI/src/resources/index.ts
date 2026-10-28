import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { DOCUMENTATION } from '../data/documentation.js';
import { COMPONENT_CATALOG } from '../data/component-catalog.js';
import { generateScaffoldFiles } from '../data/templates.js';
import { ScaffoldType } from '../types.js';

export function registerResources(server: McpServer): void {
  // Resource 1: Developer Cheatsheet
  server.resource(
    'purity-cheatsheet',
    'purity://docs/cheatsheet',
    async (uri) => {
      const text = `# Purity Framework - Developer Cheatsheet

## 1. Synchronous Signals
\`\`\`typescript
import { signal, computed, effect, untrack } from '@purity/core';

const count = signal(0);
const doubled = computed(() => count() * 2);

// Read
console.log(count(), doubled());

// Mutate
count.set(5);
count.update(n => n + 1);

// Effect
effect(() => console.log('Count:', count()));
\`\`\`

## 2. Component Structure
\`\`\`typescript
import { Component, signal, ViewChild } from '@purity/core';

@Component({
  selector: 'my-widget',
  templateUrl: './my-widget.component.html'
})
export class MyWidgetComponent {
  title = signal('Widget');

  protected onInit(): void {}
  protected onDestroy(): void {}
}
\`\`\`

## 3. Template Syntax
\`\`\`html
<!-- Interpolation -->
<h1>{{ title() }}</h1>

<!-- Structural Conditionals -->
<div if="isActive()">Active</div>
<div else-if="isPending()">Pending</div>
<div else>Inactive</div>

<!-- Structural Repeater -->
<div for="let item, index of items">
  #{{ index + 1 }} {{ item.name }}
</div>

<!-- Virtual Scroll (Massive Datasets) -->
<div virtual-for="let row of rows; itemHeight: 48; buffer: 8; height: 400px; scrollIndex: jumpSignal">
  {{ row.text }}
</div>

<!-- Slots -->
<slot name="header"></slot>
<slot>Default body</slot>
\`\`\`

## 4. Styling (Adwaita Glassmorphism)
\`\`\`scss
@use '@styles' as *;

.my-card {
  background: var(--gnome-card);
  backdrop-filter: var(--blur-effect);
  border: 1px solid var(--gnome-border);
  border-radius: var(--radius-card); // 12px
  cursor: var(--cursor-default);
}
\`\`\`

## 5. Dependency Injection & HTTP
\`\`\`typescript
import { Injectable, inject, HttpClient } from '@purity/core';

@Injectable('DataService')
export class DataService {
  private http = inject(HttpClient);
  getData() { return this.http.get('/api/items'); }
}
\`\`\`
`;
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text,
          },
        ],
      };
    }
  );

  // Resource 2: Architecture Rules
  server.resource(
    'purity-architecture',
    'purity://docs/architecture',
    async (uri) => {
      const text = DOCUMENTATION.rules.content + '\n\n' + DOCUMENTATION.overview.content;
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text,
          },
        ],
      };
    }
  );

  // Resource 3: Design System & Cursors
  server.resource(
    'purity-design-system',
    'purity://docs/design-system',
    async (uri) => {
      const text = DOCUMENTATION['design-system'].content + '\n\n' + DOCUMENTATION.cursors.content + '\n\n' + DOCUMENTATION.styling.content;
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text,
          },
        ],
      };
    }
  );

  // Resource 4: Component Catalog
  server.resource(
    'purity-component-catalog',
    'purity://catalog/components',
    async (uri) => {
      const rows = COMPONENT_CATALOG.map(
        c => `| \`<${c.selector}>\` | **${c.name}** | \`${c.category}\` | ${c.description} |`
      );
      const text = `# Purity Framework - Reusable Component Catalog

| Tag Selector | Component Class | Category | Description |
| :--- | :--- | :--- | :--- |
${rows.join('\n')}

---
Use tool \`purity_lookup_component\` for input signatures, signal types, methods, and full HTML usage examples.
`;
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text,
          },
        ],
      };
    }
  );

  // Resource 5: Dynamic Template Generator (purity://templates/{type})
  server.resource(
    'purity-template',
    new ResourceTemplate('purity://templates/{type}', { list: undefined }),
    async (uri, { type }) => {
      const validTypes: ScaffoldType[] = [
        'component',
        'service',
        'pipe',
        'directive',
        'validator',
        'interceptor',
        'behavior',
        'page',
      ];

      const resolvedType = (validTypes.includes(type as ScaffoldType) ? type : 'component') as ScaffoldType;
      const { files } = generateScaffoldFiles(resolvedType, `sample-${resolvedType}`);

      const fileSections = files.map(
        f => `### File: \`${f.filename}\`\n*${f.description}*\n\`\`\`${f.filename.endsWith('.scss') ? 'scss' : f.filename.endsWith('.html') ? 'html' : 'typescript'}\n${f.content}\`\`\``
      ).join('\n\n');

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: `# Starter Template: ${resolvedType}\n\n${fileSections}`,
          },
        ],
      };
    }
  );
}
