import { z } from 'zod';
import { DocTopic } from '../types.js';
export declare const docsSchema: {
    topic: z.ZodEnum<{
        overview: "overview";
        signals: "signals";
        components: "components";
        templates: "templates";
        repeaters: "repeaters";
        "virtual-for": "virtual-for";
        conditionals: "conditionals";
        slots: "slots";
        di: "di";
        http: "http";
        interceptors: "interceptors";
        pipes: "pipes";
        directives: "directives";
        validators: "validators";
        behaviors: "behaviors";
        router: "router";
        seo: "seo";
        "design-system": "design-system";
        cursors: "cursors";
        styling: "styling";
        testing: "testing";
        rules: "rules";
    }>;
    detail: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        summary: "summary";
        full: "full";
        examples: "examples";
    }>>>;
};
export declare function handleDocs(params: {
    topic: DocTopic;
    detail?: 'full' | 'summary' | 'examples';
}): Promise<{
    topic: DocTopic;
    title: string;
    summary: string;
    content?: string;
    examples: string[];
}>;
//# sourceMappingURL=docs.tool.d.ts.map