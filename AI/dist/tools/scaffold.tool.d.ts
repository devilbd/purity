import { z } from 'zod';
import { ScaffoldType, ScaffoldResult } from '../types.js';
export declare const scaffoldSchema: {
    type: z.ZodEnum<{
        behavior: "behavior";
        component: "component";
        directive: "directive";
        interceptor: "interceptor";
        page: "page";
        pipe: "pipe";
        service: "service";
        validator: "validator";
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