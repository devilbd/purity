import { GeneratedFile, ScaffoldType } from '../types.js';
export declare function toPascalCase(str: string): string;
export declare function toKebabCase(str: string): string;
export declare function generateScaffoldFiles(type: ScaffoldType, rawName: string, options?: {
    selector?: string;
    description?: string;
}): {
    files: GeneratedFile[];
    selector?: string;
};
//# sourceMappingURL=templates.d.ts.map