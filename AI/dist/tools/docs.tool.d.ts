import { z } from 'zod';
import { DocTopic } from '../types.js';
export declare const docsSchema: {
    topic: z.ZodEnum<{
        behaviors: "behaviors";
        components: "components";
        conditionals: "conditionals";
        cursors: "cursors";
        "design-system": "design-system";
        di: "di";
        directives: "directives";
        http: "http";
        interceptors: "interceptors";
        overview: "overview";
        pipes: "pipes";
        repeaters: "repeaters";
        router: "router";
        rules: "rules";
        seo: "seo";
        signals: "signals";
        slots: "slots";
        styling: "styling";
        templates: "templates";
        testing: "testing";
        validators: "validators";
        "virtual-for": "virtual-for";
    }>;
    detail: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        examples: "examples";
        full: "full";
        summary: "summary";
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