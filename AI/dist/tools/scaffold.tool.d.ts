import { z } from 'zod';
import { ScaffoldType, ScaffoldResult } from '../types.js';
export declare const scaffoldSchema: {
    type: z.ZodEnum<{
        component: "component";
        service: "service";
        pipe: "pipe";
        directive: "directive";
        validator: "validator";
        interceptor: "interceptor";
        behavior: "behavior";
        page: "page";
    }>;
    name: z.ZodString;
    selector: z.ZodOptional<z.ZodString>;
    targetDir: z.ZodOptional<z.ZodString>;
    writeToDisk: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    description: z.ZodOptional<z.ZodString>;
};
export declare function handleScaffold(params: {
    type: ScaffoldType;
    name: string;
    selector?: string;
    targetDir?: string;
    writeToDisk?: boolean;
    description?: string;
}): Promise<ScaffoldResult>;
//# sourceMappingURL=scaffold.tool.d.ts.map