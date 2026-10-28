import { z } from 'zod';
import { ProjectHealthReport } from '../types.js';
export declare const inspectSchema: {
    projectRoot: z.ZodOptional<z.ZodString>;
};
export declare function handleInspect(params: {
    projectRoot?: string;
}): Promise<ProjectHealthReport>;
//# sourceMappingURL=inspect.tool.d.ts.map