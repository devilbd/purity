import { z } from 'zod';
import { ValidationResult } from '../types.js';
export declare const validateSchema: {
    code: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    fileName: z.ZodOptional<z.ZodString>;
};
export declare function handleValidate(params: {
    code?: string;
    filePath?: string;
    fileName?: string;
}): Promise<ValidationResult>;
//# sourceMappingURL=validate.tool.d.ts.map