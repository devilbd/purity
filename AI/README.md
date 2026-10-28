# Purity Model Context Protocol (MCP) Server

[![MCP Standard](https://img.shields.io/badge/MCP-1.32.2-blue.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ES2022-3178C6.svg)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-passing-6E9F18.svg)](https://vitest.dev/)
[![Design System](https://img.shields.io/badge/Design-Adwaita%20Glassmorphism-9141ac.svg)](https://gnome.org)

Official **Model Context Protocol (MCP)** server for the **Purity** framework.

This server bridges your AI development environments (**Claude Desktop**, **Cursor**, **Google Antigravity / AGY**, **VS Code / Cline / Roo Code / Continue**, **Windsurf**) directly into Purity's architecture—eliminating hallucinations, enforcing synchronous signals, scaffolding 100% compliant Custom Elements, inspecting project health, and transforming foreign template code in real time.

---

## ⚡ Features at a Glance

| Category | Capability | Description |
| :--- | :--- | :--- |
| 🛠️ **Tools** | `purity_scaffold` | Scaffold components, services, pipes, directives, validators, interceptors, behaviors, and pages with tests. |
| 🔍 **Tools** | `purity_validate` | Deep static analysis auditing signal mutations, path aliases, inline styles, Adwaita tokens, and foreign syntax. |
| 📊 **Tools** | `purity_inspect_project` | Scans workspace health, discovered components, test coverage, and SCSS architecture. |
| 📚 **Tools** | `purity_get_docs` | Authoritative reference documentation and runnable code examples across 20+ framework topics. |
| 🧩 **Tools** | `purity_lookup_component` | Look up signatures, reactive signals, methods, events, and copy-paste HTML for shared UI components. |
| 🗂️ **Tools** | `purity_list_components` | Browse all built-in UI components and widgets categorized by role. |
| 🔄 **Tools** | `purity_transform_template` | Converts Angular (`*ngFor`, `*ngIf`, `(click)`, `[(ngModel)]`) or Vue (`v-for`, `v-if`, `@click`, `v-model`) to Purity. |
| 📖 **Resources** | `purity://docs/*` | Live access to Cheatsheet, Architecture Rules, and Adwaita Design Tokens. |
| 🎨 **Resources** | `purity://catalog/*` | Live catalog of all UI components (`switch-button`, `modal-view`, `expander`, `popover`, etc.). |
| 📋 **Resources** | `purity://templates/*` | Dynamic starter templates for any Purity construct. |
| 💬 **Prompts** | `purity-create-component` | Guided workflow to design and implement production-ready Purity Custom Elements. |
| 💬 **Prompts** | `purity-review-code` | 10-point architectural and quality audit prompt. |
| 💬 **Prompts** | `purity-migrate-component`| Seamless migration prompt from React / Angular / Vue to Purity. |
| 💬 **Prompts** | `purity-debug-reactivity` | Reactivity troubleshooter diagnosing signal access, untracked dependencies, and effect loops. |

---

## 🚀 Quick Setup

### 1. Build the MCP Server
Inside the repository:
```bash
cd AI
npm install
npm run build
```

Verify it runs:
```bash
node dist/index.js --help
```

---

## ⚙️ Environment Configuration

### 1. Claude Desktop
Add to your `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "purity": {
      "command": "node",
      "args": ["/absolute/path/to/purity/AI/dist/index.js"]
    }
  }
}
```

---

### 2. Cursor
Add to your project's `.cursor/mcp.json` (or global Cursor MCP configuration):

```json
{
  "mcpServers": {
    "purity": {
      "command": "node",
      "args": ["${workspaceFolder}/AI/dist/index.js"]
    }
  }
}
```

---

### 3. Google Antigravity / AGY
Add to your MCP server configuration:

```json
{
  "mcpServers": {
    "purity": {
      "command": "node",
      "args": ["/run/media/devilbd/d/Development/purity/AI/dist/index.js"]
    }
  }
}
```

---

### 4. VS Code (Cline, Roo Code, Continue)
In your VS Code extension settings (`cline_mcp_settings.json` or `roo_code_mcp_settings.json`):

```json
{
  "mcpServers": {
    "purity": {
      "command": "node",
      "args": ["/absolute/path/to/purity/AI/dist/index.js"]
    }
  }
}
```

---

### 5. Windsurf
Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "purity": {
      "command": "node",
      "args": ["/absolute/path/to/purity/AI/dist/index.js"]
    }
  }
}
```

---

## 🛠️ MCP Tools Reference

### `purity_scaffold`
Generates complete, production-ready Purity boilerplate files adhering to all architectural standards:
- **`type`**: `'component'` | `'service'` | `'pipe'` | `'directive'` | `'validator'` | `'interceptor'` | `'behavior'` | `'page'`
- **`name`**: Artifact name (e.g. `'user-badge'`)
- **`selector`** *(optional)*: Custom element tag (e.g. `'user-badge'`)
- **`targetDir`** *(optional)*: Directory to save generated files
- **`writeToDisk`** *(optional)*: Automatically writes files to disk when `true`
- **`description`** *(optional)*: Summary description of functionality

*Example Tool Call:*
```json
{
  "type": "component",
  "name": "shopping-cart",
  "description": "Interactive checkout tray",
  "writeToDisk": false
}
```

---

### `purity_validate`
Audits TypeScript, HTML, or SCSS against Purity's 10 non-negotiable rules:
- **`code`** *(optional)*: Raw code string to validate
- **`filePath`** *(optional)*: Path to file on disk to validate
- **`fileName`** *(optional)*: Virtual filename (e.g. `'my.component.ts'`, `'card.component.scss'`)

*Returns:*
- Numerical score (0 to 100)
- Validation status (`valid: true/false`)
- Specific violation list with line numbers, code snippets, and exact recommended replacements.

---

### `purity_inspect_project`
Audits the health and structure of a Purity repository:
- **`projectRoot`** *(optional)*: Path to project root (defaults to current working directory).
- Detects registered `@Component`, `@Injectable`, `@Pipe`, `@Directive`, `@Validator`, and `HttpInterceptor` instances.
- Verifies test coverage (`*.spec.ts`) and SCSS pairing for all components.

---

### `purity_get_docs`
Provides instant reference documentation and runnable code examples:
- **`topic`**:
  `'signals'` | `'components'` | `'templates'` | `'repeaters'` | `'virtual-for'` | `'conditionals'` | `'slots'` | `'di'` | `'http'` | `'interceptors'` | `'pipes'` | `'directives'` | `'validators'` | `'behaviors'` | `'router'` | `'seo'` | `'design-system'` | `'cursors'` | `'styling'` | `'testing'` | `'rules'`
- **`detail`**: `'full'` | `'summary'` | `'examples'`

---

### `purity_lookup_component`
Inspects built-in shared UI components and widgets:
- **`query`**: Component name or selector (e.g. `'switch-button'`, `'modal-view'`, `'popover'`, `'expander'`, `'date-time-picker'`, `'loader'`, `'navigation-menu'`, `'profile-avatar'`, `'radial-context-menu'`, `'analogue-clock'`).
- Returns tag selector, inputs, signals, methods, events, slots, and copy-paste HTML examples.

---

### `purity_transform_template`
Translates foreign framework templates into idiomatic Purity templates:
- Angular `*ngFor="let item of items; let i = index"` ➔ `for="let item, i of items"`
- Vue `v-for="(item, i) in items"` ➔ `for="let item, i of items"`
- Angular `*ngIf="isLoggedIn"` ➔ `if="isLoggedIn"`
- Vue `v-if` / `v-else-if` / `v-else` ➔ `if` / `else-if` / `else`
- Angular `(click)="save()"` / Vue `@click="save"` ➔ `onclick="save()"`
- Angular `[(ngModel)]="val"` / Vue `v-model="val"` ➔ `value="{{ val() }}" oninput="val.set(this.value)"`
- Strips prohibited inline styles and suggests clean SCSS styling.

---

## 📖 MCP Resources Reference

Connect to these resources in your MCP client:

- **`purity://docs/cheatsheet`**: Single-page developer cheat sheet covering signals, components, repeaters, DI, and Adwaita styles.
- **`purity://docs/architecture`**: Official framework architectural rules and quality constraints.
- **`purity://docs/design-system`**: Adwaita glassmorphism tokens, corner radii hierarchy, and KDE Breeze cursors.
- **`purity://catalog/components`**: Markdown table of all shared components and widgets with categories and descriptions.
- **`purity://templates/{type}`**: Dynamic starter template for `component`, `service`, `pipe`, `directive`, `validator`, `interceptor`, `behavior`, or `page`.

---

## 💬 MCP Prompts Reference

Invoke these prompts in your AI chat:

- **`purity-create-component`**: Guides the AI step-by-step in generating an end-to-end Purity Custom Element with signals, templates, SCSS, and unit tests.
- **`purity-review-code`**: Directs the AI to run a rigorous 10-point compliance audit against Purity rules.
- **`purity-migrate-component`**: Instructs the AI to migrate React, Angular, or Vue components into Purity Custom Elements.
- **`purity-debug-reactivity`**: Directs the AI to analyze reactivity bugs (signal subscriptions, untracked dependencies, effect loops).

---

## 🧪 Testing

The MCP server has its own dedicated Vitest test suite:

```bash
cd AI
npm test
```

Tests cover:
- File scaffolding for all 8 artifact types
- Deep static validation checks & scoring
- Workspace inspection and artifact discovery
- Documentation retrieval across all topics
- Component catalog lookup and categorization
- Template conversion from Angular and Vue syntax
- Server instantiation and registration

---

## 📄 License

MIT © Purity Framework Team
