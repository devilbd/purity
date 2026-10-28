export function convertToPurityTemplate(sourceHtml) {
    let result = sourceHtml;
    const transformations = [];
    const suggestedStyles = [];
    // 1. Angular *ngFor with index: *ngFor="let item of items; let i = index" -> for="let item, i of items"
    result = result.replace(/\*ngFor\s*=\s*["']let\s+([a-zA-Z0-9_$]+)\s+of\s+([a-zA-Z0-9_$.()]+);\s*let\s+([a-zA-Z0-9_$]+)\s*=\s*index["']/gi, (match, item, list, index) => {
        const converted = `for="let ${item}, ${index} of ${list}"`;
        transformations.push({
            type: 'structural-repeater',
            original: match,
            converted,
            description: `Converted Angular *ngFor with index to Purity for directive`,
        });
        return converted;
    });
    // 2. Angular *ngFor simple: *ngFor="let item of items" -> for="let item of items"
    result = result.replace(/\*ngFor\s*=\s*["']let\s+([a-zA-Z0-9_$]+)\s+of\s+([a-zA-Z0-9_$.()]+)["']/gi, (match, item, list) => {
        const converted = `for="let ${item} of ${list}"`;
        transformations.push({
            type: 'structural-repeater',
            original: match,
            converted,
            description: `Converted Angular *ngFor to Purity for directive`,
        });
        return converted;
    });
    // 3. Vue v-for with index: v-for="(item, index) in items" -> for="let item, index of items"
    result = result.replace(/v-for\s*=\s*["']\(\s*([a-zA-Z0-9_$]+)\s*,\s*([a-zA-Z0-9_$]+)\s*\)\s+in\s+([a-zA-Z0-9_$.()]+)["']/gi, (match, item, index, list) => {
        const converted = `for="let ${item}, ${index} of ${list}"`;
        transformations.push({
            type: 'structural-repeater',
            original: match,
            converted,
            description: `Converted Vue v-for with index to Purity for directive`,
        });
        return converted;
    });
    // 4. Vue v-for simple: v-for="item in items" -> for="let item of items"
    result = result.replace(/v-for\s*=\s*["']([a-zA-Z0-9_$]+)\s+in\s+([a-zA-Z0-9_$.()]+)["']/gi, (match, item, list) => {
        const converted = `for="let ${item} of ${list}"`;
        transformations.push({
            type: 'structural-repeater',
            original: match,
            converted,
            description: `Converted Vue v-for to Purity for directive`,
        });
        return converted;
    });
    // 5. Angular *ngIf -> if="expr"
    result = result.replace(/\*ngIf\s*=\s*["']([^"']+)["']/gi, (match, expr) => {
        const converted = `if="${expr}"`;
        transformations.push({
            type: 'structural-conditional',
            original: match,
            converted,
            description: `Converted Angular *ngIf to Purity if directive`,
        });
        return converted;
    });
    // 6. Vue v-if -> if="expr"
    result = result.replace(/v-if\s*=\s*["']([^"']+)["']/gi, (match, expr) => {
        const converted = `if="${expr}"`;
        transformations.push({
            type: 'structural-conditional',
            original: match,
            converted,
            description: `Converted Vue v-if to Purity if directive`,
        });
        return converted;
    });
    // 7. Vue v-else-if -> else-if="expr"
    result = result.replace(/v-else-if\s*=\s*["']([^"']+)["']/gi, (match, expr) => {
        const converted = `else-if="${expr}"`;
        transformations.push({
            type: 'structural-conditional',
            original: match,
            converted,
            description: `Converted Vue v-else-if to Purity else-if directive`,
        });
        return converted;
    });
    // 8. Vue v-else -> else
    result = result.replace(/\bv-else\b/gi, match => {
        const converted = `else`;
        transformations.push({
            type: 'structural-conditional',
            original: match,
            converted,
            description: `Converted Vue v-else to Purity else directive`,
        });
        return converted;
    });
    // 9. Angular event bindings: (click)="handler()" -> onclick="handler()"
    result = result.replace(/\(([a-zA-Z0-9_$]+)\)\s*=\s*["']([^"']+)["']/gi, (match, eventName, handler) => {
        const converted = `on${eventName.toLowerCase()}="${handler}"`;
        transformations.push({
            type: 'event-binding',
            original: match,
            converted,
            description: `Converted Angular (${eventName}) to standard HTML on${eventName.toLowerCase()}`,
        });
        return converted;
    });
    // 10. Vue event bindings: @click="handler" -> onclick="handler"
    result = result.replace(/@([a-zA-Z0-9_$]+)\s*=\s*["']([^"']+)["']/gi, (match, eventName, handler) => {
        const converted = `on${eventName.toLowerCase()}="${handler}"`;
        transformations.push({
            type: 'event-binding',
            original: match,
            converted,
            description: `Converted Vue @${eventName} to standard HTML on${eventName.toLowerCase()}`,
        });
        return converted;
    });
    // 11. Angular two-way binding / Vue model: [(ngModel)]="val" or v-model="val"
    result = result.replace(/(?:\[\(ngModel\)\]|v-model)\s*=\s*["']([a-zA-Z0-9_$]+)["']/gi, (match, prop) => {
        const converted = `value="{{ ${prop}() }}" oninput="${prop}.set(this.value)"`;
        transformations.push({
            type: 'two-way-model',
            original: match,
            converted,
            description: `Converted two-way model binding to Purity value interpolation and signal.set() handler`,
        });
        return converted;
    });
    // 12. Angular property binding: [prop]="expr" -> prop="{{ expr() }}"
    result = result.replace(/\[([a-zA-Z0-9_$-]+)\]\s*=\s*["']([^"']+)["']/gi, (match, prop, expr) => {
        // Avoid double interpolation if already has {{ }}
        const cleanExpr = expr.trim().startsWith('{{') ? expr : `{{ ${expr} }}`;
        const converted = `${prop}="${cleanExpr}"`;
        transformations.push({
            type: 'property-binding',
            original: match,
            converted,
            description: `Converted Angular property binding [${prop}] to Purity attribute interpolation`,
        });
        return converted;
    });
    // 13. Detect and extract inline styles into suggestions
    result = result.replace(/\bstyle\s*=\s*["']([^"']+)["']/gi, (match, cssRules) => {
        suggestedStyles.push(cssRules);
        transformations.push({
            type: 'inline-style-stripped',
            original: match,
            converted: ``,
            description: `Stripped inline style. Moved rules to recommended SCSS styling.`,
        });
        return '';
    });
    // 14. Clean up any double spaces created by deletions
    result = result.replace(/\s{2,}/g, ' ');
    return {
        convertedTemplate: result,
        transformations,
        suggestedStyles,
    };
}
//# sourceMappingURL=template-converter.js.map