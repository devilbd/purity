import { describe, it, expect } from 'vitest';
import { handleScaffold } from '../src/tools/scaffold.tool.js';

describe('purity_scaffold tool', () => {
  it('should scaffold a complete component with 4 files', async () => {
    const result = await handleScaffold({
      type: 'component',
      name: 'user-profile',
      description: 'User profile display card',
    });

    expect(result.success).toBe(true);
    expect(result.name).toBe('user-profile');
    expect(result.selector).toBe('user-profile');
    expect(result.files).toHaveLength(4);

    const tsFile = result.files.find(f => f.filename === 'user-profile.component.ts');
    expect(tsFile).toBeDefined();
    expect(tsFile?.content).toContain("@Component({");
    expect(tsFile?.content).toContain("selector: 'user-profile'");
    expect(tsFile?.content).toContain("templateUrl: './user-profile.component.html'");
    expect(tsFile?.content).toContain("export class UserProfileComponent");
    expect(tsFile?.content).toContain("protected onInit(): void");
    expect(tsFile?.content).toContain("protected onDestroy(): void");
    expect(tsFile?.content).toContain("signal<string>");

    const htmlFile = result.files.find(f => f.filename === 'user-profile.component.html');
    expect(htmlFile).toBeDefined();
    expect(htmlFile?.content).toContain('user-profile-card');
    expect(htmlFile?.content).toContain('<slot>');
    expect(htmlFile?.content).toContain('if="isExpanded()"');

    const scssFile = result.files.find(f => f.filename === 'user-profile.component.scss');
    expect(scssFile).toBeDefined();
    expect(scssFile?.content).toContain("@use '@styles' as *;");
    expect(scssFile?.content).toContain('var(--gnome-card)');
    expect(scssFile?.content).toContain('var(--radius-card)');
    expect(scssFile?.content).toContain('var(--cursor-default)');
    expect(scssFile?.content).toContain('var(--cursor-pointer)');

    const specFile = result.files.find(f => f.filename === 'user-profile.component.spec.ts');
    expect(specFile).toBeDefined();
    expect(specFile?.content).toContain("describe('UserProfileComponent'");
  });

  it('should scaffold an injectable service', async () => {
    const result = await handleScaffold({
      type: 'service',
      name: 'cart',
    });

    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(2);

    const tsFile = result.files.find(f => f.filename === 'cart.service.ts');
    expect(tsFile?.content).toContain("@Injectable('CartService')");
    expect(tsFile?.content).toContain("export class CartService");
    expect(tsFile?.content).toContain("signal<CartItem[]>([])");
    expect(tsFile?.content).toContain("computed(() =>");
  });

  it('should scaffold a transform pipe', async () => {
    const result = await handleScaffold({
      type: 'pipe',
      name: 'currency-format',
    });

    expect(result.success).toBe(true);
    const tsFile = result.files.find(f => f.filename === 'currency-format.pipe.ts');
    expect(tsFile?.content).toContain("@Pipe('currency-format')");
    expect(tsFile?.content).toContain("export class CurrencyFormatPipe extends BasePipe");
    expect(tsFile?.content).toContain("transform(value: unknown, ...args: unknown[])");
  });

  it('should scaffold an attribute directive', async () => {
    const result = await handleScaffold({
      type: 'directive',
      name: 'ripple',
    });

    expect(result.success).toBe(true);
    const tsFile = result.files.find(f => f.filename === 'ripple.directive.ts');
    expect(tsFile?.content).toContain("@Directive('[ripple]')");
    expect(tsFile?.content).toContain("export class RippleDirective extends BaseDirective");
  });

  it('should scaffold a decoupled form validator', async () => {
    const result = await handleScaffold({
      type: 'validator',
      name: 'checkout',
    });

    expect(result.success).toBe(true);
    const tsFile = result.files.find(f => f.filename === 'checkout.validator.ts');
    expect(tsFile?.content).toContain("@Validator({");
    expect(tsFile?.content).toContain("export class CheckoutValidator extends BaseValidator");
  });

  it('should scaffold a centralized HTTP interceptor', async () => {
    const result = await handleScaffold({
      type: 'interceptor',
      name: 'telemetry',
    });

    expect(result.success).toBe(true);
    const tsFile = result.files.find(f => f.filename === 'telemetry.interceptor.ts');
    expect(tsFile?.content).toContain("export class TelemetryInterceptor implements HttpInterceptor");
    expect(tsFile?.content).toContain("intercept(req: HttpRequest, next: HttpHandler)");
  });

  it('should scaffold a composable DOM behavior', async () => {
    const result = await handleScaffold({
      type: 'behavior',
      name: 'collapsible',
    });

    expect(result.success).toBe(true);
    const tsFile = result.files.find(f => f.filename === 'collapsible.behavior.ts');
    expect(tsFile?.content).toContain("export function collapsible(");
    expect(tsFile?.content).toContain("destroy(): void");
  });
});
