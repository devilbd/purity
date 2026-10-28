import { z } from 'zod';
import { DOCUMENTATION } from '../data/documentation.js';
export const docsSchema = {
    topic: z.enum([
        'overview',
        'signals',
        'components',
        'templates',
        'repeaters',
        'virtual-for',
        'conditionals',
        'slots',
        'di',
        'http',
        'interceptors',
        'pipes',
        'directives',
        'validators',
        'behaviors',
        'router',
        'seo',
        'design-system',
        'cursors',
        'styling',
        'testing',
        'rules',
    ]).describe('Topic to retrieve documentation for'),
    detail: z.enum(['full', 'summary', 'examples']).optional().default('full').describe('Detail level desired'),
};
export async function handleDocs(params) {
    const { topic, detail = 'full' } = params;
    const entry = DOCUMENTATION[topic];
    if (!entry) {
        throw new Error(`Documentation for topic "${topic}" not found.`);
    }
    if (detail === 'summary') {
        return {
            topic: entry.topic,
            title: entry.title,
            summary: entry.summary,
            examples: entry.examples.slice(0, 1),
        };
    }
    if (detail === 'examples') {
        return {
            topic: entry.topic,
            title: entry.title,
            summary: entry.summary,
            examples: entry.examples,
        };
    }
    return {
        topic: entry.topic,
        title: entry.title,
        summary: entry.summary,
        content: entry.content,
        examples: entry.examples,
    };
}
//# sourceMappingURL=docs.tool.js.map