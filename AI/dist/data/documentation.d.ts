import { DocTopic } from '../types.js';
export interface DocEntry {
    topic: DocTopic;
    title: string;
    summary: string;
    content: string;
    examples: string[];
}
export declare const DOCUMENTATION: Record<DocTopic, DocEntry>;
//# sourceMappingURL=documentation.d.ts.map