/**
 * Purity MCP Server - Shared Types and Interfaces
 */
export type ScaffoldType = 'component' | 'service' | 'pipe' | 'directive' | 'validator' | 'interceptor' | 'behavior' | 'page';
export interface ScaffoldOptions {
    name: string;
    type: ScaffoldType;
    selector?: string;
    targetDir?: string;
    writeToDisk?: boolean;
    description?: string;
}
export interface GeneratedFile {
    path: string;
    filename: string;
    content: string;
    description: string;
}
export interface ScaffoldResult {
    success: boolean;
    type: ScaffoldType;
    name: string;
    selector?: string;
    files: GeneratedFile[];
    writtenToDisk: boolean;
    instructions: string;
}
export type IssueSeverity = 'error' | 'warning' | 'info';
export interface ValidationIssue {
    rule: string;
    severity: IssueSeverity;
    line?: number;
    column?: number;
    message: string;
    codeSnippet?: string;
    suggestion: string;
    fix?: string;
}
export interface ValidationResult {
    valid: boolean;
    score: number;
    issues: ValidationIssue[];
    summary: {
        errors: number;
        warnings: number;
        infos: number;
    };
    formattedReport: string;
}
export interface ComponentMetadata {
    name: string;
    selector: string;
    description: string;
    category: 'core' | 'overlay' | 'form' | 'navigation' | 'widget' | 'layout';
    inputs: Array<{
        name: string;
        type: string;
        description: string;
        default?: string;
    }>;
    signals: Array<{
        name: string;
        type: string;
        description: string;
    }>;
    methods: Array<{
        name: string;
        signature: string;
        description: string;
    }>;
    events: Array<{
        name: string;
        description: string;
    }>;
    slots: Array<{
        name: string;
        description: string;
    }>;
    htmlExample: string;
    typescriptExample: string;
}
export interface DiscoveredArtifact {
    name: string;
    type: 'component' | 'service' | 'directive' | 'pipe' | 'validator' | 'interceptor' | 'behavior';
    selector?: string;
    path: string;
    hasTemplate: boolean;
    hasStyles: boolean;
    hasTests: boolean;
}
export interface ProjectHealthReport {
    frameworkVersion: string;
    isPurityProject: boolean;
    totalComponents: number;
    totalServices: number;
    totalDirectives: number;
    totalPipes: number;
    totalValidators: number;
    totalInterceptors: number;
    artifacts: DiscoveredArtifact[];
    healthScore: number;
    suggestions: string[];
}
export type DocTopic = 'overview' | 'signals' | 'components' | 'templates' | 'repeaters' | 'virtual-for' | 'conditionals' | 'slots' | 'di' | 'http' | 'interceptors' | 'pipes' | 'directives' | 'validators' | 'behaviors' | 'router' | 'seo' | 'design-system' | 'cursors' | 'styling' | 'testing' | 'rules';
//# sourceMappingURL=types.d.ts.map