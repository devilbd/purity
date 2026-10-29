import { describe, it, expect } from 'vitest';
import { handleValidate } from '../src/tools/validate.tool.js';

describe('purity_validate tool', () => {
  it('should pass 100% compliant Purity code', async () => {
    const code = `import { Component, signal } from '@purity/core';

@Component({ selector: 'valid-box', templateUrl: './valid-box.html' })
export class ValidBoxComponent {
  readonly count = signal(0);

  protected onInit(): void {}
  protected onDestroy(): void {}

  increment(): void {
    this.count.update(n => n + 1);
  }
}
`;
    const result = await handleValidate({ code, fileName: 'valid-box.component.ts' });
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });

  it('should flag relative parent imports (../)', async () => {
    const code = `import { signal } from '../../framework/core';`;
    const result = await handleValidate({ code, fileName: 'bad.component.ts' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'no-relative-parent-imports')).toBe(true);
  });

  it('should flag inline style attributes in HTML', async () => {
    const code = `<div style="display: flex; gap: 10px;">Hello</div>`;
    const result = await handleValidate({ code, fileName: 'bad.component.html' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'no-inline-styles')).toBe(true);
  });

  it('should flag internal design system reference leakage ("GNOME 50")', async () => {
    const code = `<h1>Welcome to our GNOME 50 Application</h1>`;
    const result = await handleValidate({ code, fileName: 'header.component.html' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'no-internal-design-leakage')).toBe(true);
  });

  it('should flag signal direct .value assignment', async () => {
    const code = `this.counter.value = 10;`;
    const result = await handleValidate({ code, fileName: 'counter.component.ts' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'signal-mutation-syntax')).toBe(true);
  });

  it('should flag missing @use @styles in SCSS', async () => {
    const code = `.button { color: red; }`;
    const result = await handleValidate({ code, fileName: 'button.component.scss' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'scss-missing-styles-import')).toBe(true);
  });

  it('should flag Angular and Vue repeaters (*ngFor, v-for)', async () => {
    const code = `<div *ngFor="let item of items">{{ item }}</div><li v-for="x in list">{{ x }}</li>`;
    const result = await handleValidate({ code, fileName: 'list.component.html' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'foreign-repeater-angular')).toBe(true);
    expect(result.issues.some(i => i.rule === 'foreign-repeater-vue')).toBe(true);
  });

  it('should flag external state libraries (RxJS, Redux)', async () => {
    const code = `import { Observable, Subject } from 'rxjs';\nimport { createStore } from 'redux';`;
    const result = await handleValidate({ code, fileName: 'state.ts' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'forbidden-state-library')).toBe(true);
  });

  it('should flag foreign lifecycle hooks (ngOnInit, componentDidMount)', async () => {
    const code = `export class Sample { ngOnInit() {} componentDidMount() {} }`;
    const result = await handleValidate({ code, fileName: 'sample.ts' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'foreign-lifecycle-hook')).toBe(true);
  });

  it('should flag native addEventListener and dispatchEvent', async () => {
    const code = `export class SampleComponent {
  setup() {
    this.addEventListener('click', () => {});
    this.dispatchEvent(new CustomEvent('update'));
  }
}`;
    const result = await handleValidate({ code, fileName: 'sample.component.ts' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'no-native-event-listeners')).toBe(true);
  });

  it('should flag querySelector and getElementById', async () => {
    const code = `export class SampleComponent {
  findChild() {
    const child = document.querySelector('.child');
    const header = document.getElementById('header');
  }
}`;
    const result = await handleValidate({ code, fileName: 'sample.component.ts' });
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.rule === 'no-query-selectors')).toBe(true);
  });

  it('should allow @ViewChild and signals/effects communication', async () => {
    const code = `import { Component, signal, effect, ViewChild } from '@purity/core';
import { ChildComponent } from '@components/child/child.component';

@Component({ selector: 'parent-comp', templateUrl: './parent.html' })
export class ParentCompComponent {
  @ViewChild()
  child?: ChildComponent;

  readonly activeId = signal('1');

  protected onInit(): void {
    effect(() => {
      if (this.child) {
        this.child.activeId.set(this.activeId());
      }
    });
  }
}`;
    const result = await handleValidate({ code, fileName: 'parent-comp.component.ts' });
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
    expect(result.issues).toHaveLength(0);
  });
});
