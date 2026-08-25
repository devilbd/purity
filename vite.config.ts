import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

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

            // 1. Mask comments and string literals (template literals, single/double quoted strings)
            // to prevent matching decorators inside comments, code sample strings, or regexes
            const stringLiterals: string[] = [];
            const placeholderCode = code.replace(
                /(\/\*[\s\S]*?\*\/|\/\/[^\n\r]*|`(?:\\`|[\s\S])*?`|"(?:\\"|[^"\n\r])*"|'(?:\\'|[^'\n\r])*')/g,
                (match) => {
                    const placeholder = `__PURITY_MASKED_STR_${stringLiterals.length}__`;
                    stringLiterals.push(match);
                    return placeholder;
                },
            );

            // 2. Automatically inline component templates for instant synchronous mounting
            let processedCode = placeholderCode.replace(
                /@Component\s*\(\s*\{([\s\S]*?)\}\s*\)\s*(?:\r?\n\s*)?(export\s+class|class)\s+([a-zA-Z0-9_$]+)/g,
                (match, inner, classKeyword, className) => {
                    // Temporarily unmask strings inside component config to extract templateUrl
                    const unmaskedInner = inner.replace(
                        /__PURITY_MASKED_STR_(\d+)__/g,
                        (_: string, idx: string) => stringLiterals[Number(idx)],
                    );
                    const urlMatch = unmaskedInner.match(/templateUrl\s*:\s*['"]([^'"]+)['"]/);
                    if (urlMatch) {
                        const url = urlMatch[1];
                        const fileDir = path.dirname(id);
                        let absTarget = url.startsWith('./src/')
                            ? path.resolve(process.cwd(), url)
                            : path.resolve(fileDir, url);

                        if (!fs.existsSync(absTarget) && url.startsWith('@')) {
                            const resolvedPath = url
                                .replace(/^@pages\//, 'src/app/pages/')
                                .replace(/^@components\//, 'src/app/shared/components/')
                                .replace(/^@widgets\//, 'src/app/shared/widgets/')
                                .replace(/^@app\//, 'src/app/');
                            absTarget = path.resolve(process.cwd(), resolvedPath);
                        }

                        if (fs.existsSync(absTarget)) {
                            let rel = path.relative(fileDir, absTarget);
                            if (!rel.startsWith('.')) rel = './' + rel;
                            const varName = '__purity_tpl_' + (tplCounter++);
                            rawImports.push(`import ${varName} from '${rel}?raw';`);
                            const newInner = inner.replace(
                                /templateUrl\s*:\s*__PURITY_MASKED_STR_\d+__/,
                                `templateUrl: '${url}', template: ${varName}`,
                            );
                            return `@Component({${newInner}})\n${classKeyword} ${className}`;
                        }
                    }
                    return match;
                },
            );

            // 3. Match real class decorators
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
            const rawCombined = `${prefix}${transformed}\n${statementsToAppend.join('\n')}\n`;

            // 4. Restore all masked string literals across the entire code output
            const finalCode = rawCombined.replace(
                /__PURITY_MASKED_STR_(\d+)__/g,
                (_, idx) => stringLiterals[Number(idx)],
            );

            return {
                code: finalCode,
                map: null,
            };
        },
    };
}

function environmentPlugin(isProd: boolean): Plugin {
    return {
        name: 'purity-environment-plugin',
        enforce: 'pre',
        resolveId(source) {
            if (
                isProd &&
                (source.endsWith('environments/environment') ||
                    source.endsWith('environments/environment.ts') ||
                    source === './environments/environment' ||
                    source === '../environments/environment' ||
                    source === '@environments/environment' ||
                    source === '@environments')
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
                '@data': path.resolve(import.meta.dirname, 'src/data'),
                '@pages': path.resolve(import.meta.dirname, 'src/app/pages'),
                '@shared': path.resolve(import.meta.dirname, 'src/app/shared'),
                '@components': path.resolve(import.meta.dirname, 'src/app/shared/components'),
                '@widgets': path.resolve(import.meta.dirname, 'src/app/shared/widgets'),
                '@directives': path.resolve(import.meta.dirname, 'src/app/shared/directives'),
                '@pipes': path.resolve(import.meta.dirname, 'src/app/shared/pipes'),
                '@validators': path.resolve(import.meta.dirname, 'src/app/shared/validators'),
                '@behaviors': path.resolve(import.meta.dirname, 'src/app/shared/behaviors'),
                '@interceptors': path.resolve(import.meta.dirname, 'src/app/shared/interceptors'),
                '@app': path.resolve(import.meta.dirname, 'src/app'),
                '@styles': path.resolve(import.meta.dirname, 'src/styles/index.scss'),
            },
        },
        build: {
            chunkSizeWarningLimit: 800,
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        if (id.includes('node_modules/sucrase') || id.includes('node_modules/prismjs')) {
                            return 'vendor-compiler';
                        }
                    },
                },
            },
        },
    };
});
