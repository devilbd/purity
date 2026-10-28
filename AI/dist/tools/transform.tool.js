import { z } from 'zod';
import { convertToPurityTemplate } from '../utils/template-converter.js';
export const transformTemplateSchema = {
    template: z.string().describe('HTML template string with foreign framework syntax (Angular, Vue, etc.) to convert into idiomatic Purity syntax'),
};
export async function handleTransformTemplate(params) {
    return convertToPurityTemplate(params.template);
}
//# sourceMappingURL=transform.tool.js.map