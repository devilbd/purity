#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -euo pipefail

# ANSI color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Helper functions for high-resolution timing
get_time_ms() {
    echo $(($(date +%s%N) / 1000000))
}

format_duration() {
    local ms=$1
    if [ "$ms" -ge 60000 ]; then
        local mins=$(($ms / 60000))
        local rem_sec=$(awk "BEGIN {printf \"%.1f\", ($ms%60000)/1000}")
        echo "${mins}m ${rem_sec}s"
    else
        local seconds=$(awk "BEGIN {printf \"%.2f\", $ms/1000}")
        echo "${seconds}s"
    fi
}

# Resolve root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUTPUT_DIR="$ROOT_DIR/npm-publish"
TOTAL_START=$(get_time_ms)

echo -e "\n${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}${BLUE}      ..::: Purity :::.. Standalone NPM Package Builder         ${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}\n"

# Step 1: Clean and Prepare npm-publish directory
echo -e "${BOLD}${YELLOW}[1/6] Cleaning & Initializing Output Directory (npm-publish/)...${NC}"
STEP1_START=$(get_time_ms)
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/types" "$OUTPUT_DIR/styles" "$OUTPUT_DIR/cursors"
STEP1_END=$(get_time_ms)
echo -e "${GREEN}✓ Output directory prepared in $(format_duration $((STEP1_END - STEP1_START)))${NC}"

# Step 2: Compile Library with Vite (ESM & CJS)
echo -e "\n${BOLD}${YELLOW}[2/6] Compiling Library Bundles with Vite (ESM & CommonJS)...${NC}"
STEP2_START=$(get_time_ms)
npx vite build --config "$ROOT_DIR/vite.config.lib.ts"
STEP2_END=$(get_time_ms)
echo -e "${GREEN}✓ JavaScript bundles compiled in $(format_duration $((STEP2_END - STEP2_START)))${NC}"

# Step 3: Emit TypeScript Declaration Maps (*.d.ts)
echo -e "\n${BOLD}${YELLOW}[3/6] Emitting TypeScript Type Definitions (*.d.ts)...${NC}"
STEP3_START=$(get_time_ms)
npx tsc -p "$ROOT_DIR/tsconfig.lib.json"

# Create root convenience re-exports for TypeScript
cat << 'EOF' > "$OUTPUT_DIR/index.d.ts"
export * from './types/core';
EOF

cat << 'EOF' > "$OUTPUT_DIR/vite.d.ts"
export * from './types/vite-plugin';
EOF

STEP3_END=$(get_time_ms)
echo -e "${GREEN}✓ Type definitions generated in $(format_duration $((STEP3_END - STEP3_START)))${NC}"

# Step 4: Compile Styles & Copy Design Tokens
echo -e "\n${BOLD}${YELLOW}[4/6] Compiling Adwaita Styles & Assets...${NC}"
STEP4_START=$(get_time_ms)
npx sass "$ROOT_DIR/src/style.scss" "$OUTPUT_DIR/style.css" --style compressed
cp -r "$ROOT_DIR/src/styles/"* "$OUTPUT_DIR/styles/"
if [ -d "$ROOT_DIR/public/cursors" ]; then
    cp -r "$ROOT_DIR/public/cursors/"* "$OUTPUT_DIR/cursors/"
fi
STEP4_END=$(get_time_ms)
echo -e "${GREEN}✓ Styles and design assets packaged in $(format_duration $((STEP4_END - STEP4_START)))${NC}"

# Step 5: Generate NPM Package Manifest & Documentation
echo -e "\n${BOLD}${YELLOW}[5/6] Generating NPM Package Manifest (package.json) & Docs...${NC}"
STEP5_START=$(get_time_ms)

# Extract version from root package.json if available
VERSION=$(node -p "try { require('./package.json').version } catch(e) { '1.0.0' }")

cat << EOF > "$OUTPUT_DIR/package.json"
{
  "name": "purity-world",
  "version": "${VERSION}",
  "description": "Lightweight, native TypeScript frontend framework built on Custom Elements v1, fine-grained synchronous signals, and Adwaita design system",
  "type": "module",
  "main": "./index.cjs",
  "module": "./index.js",
  "types": "./index.d.ts",
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "import": "./index.js",
      "require": "./index.cjs"
    },
    "./vite": {
      "types": "./vite.d.ts",
      "import": "./vite.js",
      "require": "./vite.cjs"
    },
    "./styles": "./style.css",
    "./styles/*": "./styles/*",
    "./cursors/*": "./cursors/*"
  },
  "files": [
    "index.js",
    "index.cjs",
    "index.d.ts",
    "vite.js",
    "vite.cjs",
    "vite.d.ts",
    "types",
    "style.css",
    "styles",
    "cursors",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "signals",
    "reactivity",
    "web-components",
    "custom-elements",
    "framework",
    "typescript",
    "http-client",
    "virtual-scroll",
    "router",
    "adwaita"
  ],
  "author": "Purity Contributors",
  "license": "MIT",
  "peerDependencies": {
    "vite": ">=5.0.0"
  },
  "peerDependenciesMeta": {
    "vite": {
      "optional": true
    }
  }
}
EOF

