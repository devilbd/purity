import { defineConfig, type Plugin } from 'vite';
import path from 'path';

/**
 * Vite plugin to transpile class decorators into standard ES expressions for browsers
 * and inline HTML templates for instant synchronous rendering.
 */
function decoratorsPlugin(): Plugin {
    return {
        name: 'purity-decorators-plugin',
        enforce: 'pre',
        transform(code, id) {
            if (!id.endsWith('.ts') && !id.endsWith('.js')) return null;
            if (!code.includes('@')) return null;

            let modified = false;
            const statementsToAppend: string[] = [];
            const rawImports: string[] = [];
            let tplCounter = 0;

            // Automatically inline component templates for instant synchronous mounting
            let processedCode = code.replace(
                /@Component\s*\(\s*\{([\s\S]*?)\}\s*\)/g,
                (match, inner) => {
                    const urlMatch = inner.match(/templateUrl\s*:\s*['"]([^'"]+)['"]/);
                    if (urlMatch) {
                        const url = urlMatch[1];
                        const fileDir = path.dirname(id);
                        let importPath = url;
                        if (url.startsWith('./src/')) {
                            const absTarget = path.resolve(process.cwd(), url);
                            let rel = path.relative(fileDir, absTarget);
                            if (!rel.startsWith('.')) rel = './' + rel;
                            importPath = rel;
                        }
                        const varName = '__purity_tpl_' + (tplCounter++);
                        rawImports.push(`import ${varName} from '${importPath}?raw';`);
                        const newInner = inner.replace(
                            urlMatch[0],
                            `templateUrl: '${url}', template: ${varName}`,
                        );
                        return `@Component({${newInner}})`;
                    }
                    return match;
                },
            );

            // Match patterns like:
            // @Decorator(...) export class Foo
            // export @Decorator(...) class Foo
            // @Decorator(...) class Foo
            const transformed = processedCode.replace(
                /(?:@([a-zA-Z0-9_$]+(?:\([^)]*\))?)\s*(?:\r?\n\s*)?export\s+class\s+([a-zA-Z0-9_$]+)|export\s+@([a-zA-Z0-9_$]+(?:\([^)]*\))?)\s*(?:\r?\n\s*)?class\s+([a-zA-Z0-9_$]+)|@([a-zA-Z0-9_$]+(?:\([^)]*\))?)\s*(?:\r?\n\s*)?class\s+([a-zA-Z0-9_$]+))/g,
                (match, d1, c1, d2, c2, d3, c3) => {
                    const decorator = d1 || d2 || d3;
                    const className = c1 || c2 || c3;
                    const isExport = match.includes('export');

                    // If decorator is @Injectable() or @Injectable('Name') -> decoratorCall is Injectable('Name')
                    // If decorator is @Injectable (without parentheses) -> decoratorCall is Injectable
                    const decoratorCall = decorator.endsWith(')') ? decorator : `${decorator}()`;

                    statementsToAppend.push(`${decoratorCall}(${className});`);
                    modified = true;

                    return `${isExport ? 'export ' : ''}class ${className}`;
                },
            );

            if (!modified && rawImports.length === 0) return null;

            const prefix = rawImports.length > 0 ? rawImports.join('\n') + '\n' : '';
            return {
                code: `${prefix}${transformed}\n${statementsToAppend.join('\n')}\n`,
                map: null,
            };
        },
    };
}

function environmentPlugin(isProd: boolean): Plugin {
    return {
        name: 'purity-environment-plugin',
        enforce: 'pre',
        resolveId(source, importer) {
            if (
                isProd &&
                (source.endsWith('environments/environment') ||
                    source.endsWith('environments/environment.ts') ||
                    source === './environments/environment' ||
                    source === '../environments/environment')
            ) {
                return path.resolve(
                    import.meta.dirname,
                    'src/environments/environment.prod.ts',
                );
            }
            return null;
        },
    };
}

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';

    return {
        plugins: [decoratorsPlugin(), environmentPlugin(isProd)],
        resolve: {
            alias: {
                '@purity/core': path.resolve(import.meta.dirname, 'src/framework/core.ts'),
                '@purity': path.resolve(import.meta.dirname, 'src/framework'),
                '@environments': path.resolve(import.meta.dirname, 'src/environments'),
            },
        },
    };
});
