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
UI_OUTPUT_DIR="$ROOT_DIR/npm-publish-ui"
TOTAL_START=$(get_time_ms)

echo -e "\n${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}${BLUE}   ..::: Purity :::.. Standalone NPM Packages Builder           ${NC}"
echo -e "${BOLD}${BLUE}   [1] purity-world  (Core Framework & Reactivity)              ${NC}"
echo -e "${BOLD}${BLUE}   [2] purity-world-ui (Components, Directives & Styles)        ${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}\n"

# Step 1: Clean and Prepare Output Directories
echo -e "${BOLD}${YELLOW}[1/6] Cleaning & Initializing Output Directories...${NC}"
STEP1_START=$(get_time_ms)
rm -rf "$OUTPUT_DIR" "$UI_OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/types" "$OUTPUT_DIR/styles" "$OUTPUT_DIR/cursors"
mkdir -p "$UI_OUTPUT_DIR/types" "$UI_OUTPUT_DIR/styles"
STEP1_END=$(get_time_ms)
echo -e "${GREEN}✓ Output directories prepared in $(format_duration $((STEP1_END - STEP1_START)))${NC}"

# Step 2: Compile Library Bundles with Vite (ESM & CommonJS)
echo -e "\n${BOLD}${YELLOW}[2/6] Compiling Library Bundles with Vite (ESM & CommonJS)...${NC}"
STEP2_START=$(get_time_ms)

echo -e "  ${CYAN}Compiling purity-world (core, index, vite)...${NC}"
npx vite build --config "$ROOT_DIR/vite.config.lib.ts"

echo -e "  ${CYAN}Compiling purity-world-ui (components, directives, styles)...${NC}"
npx vite build --config "$ROOT_DIR/vite.config.ui.ts"

# Ensure CSS from UI build is named style.css
if [ -f "$UI_OUTPUT_DIR/purity.css" ]; then
    cp "$UI_OUTPUT_DIR/purity.css" "$UI_OUTPUT_DIR/style.css"
fi

# Also expose ui bundle inside purity-world for subpath usage purity-world/ui
cp "$UI_OUTPUT_DIR/index.js" "$OUTPUT_DIR/ui.js"
cp "$UI_OUTPUT_DIR/index.cjs" "$OUTPUT_DIR/ui.cjs"

STEP2_END=$(get_time_ms)
echo -e "${GREEN}✓ JavaScript bundles compiled in $(format_duration $((STEP2_END - STEP2_START)))${NC}"

# Step 3: Emit TypeScript Declaration Maps (*.d.ts)
echo -e "\n${BOLD}${YELLOW}[3/6] Emitting TypeScript Type Definitions (*.d.ts)...${NC}"
STEP3_START=$(get_time_ms)

echo -e "  ${CYAN}Emitting purity-world declarations...${NC}"
npx tsc -p "$ROOT_DIR/tsconfig.lib.json"

cat << 'EOF' > "$OUTPUT_DIR/index.d.ts"
export * from './types/core';
EOF

cat << 'EOF' > "$OUTPUT_DIR/core.d.ts"
export * from './types/core';
EOF

cat << 'EOF' > "$OUTPUT_DIR/vite.d.ts"
export * from './types/vite-plugin';
EOF

echo -e "  ${CYAN}Emitting purity-world-ui declarations...${NC}"
npx tsc -p "$ROOT_DIR/tsconfig.ui.json"

cat << 'EOF' > "$UI_OUTPUT_DIR/index.d.ts"
export * from './types/ui';
EOF

