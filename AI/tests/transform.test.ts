import { describe, it, expect } from 'vitest';
import { handleTransformTemplate } from '../src/tools/transform.tool.js';

describe('purity_transform_template tool', () => {
  it('should transform Angular *ngFor with index to Purity for directive', async () => {
    const input = `<div *ngFor="let item of items; let i = index">{{ item }}</div>`;
    const result = await handleTransformTemplate({ template: input });
    expect(result.convertedTemplate).toBe('<div for="let item, i of items">{{ item }}</div>');
    expect(result.transformations).toHaveLength(1);
    expect(result.transformations[0].type).toBe('structural-repeater');
  });

  it('should transform Vue v-for to Purity for directive', async () => {
    const input = `<li v-for="(user, idx) in users">{{ user.name }}</li>`;
    const result = await handleTransformTemplate({ template: input });
    expect(result.convertedTemplate).toBe('<li for="let user, idx of users">{{ user.name }}</li>');
  });

  it('should transform *ngIf and v-if to Purity if', async () => {
    const input = `<span *ngIf="isLoggedIn">Welcome</span><p v-if="error">Error</p>`;
    const result = await handleTransformTemplate({ template: input });
    expect(result.convertedTemplate).toBe('<span if="isLoggedIn">Welcome</span><p if="error">Error</p>');
  });

  it('should transform (click) and @click to onclick', async () => {
    const input = `<button (click)="save()">Save</button><button @click="cancel()">Cancel</button>`;
    const result = await handleTransformTemplate({ template: input });
    expect(result.convertedTemplate).toBe('<button onclick="save()">Save</button><button onclick="cancel()">Cancel</button>');
  });

  it('should transform two-way model binding [(ngModel)] and strip inline styles', async () => {
    const input = `<input [(ngModel)]="username" style="color: blue; padding: 4px;" />`;
    const result = await handleTransformTemplate({ template: input });
    expect(result.convertedTemplate).toContain('value="{{ username() }}" oninput="username.set(this.value)"');
    expect(result.convertedTemplate).not.toContain('style=');
    expect(result.suggestedStyles).toContain('color: blue; padding: 4px;');
  });
});
