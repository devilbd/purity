import { describe, it, expect } from 'vitest';
import { handleDocs } from '../src/tools/docs.tool.js';

describe('purity_get_docs tool', () => {
  it('should retrieve full documentation for signals', async () => {
    const doc = await handleDocs({ topic: 'signals' });
    expect(doc.topic).toBe('signals');
    expect(doc.content).toContain('signal<T>');
    expect(doc.content).toContain('computed<T>');
    expect(doc.examples.length).toBeGreaterThan(0);
  });

  it('should retrieve summary documentation for virtual-for', async () => {
    const doc = await handleDocs({ topic: 'virtual-for', detail: 'summary' });
    expect(doc.topic).toBe('virtual-for');
    expect(doc.summary).toContain('virtual scrolling');
  });

  it('should retrieve design system documentation', async () => {
    const doc = await handleDocs({ topic: 'design-system' });
    expect(doc.content).toContain('--radius-card');
    expect(doc.content).toContain('var(--gnome-surface)');
  });

  it('should retrieve KDE Breeze cursors documentation', async () => {
    const doc = await handleDocs({ topic: 'cursors' });
    expect(doc.content).toContain('var(--cursor-pointer)');
    expect(doc.content).toContain('var(--cursor-progress)');
  });
});