# Convenience copy for purity-world/ui
cat << 'EOF' > "$OUTPUT_DIR/ui.d.ts"
export * from './types/ui';
EOF
cp -r "$UI_OUTPUT_DIR/types"/* "$OUTPUT_DIR/types/" 2>/dev/null || true

# Normalize path aliases in emitted .d.ts files for external consumers
echo -e "  ${CYAN}Normalizing declaration import paths...${NC}"
find "$UI_OUTPUT_DIR/types" "$OUTPUT_DIR/types" -name "*.d.ts" -exec sed -i "s|@purity/core|purity-world/core|g" {} +
find "$UI_OUTPUT_DIR/types" "$OUTPUT_DIR/types" -name "*.d.ts" -exec sed -i "s|@data/notify.service|../../../../data/notify.service|g" {} +
find "$UI_OUTPUT_DIR/types" "$OUTPUT_DIR/types" -name "*.d.ts" -exec sed -i "s|@components/radial-context-menu/radial-context-menu.component|../radial-context-menu/radial-context-menu.component|g" {} +

STEP3_END=$(get_time_ms)
echo -e "${GREEN}✓ Type definitions generated in $(format_duration $((STEP3_END - STEP3_START)))${NC}"

# Step 4: Compile Styles & Copy Design Tokens
echo -e "\n${BOLD}${YELLOW}[4/6] Compiling Adwaita Styles & Assets...${NC}"
STEP4_START=$(get_time_ms)

# Compile master stylesheet (including base and all UI components) and standalone UI stylesheet
node -e "
import * as sass from 'sass';
import fs from 'fs';
import path from 'path';

const customImporter = {
    findFileUrl(url) {
        if (url === '@styles') {
            return new URL('file://' + path.resolve('src/styles/index.scss'));
        }
        return null;
    }
};

const fullCss = sass.compile('src/style.scss', {
    importers: [customImporter],
    style: 'compressed'
});
fs.writeFileSync('$OUTPUT_DIR/style.css', fullCss.css);

const uiCss = sass.compile('src/styles/_ui.scss', {
    importers: [customImporter],
    style: 'compressed'
});
fs.writeFileSync('$UI_OUTPUT_DIR/style.css', uiCss.css);
"

# Generate style.d.ts declarations for CSS side-effect imports
echo "declare const css: string; export default css;" > "$OUTPUT_DIR/style.d.ts"
echo "declare const css: string; export default css;" > "$UI_OUTPUT_DIR/style.d.ts"

cp -r "$ROOT_DIR/src/styles/"* "$OUTPUT_DIR/styles/"
if [ -d "$ROOT_DIR/public/cursors" ]; then
    cp -r "$ROOT_DIR/public/cursors/"* "$OUTPUT_DIR/cursors/"
fi

cp -r "$ROOT_DIR/src/styles/"* "$UI_OUTPUT_DIR/styles/"

STEP4_END=$(get_time_ms)
echo -e "${GREEN}✓ Styles and design assets packaged in $(format_duration $((STEP4_END - STEP4_START)))${NC}"

# Step 5: Generate NPM Package Manifests & Docs
echo -e "\n${BOLD}${YELLOW}[5/6] Generating NPM Package Manifests & Docs...${NC}"
STEP5_START=$(get_time_ms)

# Extract version from root package.json if available
VERSION=$(node -p "try { require('./package.json').version } catch(e) { '1.0.0' }")

# Manifest 1: purity-world
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
    "./core": {
      "types": "./core.d.ts",
      "import": "./core.js",
      "require": "./core.cjs"
    },
    "./ui": {
      "types": "./ui.d.ts",
      "import": "./ui.js",
      "require": "./ui.cjs"
    },
    "./vite": {
      "types": "./vite.d.ts",
      "import": "./vite.js",
      "require": "./vite.cjs"
    },
    "./styles": {
      "types": "./style.d.ts",
      "default": "./style.css"
    },
    "./styles/*": "./styles/*",
    "./cursors/*": "./cursors/*"
  },
  "files": [
    "*.js",
    "*.cjs",
    "*.d.ts",
    "types",
    "style.css",
    "style.d.ts",
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
- **Fine-Grained Synchronous Reactivity**: Signals (`signal`, `computed`, `effect`, `untrack`) with sub-microsecond updates.
- **Native Web Components**: Plain TypeScript classes decorated with `@Component` transformed into Custom Elements v1.
- **Dependency Injection**: First-class `@Injectable` and `inject()`.
- **Full HTTP Client**: Interceptor pipelines, resources, and progress cursors.
- **Signal Router & SEO Engine**: Declarative routes with automated head metadata.
- **Adwaita Design System**: Translucent glassmorphism, refined corner radii, and KDE Plasma Breeze cursors.

## Installation

```bash
npm install purity-world purity-world-ui
```

## Usage

```typescript
import { signal, computed, Component } from 'purity-world/core';
import { DropdownComponent, SwitchButtonComponent } from 'purity-world-ui';
import 'purity-world/styles';
import 'purity-world-ui/styles';
```

## License

MIT
EOF

# Manifest 2: purity-world-ui
cat << EOF > "$UI_OUTPUT_DIR/package.json"
{
  "name": "purity-world-ui",
  "version": "${VERSION}",
  "description": "Rich Adwaita glassmorphic UI components, directives, widgets, and behaviors for Purity Framework",
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
    "./styles": {
      "types": "./style.d.ts",
      "default": "./style.css"
    },
    "./styles/*": "./styles/*"
  },
  "files": [
    "*.js",
    "*.cjs",
    "*.d.ts",
    "types",
    "style.css",
    "style.d.ts",
    "styles",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "purity",
    "purity-world",
    "ui",
    "components",
    "custom-elements",
    "directives",
    "adwaita"
  ],
  "author": "Purity Contributors",
  "license": "MIT",
  "peerDependencies": {
    "purity-world": ">=1.0.0"
  }
}
EOF

cat << 'EOF' > "$UI_OUTPUT_DIR/README.md"
# Purity World UI

Rich Adwaita glassmorphic UI components, directives, widgets, and interaction behaviors for Purity Framework (`purity-world`).

## Installation

```bash
npm install purity-world purity-world-ui
```

## Usage

```typescript
import { signal } from 'purity-world/core';
import { DropdownComponent, SwitchButtonComponent, ModalViewComponent } from 'purity-world-ui';
import 'purity-world/styles';
import 'purity-world-ui/styles';
```

## Included Components & Directives

- `<dropdown>` / `[dropdown]` (`DropdownComponent` / `DropdownDirective`)
- `<switch-button>` (`SwitchButtonComponent`)
- `<modal-view>` (`ModalViewComponent`)
- `<date-time-picker>` (`DateTimePickerComponent`)
- `<notification-component>` (`NotificationComponent`)
- `<loader-component>` (`LoaderComponent`)
- `<popover-component>` (`PopoverComponent`)
- `<radial-context-menu>` (`RadialContextMenuComponent`)
- `<expander>` (`ExpanderComponent`)
- `<navigation-menu>` (`NavigationMenuComponent`)
- `<analogue-clock>` (`AnalogueClockComponent`)
- `[highlight]` (`HighlightDirective`)
- `drag` / `draggable`, `droppable` behaviors
- `ThemeService`, `NotifyService`

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

cp "$OUTPUT_DIR/LICENSE" "$UI_OUTPUT_DIR/LICENSE"

STEP5_END=$(get_time_ms)
echo -e "${GREEN}✓ Package manifests and documentation generated in $(format_duration $((STEP5_END - STEP5_START)))${NC}"

# Step 6: Validate Package Integrity & Packing
echo -e "\n${BOLD}${YELLOW}[6/6] Validating Package Structure & Integrity...${NC}"
STEP6_START=$(get_time_ms)

# Temporarily link packages into node_modules for local resolution testing
mkdir -p "$ROOT_DIR/node_modules"
ln -sfn "$OUTPUT_DIR" "$ROOT_DIR/node_modules/purity-world"
ln -sfn "$UI_OUTPUT_DIR" "$ROOT_DIR/node_modules/purity-world-ui"

# Verification 1: ESM import validation for purity-world/core
node --input-type=module -e "
import { signal, computed, effect } from 'purity-world/core';
const s = signal(10);
const c = computed(() => s() * 2);
if (c() !== 20) throw new Error('Computed failed');
s.set(30);
if (c() !== 60) throw new Error('Signal update failed');
"
echo -e "${GREEN}✓ purity-world/core ESM validation passed${NC}"

# Verification 2: CommonJS require validation for purity-world/core
node -e "
const { signal, computed } = require('purity-world/core');
const s = signal(5);
if (s() !== 5) throw new Error('CJS signal failed');
"
echo -e "${GREEN}✓ purity-world/core CommonJS validation passed${NC}"

# Verification 3: Vite plugin import validation
node --input-type=module -e "
import { purityPlugin } from 'purity-world/vite';
if (typeof purityPlugin !== 'function') throw new Error('purityPlugin export failed');
"
echo -e "${GREEN}✓ purity-world/vite plugin export validation passed${NC}"

# Verification 4: purity-world-ui ESM exports validation
node --input-type=module -e "
import * as ui from 'purity-world-ui';
import { DropdownComponent, SwitchButtonComponent, ModalViewComponent } from 'purity-world-ui';
const requiredExports = [
    'DropdownComponent',
    'DropdownDirective',
    'SwitchButtonComponent',
    'ModalViewComponent',
    'DateTimePickerComponent',
    'NotificationComponent',
    'LoaderComponent',
    'PopoverComponent',
    'RadialContextMenuComponent',
    'ExpanderComponent',
    'NavigationMenuComponent',
    'AnalogueClockComponent',
    'HighlightDirective',
    'drag',
    'droppable',
    'ThemeService',
    'NotifyService',
];
for (const exp of requiredExports) {
    if (typeof ui[exp] === 'undefined') {
        throw new Error('Missing expected export: ' + exp);
    }
}
"
echo -e "${GREEN}✓ purity-world-ui ESM exports validation passed${NC}"

# Verification 5: purity-world-ui CommonJS exports validation
node -e "
const ui = require('purity-world-ui');
if (typeof ui.DropdownComponent === 'undefined') throw new Error('CJS DropdownComponent missing');
if (typeof ui.SwitchButtonComponent === 'undefined') throw new Error('CJS SwitchButtonComponent missing');
"
echo -e "${GREEN}✓ purity-world-ui CommonJS exports validation passed${NC}"

# Cleanup temporary verification links
rm -f "$ROOT_DIR/node_modules/purity-world" "$ROOT_DIR/node_modules/purity-world-ui"

# Verification 6: Style assets validation
if [ ! -s "$OUTPUT_DIR/style.css" ] || [ ! -s "$UI_OUTPUT_DIR/style.css" ]; then
    echo -e "${RED}Error: style.css is empty or missing!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Stylesheets compiled successfully (${OUTPUT_DIR}/style.css & ${UI_OUTPUT_DIR}/style.css)${NC}"

# Verification 7: NPM Pack
echo -e "\n${CYAN}Running NPM pack on purity-world...${NC}"
(cd "$OUTPUT_DIR" && npm pack)

echo -e "\n${CYAN}Running NPM pack on purity-world-ui...${NC}"
(cd "$UI_OUTPUT_DIR" && npm pack)

STEP6_END=$(get_time_ms)
TOTAL_END=$(get_time_ms)
TOTAL_DURATION=$((TOTAL_END - TOTAL_START))

echo -e "\n${BOLD}${GREEN}================================================================${NC}"
echo -e "${BOLD}${GREEN} ✓ Packages successfully built in $(format_duration $TOTAL_DURATION)!               ${NC}"
echo -e "${BOLD}${GREEN}   1. npm-publish/     -> purity-world                          ${NC}"
echo -e "${BOLD}${GREEN}   2. npm-publish-ui/  -> purity-world-ui                       ${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "\n${BOLD}Ready to publish:${NC}"
echo -e "  ${CYAN}npm publish ./npm-publish${NC}"
echo -e "  ${CYAN}npm publish ./npm-publish-ui${NC}\n"
