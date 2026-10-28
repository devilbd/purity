import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DiscoveredArtifact, ProjectHealthReport } from '../types.js';

export const inspectSchema = {
  projectRoot: z.string().optional().describe('Root directory of the project to inspect (defaults to current working directory)'),
};

async function walkDirectory(dir: string, fileList: string[] = []): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDirectory(fullPath, fileList);
      } else {
        fileList.push(fullPath);
      }
    }
  } catch {
    // Ignore unreadable dirs
  }
  return fileList;
}

export async function handleInspect(params: { projectRoot?: string }): Promise<ProjectHealthReport> {
  const rootDir = path.resolve(params.projectRoot || process.cwd());

  let frameworkVersion = 'unknown';
  let isPurityProject = false;

  // Check package.json
  try {
    const pkgRaw = await fs.readFile(path.join(rootDir, 'package.json'), 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const hasPurity = pkg.name === 'purity' || 
                      pkg.name === 'purity-world' || 
                      deps['purity-world'] || 
                      deps['purity-world-ui'] || 
                      deps['purity'] || 
                      deps['@purity/core'];
    if (hasPurity) {
      isPurityProject = true;
      frameworkVersion = deps['purity-world'] || deps['purity'] || pkg.version || '1.0.0';
    }
  } catch {
    // No package.json
  }

  // Walk files in src
  const srcDir = path.join(rootDir, 'src');
  const allFiles = await walkDirectory(srcDir);
  const artifacts: DiscoveredArtifact[] = [];

  for (const filePath of allFiles) {
    if (!filePath.endsWith('.ts') || filePath.endsWith('.d.ts') || filePath.endsWith('.spec.ts')) {
      continue;
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const baseName = path.basename(filePath, '.ts');
      const dirName = path.dirname(filePath);

      // Check for @Component
      const compMatch = content.match(/@Component\s*\(\s*\{([^}]+)\}\s*\)\s*export\s+class\s+([a-zA-Z0-9_$]+)/);
      if (compMatch) {
        const selectorMatch = compMatch[1].match(/selector\s*:\s*['"]([^'"]+)['"]/);
        const selector = selectorMatch ? selectorMatch[1] : undefined;
        const hasTemplate = await fileExists(path.join(dirName, `${baseName}.html`));
        const hasStyles = await fileExists(path.join(dirName, `${baseName}.scss`));
        const hasTests = await fileExists(path.join(dirName, `${baseName}.spec.ts`));

        artifacts.push({
          name: compMatch[2],
          type: 'component',
          selector,
          path: path.relative(rootDir, filePath),
          hasTemplate,
          hasStyles,
          hasTests,
        });
        continue;
      }

      // Check for @Injectable / @Service
      const serviceMatch = content.match(/@(?:Injectable|Service)\s*\([^)]*\)\s*export\s+class\s+([a-zA-Z0-9_$]+)/);
      if (serviceMatch) {
        const hasTests = await fileExists(path.join(dirName, `${baseName}.spec.ts`));
        artifacts.push({
          name: serviceMatch[1],
          type: 'service',
          path: path.relative(rootDir, filePath),
          hasTemplate: false,
          hasStyles: false,
          hasTests,
        });
        continue;
      }

      // Check for @Pipe
      const pipeMatch = content.match(/@Pipe\s*\([^)]*\)\s*export\s+class\s+([a-zA-Z0-9_$]+)/);
      if (pipeMatch) {
        const hasTests = await fileExists(path.join(dirName, `${baseName}.spec.ts`));
        artifacts.push({
          name: pipeMatch[1],
          type: 'pipe',
          path: path.relative(rootDir, filePath),
          hasTemplate: false,
          hasStyles: false,
          hasTests,
        });
        continue;
      }

      // Check for @Directive
      const dirMatch = content.match(/@Directive\s*\([^)]*\)\s*export\s+class\s+([a-zA-Z0-9_$]+)/);
      if (dirMatch) {
        const hasTests = await fileExists(path.join(dirName, `${baseName}.spec.ts`));
        artifacts.push({
          name: dirMatch[1],
          type: 'directive',
          path: path.relative(rootDir, filePath),
          hasTemplate: false,
          hasStyles: false,
          hasTests,
        });
        continue;
      }

      // Check for @Validator
      const valMatch = content.match(/@Validator\s*\([^)]*\)\s*export\s+class\s+([a-zA-Z0-9_$]+)/);
      if (valMatch) {
        const hasTests = await fileExists(path.join(dirName, `${baseName}.spec.ts`));
        artifacts.push({
          name: valMatch[1],
          type: 'validator',
          path: path.relative(rootDir, filePath),
          hasTemplate: false,
          hasStyles: false,
          hasTests,
        });
        continue;
      }

      // Check for HttpInterceptor
      const interceptorMatch = content.match(/export\s+class\s+([a-zA-Z0-9_$]+)\s+implements\s+HttpInterceptor/);
      if (interceptorMatch) {
        const hasTests = await fileExists(path.join(dirName, `${baseName}.spec.ts`));
        artifacts.push({
          name: interceptorMatch[1],
          type: 'interceptor',
          path: path.relative(rootDir, filePath),
          hasTemplate: false,
          hasStyles: false,
          hasTests,
        });
        continue;
      }
    } catch {
      // Ignore read errors
    }
  }

  const totalComponents = artifacts.filter(a => a.type === 'component').length;
  const totalServices = artifacts.filter(a => a.type === 'service').length;
  const totalDirectives = artifacts.filter(a => a.type === 'directive').length;
  const totalPipes = artifacts.filter(a => a.type === 'pipe').length;
  const totalValidators = artifacts.filter(a => a.type === 'validator').length;
  const totalInterceptors = artifacts.filter(a => a.type === 'interceptor').length;

  const componentsWithTests = artifacts.filter(a => a.type === 'component' && a.hasTests).length;
  const componentsWithStyles = artifacts.filter(a => a.type === 'component' && a.hasStyles).length;

  const suggestions: string[] = [];
  let healthScore = 100;

  if (totalComponents > 0 && componentsWithTests < totalComponents) {
    const missing = totalComponents - componentsWithTests;
    suggestions.push(`${missing} component(s) are missing colocated Vitest unit tests (*.spec.ts).`);
    healthScore -= Math.min(20, missing * 5);
  }

  if (totalComponents > 0 && componentsWithStyles < totalComponents) {
    const missing = totalComponents - componentsWithStyles;
    suggestions.push(`${missing} component(s) are missing dedicated Adwaita SCSS stylesheets.`);
    healthScore -= Math.min(10, missing * 2);
  }

  if (totalComponents === 0 && totalServices === 0) {
    healthScore = 50;
    suggestions.push('No Purity components or services discovered in `src/`.');
  }

  return {
    frameworkVersion,
    isPurityProject,
    totalComponents,
    totalServices,
    totalDirectives,
    totalPipes,
    totalValidators,
    totalInterceptors,
    artifacts,
    healthScore: Math.max(0, healthScore),
    suggestions,
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
