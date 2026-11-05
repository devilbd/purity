import { z } from 'zod';
import { ComponentMetadata } from '../types.js';
export declare const lookupComponentSchema: {
    query: z.ZodString;
};
export declare const listComponentsSchema: {
    category: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        core: "core";
        overlay: "overlay";
        form: "form";
        navigation: "navigation";
        widget: "widget";
        layout: "layout";
        all: "all";
    }>>>;
};
export declare function handleLookupComponent(params: {
    query: string;
}): Promise<ComponentMetadata | {
    message: string;
    suggestions: string[];
}>;
export declare function handleListComponents(params: {
    category?: string;
}): Promise<{
    total: number;
    components: Array<{
        name: string;
        selector: string;
        category: string;
        description: string;
    }>;
}>;
//# sourceMappingURL=components.tool.d.ts.map