cat << 'EOF' > "$OUTPUT_DIR/README.md"
# Purity Framework

A lightweight, native TypeScript frontend framework built directly on web standards:
- **Fine-Grained Synchronous Reactivity**: Signals (`signal`, `computed`, `effect`, `untrack`) with sub-microsecond synchronous updates and automatic dependency tracking.
- **Native Web Components**: Plain TypeScript classes decorated with `@Component` transformed into native Custom Elements (Custom Elements v1) with synchronous template inlining and `<slot>` projection.
- **Structural Repeaters & Virtual Scrolling**: Declarative `for="let item of items"` and GPU-accelerated `virtual-for` handling 100,000+ items with sub-millisecond scrolling.
- **Zero Runtime Dependencies**: Pure TypeScript and Web APIs with zero external runtime footprint.
- **Dependency Injection**: First-class `@Injectable` decorator and `inject()` resolution.
- **Full HTTP Client**: Interceptor pipelines, resources, typed requests/responses, and progress state.
- **Signal Router & SEO Engine**: Declarative routes with automated head metadata, OpenGraph, and Schema.org JSON-LD synchronization.
- **Adwaita Glassmorphic Design System**: Modern translucent glassmorphic surfaces, refined geometry hierarchy, and KDE Plasma Breeze cursors.

---

## Installation

```bash
npm install purity-world
```

---

## Vite Configuration

In your `vite.config.ts`, include the Purity Vite plugin to enable synchronous template inlining and decorator transpilation:

```typescript
import { defineConfig } from 'vite';
import { purityPlugin } from 'purity-world/vite';

export default defineConfig({
  plugins: [purityPlugin()],
});
```

---

## Quickstart

```typescript
import { Component, signal, computed } from 'purity-world';

@Component({
  selector: 'counter-widget',
  template: `
    <div class="counter-card">
      <h3>Count: {{ count() }}</h3>
      <p>Double: {{ doubleCount() }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `
})
export class CounterWidget {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(n => n + 1);
  }
}
```

```html
<!-- index.html -->
<counter-widget></counter-widget>
```

---

## Styles & Design Tokens

Include pre-compiled Adwaita design tokens and theme rules:

```typescript
import 'purity-world/styles';
```

Or consume modular SCSS tokens:

```scss
@use 'purity-world/styles/variables' as *;
@use 'purity-world/styles/themes';
```

---

## License

MIT
EOF

cat << 'EOF' > "$OUTPUT_DIR/LICENSE"
MIT License

Copyright (c) 2026 Purity Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

STEP5_END=$(get_time_ms)
echo -e "${GREEN}✓ Package manifest and documentation generated in $(format_duration $((STEP5_END - STEP5_START)))${NC}"

# Step 6: Validate Package Integrity & Packing
echo -e "\n${BOLD}${YELLOW}[6/6] Validating Package Structure & Integrity...${NC}"
STEP6_START=$(get_time_ms)

# Verification 1: ESM import validation
node --input-type=module -e "
import { signal, computed, effect } from '$OUTPUT_DIR/index.js';
const s = signal(10);
const c = computed(() => s() * 2);
if (c() !== 20) throw new Error('Computed failed');
s.set(30);
if (c() !== 60) throw new Error('Signal update failed');
"
echo -e "${GREEN}✓ ESM module validation passed${NC}"

# Verification 2: CommonJS require validation
node -e "
const { signal, computed } = require('$OUTPUT_DIR/index.cjs');
const s = signal(5);
if (s() !== 5) throw new Error('CJS signal failed');
"
echo -e "${GREEN}✓ CommonJS bundle validation passed${NC}"

# Verification 3: Vite plugin import validation
node --input-type=module -e "
import { purityPlugin } from '$OUTPUT_DIR/vite.js';
if (typeof purityPlugin !== 'function') throw new Error('purityPlugin export failed');
"
echo -e "${GREEN}✓ Vite plugin export validation passed${NC}"

# Verification 4: NPM Dry-run Pack
echo -e "\n${CYAN}Running NPM pack dry-run inside npm-publish/...${NC}"
(cd "$OUTPUT_DIR" && npm pack --dry-run)

STEP6_END=$(get_time_ms)

TOTAL_END=$(get_time_ms)
TOTAL_DURATION=$((TOTAL_END - TOTAL_START))

echo -e "\n${BOLD}${GREEN}================================================================${NC}"
echo -e "${BOLD}${GREEN} ✓ Package successfully compiled into 'npm-publish' in $(format_duration $TOTAL_DURATION)! ${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "\n${BOLD}Ready to publish:${NC}"
echo -e "  ${CYAN}cd npm-publish && npm publish${NC}"
echo -e "  or"
echo -e "  ${CYAN}npm publish ./npm-publish${NC}\n"
