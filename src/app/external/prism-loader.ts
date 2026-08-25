import Prism from 'prismjs';

if (typeof window !== 'undefined') {
    (window as any).Prism = Prism;
}
if (typeof globalThis !== 'undefined') {
    (globalThis as any).Prism = Prism;
}

// Setup TypeScript syntax grammar on Prism
if (Prism && Prism.languages && Prism.languages.javascript) {
    Prism.languages.typescript = Prism.languages.extend('javascript', {
        'class-name': {
            pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?/,
            lookbehind: true,
            greedy: true,
            inside: null as any,
        },
        builtin: /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown)\b/,
    });

    const tsKeywords = Prism.languages.typescript.keyword as any[];
    if (Array.isArray(tsKeywords)) {
        tsKeywords.push(
            /\b(?:abstract|declare|is|keyof|readonly|require)\b/,
            /\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
            /\btype\b(?=\s*(?:[\{*]|$))/,
        );
    }

    delete (Prism.languages.typescript as any)['parameter'];
    delete (Prism.languages.typescript as any)['literal-property'];

    const typeInside = Prism.languages.extend('typescript', {});
    delete (typeInside as any)['class-name'];

    (Prism.languages.typescript as any)['class-name'].inside = typeInside;

    Prism.languages.insertBefore('typescript', 'function', {
        decorator: {
            pattern: /@[$\w\xA0-\uFFFF]+/,
            inside: {
                at: {
                    pattern: /^@/,
                    alias: 'operator',
                },
                function: /^[\s\S]+/,
            },
        },
        'generic-function': {
            pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,
            greedy: true,
            inside: {
                function: /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,
                generic: {
                    pattern: /<[\s\S]+/,
                    alias: 'class-name',
                    inside: typeInside,
                },
            },
        },
    });

    Prism.languages.ts = Prism.languages.typescript;
}

// Setup SCSS syntax grammar on Prism
if (Prism && Prism.languages && Prism.languages.css) {
    Prism.languages.scss = Prism.languages.extend('css', {
        comment: {
            pattern: /(^|[^\\])(?:\/\*[\s\S]*?\*\/|\/\/.*)/,
            lookbehind: true,
        },
        atrule: {
            pattern: /@[\w-](?:\([^()]+\)|[^()\s]|\s+(?!\s))*?(?=\s+[{;])/,
            inside: {
                rule: /@[\w-]+/,
            },
        },
        url: /(?:[-a-z]+-)?url(?=\()/i,
        selector: {
            pattern: /(?=\S)[^@;{}()]?(?:[^@;{}()\s]|\s+(?!\s)|#\{\$[-\w]+\})+(?=\s*\{(?:\}|\s|[^}][^:{}]*[:{][^}]))/,
            inside: {
                parent: {
                    pattern: /&/,
                    alias: 'important',
                },
                placeholder: /%[-\w]+/,
                variable: /\$[-\w]+|#\{\$[-\w]+\}/,
            },
        },
        property: {
            pattern: /(?:[-\w]|\$[-\w]|#\{\$[-\w]+\})+(?=\s*:)/,
            inside: {
                variable: /\$[-\w]+|#\{\$[-\w]+\}/,
            },
        },
    });

    Prism.languages.insertBefore('scss', 'atrule', {
        keyword: [
            /@(?:content|debug|each|else(?: if)?|extend|for|forward|function|if|import|include|mixin|return|use|warn|while)\b/i,
            {
                pattern: /( )(?:from|through)(?= )/,
                lookbehind: true,
            },
        ],
    });

    Prism.languages.insertBefore('scss', 'important', {
        variable: /\$[-\w]+|#\{\$[-\w]+\}/,
    });

    Prism.languages.insertBefore('scss', 'function', {
        'module-modifier': {
            pattern: /\b(?:as|hide|show|with)\b/i,
            alias: 'keyword',
        },
        placeholder: {
            pattern: /%[-\w]+/,
            alias: 'selector',
        },
        statement: {
            pattern: /\B!(?:default|optional)\b/i,
            alias: 'keyword',
        },
        boolean: /\b(?:false|true)\b/,
        null: {
            pattern: /\bnull\b/,
            alias: 'keyword',
        },
        operator: {
            pattern: /(\s)(?:[-+*\/%]|[=!]=|<=?|>=?|and|not|or)(?=\s)/,
            lookbehind: true,
        },
    });

    if (Prism.languages.scss['atrule'] && (Prism.languages.scss['atrule'] as any).inside) {
        (Prism.languages.scss['atrule'] as any).inside.rest = Prism.languages.scss;
    }
}

export default Prism;
