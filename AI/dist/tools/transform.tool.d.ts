import { z } from 'zod';
import { TemplateConversionResult } from '../utils/template-converter.js';
export declare const transformTemplateSchema: {
    template: z.ZodString;
};
export declare function handleTransformTemplate(params: {
    template: string;
}): Promise<TemplateConversionResult>;
//# sourceMappingURL=transform.tool.d.ts.map