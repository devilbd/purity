import { defineConfig, type Plugin } from 'vite';

/**
 * Vite plugin to transpile class decorators into standard ES expressions for browsers.
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

            // Match patterns like:
            // @Decorator(...) export class Foo
            // export @Decorator(...) class Foo
            // @Decorator(...) class Foo
            const transformed = code.replace(
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

            if (!modified) return null;

            return {
                code: `${transformed}\n${statementsToAppend.join('\n')}\n`,
                map: null,
            };
        },
    };
}

export default defineConfig({
    plugins: [decoratorsPlugin()],
});
