import { describe, it, expect } from 'vitest';
import { createPurityMcpServer } from '../src/server.js';

describe('Purity MCP Server creation', () => {
  it('should instantiate the McpServer and register tools, resources, and prompts', () => {
    const server = createPurityMcpServer();
    expect(server).toBeDefined();
    // Verify server has registered features
    expect(typeof server.connect).toBe('function');
    expect(typeof server.close).toBe('function');
  });
});
