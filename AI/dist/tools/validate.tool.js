import { z } from 'zod';
import * as fs from 'fs/promises';
import { analyzePurityCode } from '../utils/code-analyzer.js';
export const validateSchema = {
    code: z.string().optional().describe('Code snippet or file content to audit against Purity guidelines'),
    filePath: z.string().optional().describe('Absolute or relative path to a file on disk to validate'),
    fileName: z.string().optional().describe('Optional file name with extension (e.g. "my.component.ts", "card.component.scss") when passing raw code'),
};
export async function handleValidate(params) {
    let content = params.code || '';
    let resolvedFileName = params.fileName || 'unknown.ts';
    if (params.filePath) {
        try {
            content = await fs.readFile(params.filePath, 'utf-8');
            resolvedFileName = params.filePath;
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            return {
                valid: false,
                score: 0,
                issues: [
                    {
                        rule: 'file-read-error',
                        severity: 'error',
                        message: `Could not read file at '${params.filePath}': ${errorMsg}`,
                        suggestion: 'Verify the file path exists and is readable.',
                    },
                ],
                summary: { errors: 1, warnings: 0, infos: 0 },
                formattedReport: `### Purity Code Quality Audit\n\n❌ **Failed to read file**: \`${params.filePath}\`\n\nError: ${errorMsg}`,
            };
        }
    }
    if (!content) {
        return {
            valid: false,
            score: 0,
            issues: [
                {
                    rule: 'empty-input',
                    severity: 'error',
                    message: 'Neither `code` nor `filePath` was provided to validate.',
                    suggestion: 'Provide either a `code` string or a valid `filePath`.',
                },
            ],
            summary: { errors: 1, warnings: 0, infos: 0 },
            formattedReport: '### Purity Code Quality Audit\n\n❌ **Error**: No code or file path provided.',
        };
    }
    return analyzePurityCode(content, resolvedFileName);
}
//# sourceMappingURL=validate.tool.js.map