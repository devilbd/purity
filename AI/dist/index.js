#!/usr/bin/env node
/**
 * Purity Model Context Protocol (MCP) Server
 * Entry point for CLI and standard stdio communication.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createPurityMcpServer } from './server.js';
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    process.stderr.write(`
Purity MCP Server - Supercharge AI-Assisted Purity Development

Usage:
  npx purity-mcp [options]
  node AI/dist/index.js [options]

Options:
  -h, --help      Show this help message
  -v, --version   Show server version

Features:
  • purity_scaffold: Generate components, services, pipes, directives, validators, interceptors, behaviors, pages
  • purity_validate: Deep static analysis of code against Purity & Adwaita rules
  • purity_inspect_project: Scan workspace health and discovered artifacts
  • purity_get_docs: Authoritative framework documentation and runnable examples
  • purity_lookup_component: API signatures and HTML examples for shared UI widgets
  • purity_list_components: Catalog of all reusable UI components
  • purity_transform_template: Convert Angular/Vue/HTML templates into Purity syntax
  • Resources: purity://docs/*, purity://catalog/*, purity://templates/*
  • Prompts: purity-create-component, purity-review-code, purity-migrate-component, purity-debug-reactivity

Transport:
  Runs via standard I/O (stdio) JSON-RPC protocol.
\n`);
    process.exit(0);
}
if (args.includes('--version') || args.includes('-v')) {
    process.stderr.write(`purity-mcp v1.0.0\n`);
    process.exit(0);
}
async function main() {
    const server = createPurityMcpServer();
    const transport = new StdioServerTransport();
    process.stderr.write(`[purity-mcp] Starting Purity MCP Server on stdio transport...\n`);
    process.on('SIGINT', async () => {
        process.stderr.write(`[purity-mcp] Shutting down...\n`);
        await server.close();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        process.stderr.write(`[purity-mcp] Terminating...\n`);
        await server.close();
        process.exit(0);
    });
    await server.connect(transport);
    process.stderr.write(`[purity-mcp] Purity MCP Server is running and listening on stdio.\n`);
}
main().catch((error) => {
    process.stderr.write(`[purity-mcp] Fatal error: ${error instanceof Error ? error.stack : error}\n`);
    process.exit(1);
});
//# sourceMappingURL=index.js.map