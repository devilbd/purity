import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { handleInspect } from '../src/tools/inspect.tool.js';

describe('purity_inspect_project tool', () => {
  it('should inspect current repository and detect Purity components and services', async () => {
    const projectRoot = path.resolve(process.cwd(), '..');
    const report = await handleInspect({ projectRoot });

    expect(report.isPurityProject).toBe(true);
    expect(report.frameworkVersion).toBeDefined();
    expect(report.totalComponents).toBeGreaterThan(0);
    expect(report.artifacts.length).toBeGreaterThan(0);

    const hasSwitchButton = report.artifacts.some(
      a => a.type === 'component' && (a.name === 'SwitchButtonComponent' || a.selector === 'switch-button')
    );
    expect(hasSwitchButton).toBe(true);

    const hasModal = report.artifacts.some(
      a => a.type === 'component' && (a.name === 'ModalViewComponent' || a.selector === 'modal-view')
    );
    expect(hasModal).toBe(true);
  });
});
