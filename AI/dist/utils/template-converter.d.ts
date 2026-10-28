export interface TemplateConversionResult {
    convertedTemplate: string;
    transformations: Array<{
        type: string;
        original: string;
        converted: string;
        description: string;
    }>;
    suggestedStyles: string[];
}
export declare function convertToPurityTemplate(sourceHtml: string): TemplateConversionResult;
//# sourceMappingURL=template-converter.d.ts.map