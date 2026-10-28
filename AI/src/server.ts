import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { scaffoldSchema, handleScaffold } from './tools/scaffold.tool.js';
import { validateSchema, handleValidate } from './tools/validate.tool.js';
import { inspectSchema, handleInspect } from './tools/inspect.tool.js';
import { docsSchema, handleDocs } from './tools/docs.tool.js';
import {
  lookupComponentSchema,
  handleLookupComponent,
  listComponentsSchema,
  handleListComponents,
} from './tools/components.tool.js';
import { transformTemplateSchema, handleTransformTemplate } from './tools/transform.tool.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';

export function createPurityMcpServer(): McpServer {
  const server = new McpServer({
    name: 'purity-mcp',
    version: '1.0.0',
  });

  // Tool 1: purity_scaffold
  server.tool(
    'purity_scaffold',
    'Scaffolds production-ready Purity framework artifacts (components, services, pipes, directives, validators, interceptors, behaviors, pages) with 100% adherence to Adwaita design system and Vitest unit tests',
    scaffoldSchema,
    async (params) => {
      const result = await handleScaffold(params);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2: purity_validate
  server.tool(
    'purity_validate',
    'Audits Purity framework code (TypeScript, HTML, SCSS) against official architectural rules, signal mutation hygiene, path aliases, Adwaita tokens, and foreign framework anti-patterns',
    validateSchema,
    async (params) => {
      const result = await handleValidate(params);
      return {
        content: [
          {
            type: 'text',
            text: result.formattedReport,
          },
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 3: purity_inspect_project
  server.tool(
    'purity_inspect_project',
    'Scans a Purity repository to discover registered components, services, pipes, directives, validators, and evaluates project health, test coverage, and SCSS architecture',
    inspectSchema,
    async (params) => {
      const result = await handleInspect(params);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 4: purity_get_docs
  server.tool(
    'purity_get_docs',
    'Retrieves authoritative documentation, API contracts, rules, and runnable code examples for Purity framework features (signals, components, repeaters, virtual-for, DI, HTTP, Adwaita styling, cursors)',
    docsSchema,
    async (params) => {
      const result = await handleDocs(params);
      return {
        content: [
          {
            type: 'text',
            text: result.content || result.summary,
          },
        ],
      };
    }
  );

  // Tool 5: purity_lookup_component
  server.tool(
    'purity_lookup_component',
    'Looks up reusable UI Web Components and widgets in Purity (switch-button, modal-view, expander, popover, date-time-picker, loader, navigation-menu, profile-avatar, radial-context-menu, analogue-clock) with signatures, methods, signals, and copy-paste examples',
    lookupComponentSchema,
    async (params) => {
      const result = await handleLookupComponent(params);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 6: purity_list_components
  server.tool(
    'purity_list_components',
    'Lists all available reusable UI Web Components and widgets in the Purity design system categorized by type (core, overlay, form, navigation, widget, layout)',
    listComponentsSchema,
    async (params) => {
      const result = await handleListComponents(params);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 7: purity_transform_template
  server.tool(
    'purity_transform_template',
    'Converts templates with foreign syntax (Angular *ngFor/*ngIf/(click)/[(ngModel)], Vue v-for/v-if/@click/v-model, inline styles) into idiomatic Purity template syntax with signals and structural repeaters',
    transformTemplateSchema,
    async (params) => {
      const result = await handleTransformTemplate(params);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Register Resources & Prompts
  registerResources(server);
  registerPrompts(server);

  return server;
}
