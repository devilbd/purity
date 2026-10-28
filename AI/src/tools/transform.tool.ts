import { z } from 'zod';
import { convertToPurityTemplate, TemplateConversionResult } from '../utils/template-converter.js';

export const transformTemplateSchema = {
  template: z.string().describe('HTML template string with foreign framework syntax (Angular, Vue, etc.) to convert into idiomatic Purity syntax'),
};

export async function handleTransformTemplate(params: {
  template: string;
}): Promise<TemplateConversionResult> {
  return convertToPurityTemplate(params.template);
}
