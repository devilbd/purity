import { ValidationIssue, ValidationResult } from '../types.js';

export function analyzePurityCode(
  code: string,
  fileName = 'unknown.ts'
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const lines = code.split('\n');
  const isScss = fileName.endsWith('.scss');
  const isHtml = fileName.endsWith('.html');
  const isTs = fileName.endsWith('.ts');

  // Rule 1: No relative parent imports (../) in TS/SCSS
  if (isTs || isScss) {
    lines.forEach((line, index) => {
      const match = line.match(/(?:from|import|@use)\s+['"][.]{2}\//);
      if (match) {
        issues.push({
          rule: 'no-relative-parent-imports',
          severity: 'error',
          line: index + 1,
          message: 'Relative parent traversal (`../`) is prohibited. Use configured path aliases.',
          codeSnippet: line.trim(),
          suggestion: 'Replace with path aliases like `@purity/core`, `@components/*`, `@shared/*`, `@styles`.',
        });
      }
    });
  }

  // Rule 2: No inline style attributes in HTML
  if (isHtml || isTs) {
    lines.forEach((line, index) => {
      const match = line.match(/\bstyle\s*=\s*["'][^"']+["']/i);
      if (match && !line.includes('data-no-bind')) {
        issues.push({
          rule: 'no-inline-styles',
          severity: 'error',
          line: index + 1,
          message: 'Inline `style="..."` attributes are strictly prohibited in Purity.',
          codeSnippet: line.trim(),
          suggestion: 'Move styles to the component SCSS file and use `@use "@styles" as *;`.',
          fix: line.replace(/\bstyle\s*=\s*["'][^"']+["']/i, ''),
        });
      }
    });
  }

  // Rule 3: No internal design system reference leakage ("GNOME 50")
  lines.forEach((line, index) => {
    // Exclude comments explaining the rule itself
    if (line.includes('NEVER output') || line.includes('internal design reference')) return;
    const match = line.match(/GNOME\s*50/i);
    if (match) {
      issues.push({
        rule: 'no-internal-design-leakage',
        severity: 'error',
        line: index + 1,
        message: '"GNOME 50" is an internal design system reference only. Never expose it in user-facing copy or code.',
        codeSnippet: line.trim(),
        suggestion: 'Replace "GNOME 50" with "Adwaita" or glassmorphic design tokens.',
        fix: line.replace(/GNOME\s*50/gi, 'Adwaita'),
      });
    }
  });

  // Rule 4: Signal mutation errors (signal = val, signal.value = val)
  if (isTs) {
    lines.forEach((line, index) => {
      // Check for .value = assignment (Vue/Angular style)
      const valAssign = line.match(/([a-zA-Z0-9_$]+)\.value\s*=/);
      if (valAssign && !line.includes('input') && !line.includes('target') && !line.includes('.nodeValue')) {
        issues.push({
          rule: 'signal-mutation-syntax',
          severity: 'error',
          line: index + 1,
          message: `Direct signal '.value =' assignment detected for '${valAssign[1]}'.`,
          codeSnippet: line.trim(),
          suggestion: `In Purity, mutate signals using '${valAssign[1]}.set(newVal)' or '${valAssign[1]}.update(fn)'.`,
          fix: line.replace(`${valAssign[1]}.value =`, `${valAssign[1]}.set(`) + ')',
        });
      }
    });
  }

  // Rule 5: SCSS files must import @styles
  if (isScss) {
    const hasStylesImport = code.includes("@use '@styles'") || code.includes('@use "@styles"');
    if (!hasStylesImport) {
      issues.push({
        rule: 'scss-missing-styles-import',
        severity: 'error',
        line: 1,
        message: "Component SCSS files must begin with `@use '@styles' as *;`.",
        codeSnippet: lines[0] || '',
        suggestion: "Add `@use '@styles' as *;` at the very top of the SCSS file.",
        fix: `@use '@styles' as *;\n\n` + code,
      });
    }
  }

  // Rule 6: Foreign framework repeater syntax (*ngFor, v-for)
  if (isHtml || isTs) {
    lines.forEach((line, index) => {
      if (line.includes('*ngFor')) {
        issues.push({
          rule: 'foreign-repeater-angular',
          severity: 'error',
          line: index + 1,
          message: 'Angular `*ngFor` syntax detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, use `for="let item of items"` or `for="let item, index of items"`.',
        });
      }
      if (line.includes('v-for=')) {
        issues.push({
          rule: 'foreign-repeater-vue',
          severity: 'error',
          line: index + 1,
          message: 'Vue `v-for` syntax detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, use `for="let item of items"` or `for="let item, index of items"`.',
        });
      }
    });
  }

  // Rule 7: Foreign framework conditional syntax (*ngIf, v-if)
  if (isHtml || isTs) {
    lines.forEach((line, index) => {
      if (line.includes('*ngIf')) {
        issues.push({
          rule: 'foreign-conditional-angular',
          severity: 'error',
          line: index + 1,
          message: 'Angular `*ngIf` syntax detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, use `if="expr"`, `else-if="expr"`, or `else`.',
        });
      }
      if (line.includes('v-if=')) {
        issues.push({
          rule: 'foreign-conditional-vue',
          severity: 'error',
          line: index + 1,
          message: 'Vue `v-if` syntax detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, use `if="expr"`, `else-if="expr"`, or `else`.',
        });
      }
    });
  }

  // Rule 8: Foreign event binding syntax ((click), @click)
  if (isHtml || isTs) {
    lines.forEach((line, index) => {
      if (line.match(/\(click\)\s*=/)) {
        issues.push({
          rule: 'foreign-event-binding',
          severity: 'error',
          line: index + 1,
          message: 'Angular `(click)` syntax detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, use standard HTML attribute `onclick="method()"`.',
        });
      }
      if (line.match(/@click\s*=/)) {
        issues.push({
          rule: 'foreign-event-binding',
          severity: 'error',
          line: index + 1,
          message: 'Vue `@click` syntax detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, use standard HTML attribute `onclick="method()"`.',
        });
      }
    });
  }

  // Rule 9: Foreign state management libraries (RxJS, Redux, Zustand, MobX)
  if (isTs) {
    lines.forEach((line, index) => {
      const match = line.match(/(?:from|import)\s+['"](rxjs|@reduxjs|redux|zustand|mobx|vue|react)['"]/);
      if (match) {
        issues.push({
          rule: 'forbidden-state-library',
          severity: 'error',
          line: index + 1,
          message: `External state library '${match[1]}' is prohibited in Purity.`,
          codeSnippet: line.trim(),
          suggestion: "Rely solely on Purity's built-in synchronous `signal`, `computed`, and `effect` from `@purity/core`.",
        });
      }
    });
  }

  // Rule 10: Foreign lifecycle hooks (ngOnInit, componentDidMount)
  if (isTs) {
    lines.forEach((line, index) => {
      if (line.match(/\bngOnInit\s*\(/)) {
        issues.push({
          rule: 'foreign-lifecycle-hook',
          severity: 'error',
          line: index + 1,
          message: 'Angular `ngOnInit` hook detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, implement `protected onInit(): void`.',
        });
      }
      if (line.match(/\bcomponentDidMount\s*\(/)) {
        issues.push({
          rule: 'foreign-lifecycle-hook',
          severity: 'error',
          line: index + 1,
          message: 'React `componentDidMount` hook detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, implement `protected onInit(): void`.',
        });
      }
      if (line.match(/\bngOnDestroy\s*\(/)) {
        issues.push({
          rule: 'foreign-lifecycle-hook',
          severity: 'error',
          line: index + 1,
          message: 'Angular `ngOnDestroy` hook detected.',
          codeSnippet: line.trim(),
          suggestion: 'In Purity, implement `protected onDestroy(): void`.',
        });
      }
    });
  }

  // Rule 11: Suggest Breeze cursor tokens in SCSS
  if (isScss) {
    lines.forEach((line, index) => {
      if (line.match(/cursor:\s*pointer\s*;/i)) {
        issues.push({
          rule: 'adwaita-cursor-token',
          severity: 'warning',
          line: index + 1,
          message: 'Hardcoded `cursor: pointer` detected.',
          codeSnippet: line.trim(),
          suggestion: 'Use KDE Plasma Breeze cursor token: `cursor: var(--cursor-pointer, pointer);`.',
          fix: line.replace('cursor: pointer;', 'cursor: var(--cursor-pointer, pointer);'),
        });
      }
      if (line.match(/cursor:\s*grab\s*;/i)) {
        issues.push({
          rule: 'adwaita-cursor-token',
          severity: 'warning',
          line: index + 1,
          message: 'Hardcoded `cursor: grab` detected.',
          codeSnippet: line.trim(),
          suggestion: 'Use KDE Plasma Breeze cursor token: `cursor: var(--cursor-grab, grab);`.',
          fix: line.replace('cursor: grab;', 'cursor: var(--cursor-grab, grab);'),
        });
      }
    });
  }

  // Calculate score and summary
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  let score = 100 - errorCount * 25 - warningCount * 10 - infoCount * 2;
  if (score < 0) score = 0;

  const valid = errorCount === 0;

  // Build formatted markdown report
  const reportLines: string[] = [];
  reportLines.push(`### Purity Code Quality Audit`);
  reportLines.push(`**Target File**: \`${fileName}\``);
  reportLines.push(`**Status**: ${valid ? '✅ PASSED' : '❌ FAILED'} | **Score**: ${score}/100`);
  reportLines.push(`**Summary**: ${errorCount} Errors, ${warningCount} Warnings, ${infoCount} Suggestions\n`);

  if (issues.length === 0) {
    reportLines.push(`✨ **Zero issues found!** The code adheres 100% to Purity framework guidelines and Adwaita standards.`);
  } else {
    reportLines.push(`| Line | Severity | Rule | Message & Recommendation |`);
    reportLines.push(`| :--- | :--- | :--- | :--- |`);
    for (const issue of issues) {
      const badge = issue.severity === 'error' ? '🔴 Error' : issue.severity === 'warning' ? '🟡 Warning' : '🔵 Info';
      const lineStr = issue.line ? `L${issue.line}` : '-';
      reportLines.push(`| ${lineStr} | ${badge} | \`${issue.rule}\` | **${issue.message}**<br>_${issue.suggestion}_ |`);
    }
  }

  return {
    valid,
    score,
    issues,
    summary: {
      errors: errorCount,
      warnings: warningCount,
      infos: infoCount,
    },
    formattedReport: reportLines.join('\n'),
  };
}
