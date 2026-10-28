import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateScaffoldFiles } from '../data/templates.js';
import { ScaffoldType, ScaffoldResult } from '../types.js';

export const scaffoldSchema = {
  type: z.enum([
    'component',
    'service',
    'pipe',
    'directive',
    'validator',
    'interceptor',
    'behavior',
    'page',
  ]).describe('Type of Purity artifact to generate'),
  name: z.string().describe('Name of the artifact in kebab-case or PascalCase (e.g. "user-profile")'),
  selector: z.string().optional().describe('Custom element tag name (optional, defaults to kebab-case of name)'),
  targetDir: z.string().optional().describe('Directory path where files should be written (if writeToDisk is true)'),
  writeToDisk: z.boolean().optional().default(false).describe('Whether to automatically write generated files to disk'),
  description: z.string().optional().describe('Brief description of what this artifact does'),
};

export async function handleScaffold(params: {
  type: ScaffoldType;
  name: string;
  selector?: string;
  targetDir?: string;
  writeToDisk?: boolean;
  description?: string;
}): Promise<ScaffoldResult> {
  const { type, name, selector, targetDir, writeToDisk = false, description } = params;

  const { files, selector: resolvedSelector } = generateScaffoldFiles(type, name, {
    selector,
    description,
  });

  let writtenToDisk = false;

  if (writeToDisk && targetDir) {
    for (const file of files) {
      const fullPath = path.resolve(targetDir, file.path);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, file.content, 'utf-8');
    }
    writtenToDisk = true;
  }

  const instructions = [
    `Generated ${files.length} Purity ${type} file(s) for "${name}".`,
    type === 'component' || type === 'page'
      ? `• Tag: <${resolvedSelector}>\n• Inlines template synchronously via Vite (?raw)\n• Uses Adwaita design system & KDE Breeze cursors\n• Includes colocated Vitest suite`
      : `• Includes complete TypeScript types and colocated Vitest test suite.`,
    writtenToDisk
      ? `• Files saved to: ${targetDir}`
      : `• Ready to write to your workspace or integrate directly into your codebase.`,
  ].join('\n');

  return {
    success: true,
    type,
    name,
    selector: resolvedSelector,
    files,
    writtenToDisk,
    instructions,
  };
}
