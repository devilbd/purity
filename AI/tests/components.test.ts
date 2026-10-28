import { describe, it, expect } from 'vitest';
import { handleLookupComponent, handleListComponents } from '../src/tools/components.tool.js';
import { ComponentMetadata } from '../src/types.js';

describe('purity component lookup and list tools', () => {
  it('should lookup switch-button with inputs, signals, and methods', async () => {
    const result = await handleLookupComponent({ query: 'switch-button' });
    expect('selector' in result).toBe(true);
    const meta = result as ComponentMetadata;
    expect(meta.selector).toBe('switch-button');
    expect(meta.signals.some(s => s.name === 'checked')).toBe(true);
    expect(meta.methods.some(m => m.name === 'toggle')).toBe(true);
    expect(meta.htmlExample).toContain('<switch-button');
  });

  it('should lookup modal-view with slot information', async () => {
    const result = await handleLookupComponent({ query: 'modal-view' });
    expect('selector' in result).toBe(true);
    const meta = result as ComponentMetadata;
    expect(meta.selector).toBe('modal-view');
    expect(meta.slots.some(s => s.name === 'footer')).toBe(true);
    expect(meta.methods.some(m => m.name === 'maximize')).toBe(true);
  });

  it('should list all components categorized', async () => {
    const all = await handleListComponents({});
    expect(all.total).toBeGreaterThanOrEqual(8);
    expect(all.components.some(c => c.selector === 'popover')).toBe(true);
    expect(all.components.some(c => c.selector === 'expander')).toBe(true);

    const forms = await handleListComponents({ category: 'form' });
    expect(forms.components.some(c => c.selector === 'switch-button')).toBe(true);
  });
});
