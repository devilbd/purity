export function toPascalCase(str) {
    return str
        .replace(/(?:^|[-_])(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
        .replace(/[^a-zA-Z0-9]/g, '');
}
export function toKebabCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
export function generateScaffoldFiles(type, rawName, options = {}) {
    const kebab = toKebabCase(rawName);
    const pascal = toPascalCase(rawName);
    const selector = options.selector || kebab;
    const description = options.description || `Purity ${type} ${pascal}`;
    const files = [];
    switch (type) {
        case 'component': {
            const compClass = `${pascal}Component`;
            files.push({
                filename: `${kebab}.component.ts`,
                path: `${kebab}/${kebab}.component.ts`,
                description: `Component TypeScript logic for <${selector}>`,
                content: `import { Component, signal } from '@purity/core';

/**
 * ${description}
 */
@Component({
  selector: '${selector}',
  templateUrl: './${kebab}.component.html',
})
export class ${compClass} {
  // Reactive state
  readonly title = signal<string>('${pascal}');
  readonly isExpanded = signal<boolean>(false);

  protected onInit(): void {
    // Lifecycle initialization
  }

  protected onDestroy(): void {
    // Cleanup subscriptions / behaviors
  }

  toggle(): void {
    this.isExpanded.update(v => !v);
  }
}
`
            });
            files.push({
                filename: `${kebab}.component.html`,
                path: `${kebab}/${kebab}.component.html`,
                description: `HTML template for <${selector}>`,
                content: `<div class="${kebab}-card">
  <div class="card-header" onclick="toggle()">
    <span class="card-title">{{ title() }}</span>
    <span class="card-badge">{{ isExpanded() ? 'Expanded' : 'Collapsed' }}</span>
  </div>

  <div if="isExpanded()" class="card-body">
    <slot>
      <p>Default content for ${selector}.</p>
    </slot>
  </div>
</div>
`
            });
            files.push({
                filename: `${kebab}.component.scss`,
                path: `${kebab}/${kebab}.component.scss`,
                description: `Adwaita SCSS styles for <${selector}>`,
                content: `@use '@styles' as *;

.${kebab}-card {
  display: flex;
  flex-direction: column;
  background: var(--gnome-card);
  backdrop-filter: var(--blur-effect);
  border: 1px solid var(--gnome-border);
  border-radius: var(--radius-card);
  padding: 1rem;
  transition: all var(--transition-normal);
  cursor: var(--cursor-default);

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: var(--cursor-pointer);
    user-select: none;

    .card-title {
      font-weight: 600;
      color: var(--color-foreground);
    }

    .card-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-pill);
      background: var(--gnome-surface);
      border: 1px solid var(--gnome-border);
    }
  }

  .card-body {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--gnome-border);
    color: var(--color-foreground-muted);
  }
}
`
            });
            files.push({
                filename: `${kebab}.component.spec.ts`,
                path: `${kebab}/${kebab}.component.spec.ts`,
                description: `Vitest unit test for ${compClass}`,
                content: `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './${kebab}.component';
import { ${compClass} } from './${kebab}.component';

describe('${compClass}', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('${selector}');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should instantiate and mount in DOM', () => {
    expect(element).toBeDefined();
    const instance = element as unknown as ${compClass};
    expect(instance.title()).toBe('${pascal}');
  });

  it('should toggle isExpanded signal', () => {
    const instance = element as unknown as ${compClass};
    expect(instance.isExpanded()).toBe(false);
    instance.toggle();
    expect(instance.isExpanded()).toBe(true);
  });
});
`
            });
            break;
        }
        case 'service': {
            const serviceClass = `${pascal}Service`;
            files.push({
                filename: `${kebab}.service.ts`,
                path: `${kebab}.service.ts`,
                description: `@Injectable service logic`,
                content: `import { Injectable, signal, computed } from '@purity/core';

export interface ${pascal}Item {
  id: string;
  name: string;
}

/**
 * ${description}
 */
@Injectable('${serviceClass}')
export class ${serviceClass} {
  readonly items = signal<${pascal}Item[]>([]);
  readonly count = computed(() => this.items().length);

  addItem(name: string): void {
    const newItem: ${pascal}Item = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
    };
    this.items.update(list => [...list, newItem]);
  }

  removeItem(id: string): void {
    this.items.update(list => list.filter(item => item.id !== id));
  }

  clear(): void {
    this.items.set([]);
  }
}
`
            });
            files.push({
                filename: `${kebab}.service.spec.ts`,
                path: `${kebab}.service.spec.ts`,
                description: `Vitest unit test for ${serviceClass}`,
                content: `import { describe, it, expect, beforeEach } from 'vitest';
import { ${serviceClass} } from './${kebab}.service';
import { inject } from '@purity/core';

describe('${serviceClass}', () => {
  let service: ${serviceClass};

  beforeEach(() => {
    service = inject(${serviceClass});
    service.clear();
  });

  it('should initialize with empty items', () => {
    expect(service.items()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('should add items and compute count reactively', () => {
    service.addItem('Test Item');
    expect(service.count()).toBe(1);
    expect(service.items()[0].name).toBe('Test Item');
  });

  it('should remove items correctly', () => {
    service.addItem('Item 1');
    const id = service.items()[0].id;
    service.removeItem(id);
    expect(service.count()).toBe(0);
  });
});
`
            });
            break;
        }
        case 'pipe': {
            const pipeClass = `${pascal}Pipe`;
            files.push({
                filename: `${kebab}.pipe.ts`,
                path: `${kebab}.pipe.ts`,
                description: `@Pipe transform class`,
                content: `import { Pipe, BasePipe } from '@purity/core';

/**
 * ${description}
 * Usage in template: {{ value | ${kebab}: arg1 }}
 */
@Pipe('${kebab}')
export class ${pipeClass} extends BasePipe {
  transform(value: unknown, ...args: unknown[]): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const suffix = args[0] ? String(args[0]) : '';
    return \`\${str}\${suffix}\`;
  }
}
`
            });
            files.push({
                filename: `${kebab}.pipe.spec.ts`,
                path: `${kebab}.pipe.spec.ts`,
                description: `Vitest unit test for ${pipeClass}`,
                content: `import { describe, it, expect } from 'vitest';
import { ${pipeClass} } from './${kebab}.pipe';

describe('${pipeClass}', () => {
  const pipe = new ${pipeClass}();

  it('should return empty string for null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should transform value with suffix', () => {
    expect(pipe.transform('Hello', ' World')).toBe('Hello World');
  });
});
`
            });
            break;
        }
        case 'directive': {
            const dirClass = `${pascal}Directive`;
            files.push({
                filename: `${kebab}.directive.ts`,
                path: `${kebab}.directive.ts`,
                description: `@Directive attribute class`,
                content: `import { Directive, BaseDirective } from '@purity/core';

/**
 * ${description}
 * Usage: <div [${kebab}]="options"></div>
 */
@Directive('[${kebab}]')
export class ${dirClass} extends BaseDirective {
  protected onInit(): void {
    this.el.classList.add('${kebab}-active');
  }

  protected onChanges(newValue: unknown, oldValue: unknown): void {
    // React to attribute changes
  }

  protected onDestroy(): void {
    this.el.classList.remove('${kebab}-active');
  }
}
`
            });
            files.push({
                filename: `${kebab}.directive.spec.ts`,
                path: `${kebab}.directive.spec.ts`,
                description: `Vitest unit test for ${dirClass}`,
                content: `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ${dirClass} } from './${kebab}.directive';

describe('${dirClass}', () => {
  let element: HTMLElement;
  let directive: ${dirClass};

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
    directive = new ${dirClass}(element);
    directive['onInit']();
  });

  afterEach(() => {
    directive['onDestroy']();
    element.remove();
  });

  it('should add active class onInit', () => {
    expect(element.classList.contains('${kebab}-active')).toBe(true);
  });

  it('should remove active class onDestroy', () => {
    directive['onDestroy']();
    expect(element.classList.contains('${kebab}-active')).toBe(false);
  });
});
`
            });
            break;
        }
        case 'validator': {
            const valClass = `${pascal}Validator`;
            files.push({
                filename: `${kebab}.validator.ts`,
                path: `${kebab}.validator.ts`,
                description: `@Validator decoupled validation class`,
                content: `import { Validator, BaseValidator } from '@purity/core';

/**
 * ${description}
 */
@Validator({
  form: '#${kebab}Form',
  fields: {
    title: ['required', 'minLength:3'],
    email: ['required', 'email'],
  },
})
export class ${valClass} extends BaseValidator {
  // Custom validation rule for title
  validateTitle(value: string, element?: HTMLElement): boolean {
    if (!value || value.trim().length < 3) {
      this.setFieldError('title', 'Title must be at least 3 characters.');
      return false;
    }
    this.clearFieldError('title');
    return true;
  }
}
`
            });
            files.push({
                filename: `${kebab}.validator.spec.ts`,
                path: `${kebab}.validator.spec.ts`,
                description: `Vitest unit test for ${valClass}`,
                content: `import { describe, it, expect } from 'vitest';
import { ${valClass} } from './${kebab}.validator';

describe('${valClass}', () => {
  it('should instantiate and validate field rules', () => {
    const validator = new ${valClass}();
    expect(validator.validateTitle('ab')).toBe(false);
    expect(validator.validateTitle('Valid Title')).toBe(true);
  });
});
`
            });
            break;
        }
        case 'interceptor': {
            const interceptorClass = `${pascal}Interceptor`;
            files.push({
                filename: `${kebab}.interceptor.ts`,
                path: `${kebab}.interceptor.ts`,
                description: `Centralized HttpInterceptor class`,
                content: `import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse } from '@purity/core';

/**
 * ${description}
 * Centralized under @interceptors/*
 */
export class ${interceptorClass} implements HttpInterceptor {
  async intercept(req: HttpRequest, next: HttpHandler): Promise<HttpResponse> {
    const startTime = Date.now();

    // Transform request (e.g. inject headers)
    const clonedReq = req.clone({
      headers: req.headers.set('X-Custom-Client', 'Purity-Client'),
    });

    try {
      const response = await next.handle(clonedReq);
      const elapsed = Date.now() - startTime;
      // Handle response telemetry if needed
      return response;
    } catch (error) {
      // Handle normalized error
      throw error;
    }
  }
}
`
            });
            files.push({
                filename: `${kebab}.interceptor.spec.ts`,
                path: `${kebab}.interceptor.spec.ts`,
                description: `Vitest unit test for ${interceptorClass}`,
                content: `import { describe, it, expect } from 'vitest';
import { ${interceptorClass} } from './${kebab}.interceptor';
import { HttpRequest, HttpResponse, HttpHeaders } from '@purity/core';

describe('${interceptorClass}', () => {
  const interceptor = new ${interceptorClass}();

  it('should attach custom header and pass through', async () => {
    const req = new HttpRequest('GET', '/test', null, new HttpHeaders());
    const mockHandler = {
      handle: async (modifiedReq: HttpRequest) => {
        expect(modifiedReq.headers.get('X-Custom-Client')).toBe('Purity-Client');
        return new HttpResponse(200, { ok: true });
      },
    };

    const res = await interceptor.intercept(req, mockHandler);
    expect(res.status).toBe(200);
  });
});
`
            });
            break;
        }
        case 'behavior': {
            files.push({
                filename: `${kebab}.behavior.ts`,
                path: `${kebab}.behavior.ts`,
                description: `Composable DOM behavior function`,
                content: `export interface ${pascal}Options {
  activeClass?: string;
  onTrigger?: () => void;
}

/**
 * ${description}
 * Composable behavior under @behaviors/*
 */
export function ${toKebabCase(rawName).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}(
  element: HTMLElement,
  options: ${pascal}Options = {}
): { destroy(): void } {
  const activeClass = options.activeClass || 'is-active';

  const handleClick = () => {
    element.classList.toggle(activeClass);
    options.onTrigger?.();
  };

  element.addEventListener('click', handleClick);

  return {
    destroy(): void {
      element.removeEventListener('click', handleClick);
      element.classList.remove(activeClass);
    },
  };
}
`
            });
            files.push({
                filename: `${kebab}.behavior.spec.ts`,
                path: `${kebab}.behavior.spec.ts`,
                description: `Vitest unit test for behavior`,
                content: `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ${toKebabCase(rawName).replace(/-([a-z])/g, (_, c) => c.toUpperCase())} } from './${kebab}.behavior';

describe('${kebab} behavior', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should toggle class on click and clean up on destroy', () => {
    const cleanup = ${toKebabCase(rawName).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}(element);
    element.click();
    expect(element.classList.contains('is-active')).toBe(true);

    cleanup.destroy();
    expect(element.classList.contains('is-active')).toBe(false);
  });
});
`
            });
            break;
        }
        case 'page': {
            const pageClass = `${pascal}Page`;
            files.push({
                filename: `${kebab}.page.ts`,
                path: `${kebab}/${kebab}.page.ts`,
                description: `Page component with SeoService integration`,
                content: `import { Component, inject } from '@purity/core';
import { SeoService } from '@purity/core';

/**
 * ${description}
 */
@Component({
  selector: '${selector}-page',
  templateUrl: './${kebab}.page.html',
})
export class ${pageClass} {
  private seo = inject(SeoService);

  protected onInit(): void {
    this.seo.setTitle('${pascal} - Purity');
    this.seo.setDescription('${description}');
  }
}
`
            });
            files.push({
                filename: `${kebab}.page.html`,
                path: `${kebab}/${kebab}.page.html`,
                description: `HTML template for page`,
                content: `<div class="page-container">
  <header class="page-header">
    <h1 class="page-title">${pascal}</h1>
    <p class="page-subtitle">${description}</p>
  </header>

  <main class="page-content">
    <div class="adwaita-card">
      <p>Welcome to ${pascal} page view.</p>
    </div>
  </main>
</div>
`
            });
            files.push({
                filename: `${kebab}.page.scss`,
                path: `${kebab}/${kebab}.page.scss`,
                description: `SCSS styles for page`,
                content: `@use '@styles' as *;

.page-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-foreground);
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--color-foreground-muted);
    }
  }

  .adwaita-card {
    background: var(--gnome-card);
    backdrop-filter: var(--blur-effect);
    border: 1px solid var(--gnome-border);
    border-radius: var(--radius-card);
    padding: 1.5rem;
  }
}
`
            });
            files.push({
                filename: `${kebab}.page.spec.ts`,
                path: `${kebab}/${kebab}.page.spec.ts`,
                description: `Vitest unit test for page`,
                content: `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import './${kebab}.page';
import { ${pageClass} } from './${kebab}.page';

describe('${pageClass}', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('${selector}-page');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should instantiate page component', () => {
    expect(element).toBeDefined();
  });
});
`
            });
            break;
        }
    }
    return { files, selector: type === 'component' ? selector : type === 'page' ? `${selector}-page` : undefined };
}
//# sourceMappingURL=templates.js.map