import { z } from 'zod';
import { DOCUMENTATION, DocEntry } from '../data/documentation.js';
import { DocTopic } from '../types.js';

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

export async function handleDocs(params: {
  topic: DocTopic;
  detail?: 'full' | 'summary' | 'examples';
}): Promise<{
  topic: DocTopic;
  title: string;
  summary: string;
  content?: string;
  examples: string[];
}> {
  const { topic, detail = 'full' } = params;
  const entry: DocEntry = DOCUMENTATION[topic];

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
