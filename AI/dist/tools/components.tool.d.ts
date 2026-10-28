import { z } from 'zod';
import { ComponentMetadata } from '../types.js';
export declare const lookupComponentSchema: {
    query: z.ZodString;
};
export declare const listComponentsSchema: {
    category: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        all: "all";
        core: "core";
        form: "form";
        layout: "layout";
        navigation: "navigation";
        overlay: "overlay";
        widget: "widget";
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