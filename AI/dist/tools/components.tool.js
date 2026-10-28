import { z } from 'zod';
import { COMPONENT_CATALOG } from '../data/component-catalog.js';
export const lookupComponentSchema = {
    query: z.string().describe('Component tag name (e.g. "switch-button", "modal-view"), class name, or keyword'),
};
export const listComponentsSchema = {
    category: z.enum(['all', 'core', 'overlay', 'form', 'navigation', 'widget', 'layout']).optional().default('all').describe('Filter components by category'),
};
export async function handleLookupComponent(params) {
    const q = params.query.toLowerCase().trim();
    // Exact match on selector or name
    const match = COMPONENT_CATALOG.find(c => c.selector.toLowerCase() === q || c.name.toLowerCase() === q || c.name.toLowerCase().replace('component', '') === q);
    if (match) {
        return match;
    }
    // Partial match
    const partials = COMPONENT_CATALOG.filter(c => c.selector.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    if (partials.length === 1) {
        return partials[0];
    }
    return {
        message: `No exact component found for "${params.query}".`,
        suggestions: COMPONENT_CATALOG.map(c => `<${c.selector}> (${c.name})`),
    };
}
export async function handleListComponents(params) {
    const cat = params.category || 'all';
    const filtered = cat === 'all'
        ? COMPONENT_CATALOG
        : COMPONENT_CATALOG.filter(c => c.category === cat);
    return {
        total: filtered.length,
        components: filtered.map(c => ({
            name: c.name,
            selector: c.selector,
            category: c.category,
            description: c.description,
        })),
    };
}
//# sourceMappingURL=components.tool.js.map