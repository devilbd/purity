# Purity Mozilla Firefox Inspector Extension

[![WebExtensions MV3](https://img.shields.io/badge/Firefox_Extension-Manifest_V3-FF7139?logo=firefoxbrowser&logoColor=white)](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/)
[![Purity Framework](https://img.shields.io/badge/Purity-DevTools-10b981)](https://github.com/devilbd/purity)
[![Zero Build](https://img.shields.io/badge/Build-Zero_Compilation_Required-brightgreen)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/devilbd/purity/blob/main/LICENSE)

An official, zero-build Mozilla Firefox DevTools extension for the **[Purity Framework](https://github.com/devilbd/purity)** built on **WebExtensions Manifest V3**.

Purity Inspector integrates directly into Firefox's Developer Tools panel (alongside *Inspector*, *Console*, *Debugger*, and *Network*). It provides deep, real-time introspection into Purity components, fine-grained reactive signals, computed values, active effects, the Dependency Injection container, and live microsecond-resolution render/update profiling.

---

## 📋 Table of Contents

- [📥 How to Download the Extension](#-how-to-download-the-extension)
  - [Method 1: Clone the Entire Repository (Recommended)](#method-1-clone-the-entire-repository-recommended)
  - [Method 2: Download Only the Mozilla Extension Folder (Fastest & Lightest)](#method-2-download-only-the-mozilla-extension-folder-fastest--lightest)
  - [Method 3: Download as a ZIP Archive via GitHub Web](#method-3-download-as-a-zip-archive-via-github-web)
  - [Method 4: Quick Terminal One-Liner (curl / tar)](#method-4-quick-terminal-one-liner-curl--tar)
- [🛠️ How to Set Up & Install in Mozilla Firefox](#️-how-to-set-up--install-in-mozilla-firefox)
  - [Prerequisites & Supported Browsers](#prerequisites--supported-browsers)
  - [Step-by-Step Installation Walkthrough](#step-by-step-installation-walkthrough)
- [🚀 How to Launch and Inspect Purity Applications](#-how-to-launch-and-inspect-purity-applications)
  - [Mode 1: Dedicated Firefox DevTools Panel (Recommended)](#mode-1-dedicated-firefox-devtools-panel-recommended)
  - [Mode 2: Toolbar Popup & Standalone Browser Tab](#mode-2-toolbar-popup--standalone-browser-tab)
- [🔍 Features & Inspection Capabilities](#-features--inspection-capabilities)
  - [1. Automatic Detection & App Telemetry](#1-automatic-detection--app-telemetry)
  - [2. Tab 1: Components View](#2-tab-1-components-view)
  - [3. Tab 2: Services View (Dependency Injection)](#3-tab-2-services-view-dependency-injection)
  - [4. Tab 3: Reactivity Graph (Interactive Bipartite Visualizer)](#4-tab-3-reactivity-graph-interactive-bipartite-visualizer)
  - [5. Tab 4: Metrics & Profiler (Start/Stop Recording & Telemetry)](#5-tab-4-metrics--profiler-startstop-recording--telemetry)
- [🔄 How to Update or Reload After Changes](#-how-to-update-or-reload-after-changes)
- [🛠️ Troubleshooting & FAQ](#️-troubleshooting--faq)
- [📁 Directory Structure](#-directory-structure)

---

## 📥 How to Download the Extension

Choose any of the following methods to download the extension files to your local computer:

### Method 1: Clone the Entire Repository (Recommended)

If you are developing with or contributing to the Purity framework, clone the official Git repository:

```bash
git clone https://github.com/devilbd/purity.git
cd purity/purity-browser-extensions/mozilla
```

The extension files will be immediately available in the `purity/purity-browser-extensions/mozilla` directory.

### Method 2: Download Only the Mozilla Extension Folder (Fastest & Lightest)

If you only want the Mozilla Firefox extension without cloning the rest of the framework codebase:

#### Option A: Using `degit` (Zero-config one-liner)

```bash
npx degit devilbd/purity/purity-browser-extensions/mozilla purity-mozilla-extension
cd purity-mozilla-extension
```

#### Option B: Using Git Sparse-Checkout

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/devilbd/purity.git purity-extension
cd purity-extension
git sparse-checkout set purity-browser-extensions/mozilla
```

The extension will be located at `purity-extension/purity-browser-extensions/mozilla`.

### Method 3: Download as a ZIP Archive via GitHub Web

1. Open your browser and navigate to the repository: [https://github.com/devilbd/purity](https://github.com/devilbd/purity)
2. Click the green **Code** button at the top-right of the file list.
3. Select **Download ZIP** (or directly download: `https://github.com/devilbd/purity/archive/refs/heads/main.zip`).
4. Once downloaded, extract the ZIP file to your preferred folder (e.g. `Downloads/` or `Desktop/`).
5. Open the extracted folder and locate the extension directory:
   ```text
   purity-main/purity-browser-extensions/mozilla
   ```

### Method 4: Quick Terminal One-Liner (curl / tar)

On Linux or macOS, you can extract just the Mozilla extension directory in a single command:

```bash
mkdir -p purity-mozilla-extension && curl -sSL https://github.com/devilbd/purity/tarball/main | tar -xz -C purity-mozilla-extension --strip-components=3 "*/purity-browser-extensions/mozilla"
```

---

## 🛠️ How to Set Up & Install in Mozilla Firefox

The Purity Mozilla Inspector requires **zero build step** or compilation. It is pure standard WebExtensions technology ready to be loaded immediately in Firefox.

### Prerequisites & Supported Browsers

- **Mozilla Firefox** (v109+ with Manifest V3 support)
- **Firefox Developer Edition** / **Firefox Nightly** / **Firefox ESR**
- Any modern **Gecko-based browser**:
  - Zen Browser
  - LibreWolf
  - Waterfox
  - Floorp

---

### Step-by-Step Installation Walkthrough

#### Step 1: Open Firefox Debugging Page
Open Mozilla Firefox and navigate to the Add-ons debugging management page:
- In the address bar, type:
  ```text
  about:debugging#/runtime/this-firefox
  ```
  and press <kbd>Enter</kbd>.
- Alternatively, type `about:debugging` and click **This Firefox** (or **This Nightly** / **This Browser**) in the left sidebar.

---

#### Step 2: Click "Load Temporary Add-on..."
Under the **Temporary Extensions** section near the top of the page, click the **Load Temporary Add-on...** button.

```text
[ Load Temporary Add-on... ]
```

---

#### Step 3: Select the `manifest.json` File
A system file chooser dialog will appear. Browse into the `mozilla` folder and select the `manifest.json` file:

```text
/path/to/purity/purity-browser-extensions/mozilla/manifest.json
```

> [!IMPORTANT]
> **Select `manifest.json` inside the `mozilla/` folder!**
> Unlike Chrome (which asks for a folder), Firefox's file picker requires you to select a file inside the extension directory—select `manifest.json` inside `purity-browser-extensions/mozilla/`.

---

#### Step 4: Verify Successful Installation
Once selected, the extension card will immediately appear under **Temporary Extensions**:

- **Name**: Purity Inspector
- **Version**: 1.0.0
- **Extension ID**: `purity-inspector@purity.dev`
- **Internal UUID**: Dynamically assigned by Firefox

---

#### Step 5: (Recommended) Pin to Firefox Toolbar
1. Click the **Extensions** puzzle icon (🧩) in the top-right corner of Firefox's toolbar.
2. Locate **Purity Inspector**.
3. Click the gear icon (⚙️) next to it and check **Pin to Toolbar** so the Purity icon remains visible in your browser toolbar for fast one-click access.

---

## 🚀 How to Launch and Inspect Purity Applications

### Mode 1: Dedicated Firefox DevTools Panel (Recommended)

Like Angular DevTools, Vue DevTools, or React Developer Tools, Purity Inspector runs as a first-class citizen inside Firefox Developer Tools:

1. Open your Purity web application in Firefox:
   - For local development: `http://localhost:5173` (or your local dev server port).
   - Or any Purity web application running in development mode.
2. Open Firefox Developer Tools:
   - Press <kbd>F12</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>I</kbd> (macOS).
   - Or right-click anywhere on the page and select **Inspect**.
3. In the top DevTools panel tabs (*Inspector*, *Console*, *Debugger*, *Network*...), locate and click the **Purity** tab.
   > [!TIP]
   > If your DevTools window is narrow, Firefox moves trailing tabs into the overflow menu marked with double chevrons (`>>`). Click `>>` to reveal and select **Purity**.
4. The Purity DevTools panel will connect to the page and display real-time telemetry. It stays docked, auto-refreshes on page reload (<kbd>F5</kbd>), and updates live as you interact with the page!

---

### Mode 2: Toolbar Popup & Standalone Browser Tab

1. Click the **Purity Inspector** icon in your browser's top toolbar.
2. A status launcher card will pop up showing whether a Purity application is detected on the active tab (and whether it is in Development or Production mode).
3. Click **"Open in New Browser Tab"** to launch the full inspector in its own dedicated, full-screen browser window. This is ideal for dual-monitor setups or side-by-side inspection.

---

## 🔍 Features & Inspection Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│  Purity DevTools [Purity 2.1.1 • Dev Mode]          [🔄 Refresh]        │
├──────────────┬──────────────┬──────────────────┬───────────────────────┤
│  Components  │   Services   │ Reactivity Graph │  Metrics & Profiler   │
│     (12)     │     (5)      │       (24)       │        (0.2ms)        │
└──────────────┴──────────────┴──────────────────┴───────────────────────┘
```

### 1. Automatic Detection & App Telemetry
- Inspects the active tab in real time to detect if a Purity application is mounted.
- Displays the active Purity framework version, environment mode (`Dev Mode` vs `Production Mode`), total component count, and reactive state.
- Automatically blocks inspection when `production: true` is detected to protect production bundles.
- Automatically handles tab changes, SPA route navigations, and live reloads.

### 2. Tab 1: Components View
- **Component Tree & Discovery**: Lists all registered and mounted Purity components (e.g. `AppComponent`, `HeaderComponent`, `DateTimePickerComponent`).
- **Instant Search**: Filter through component trees dynamically with debounced fuzzy search.
- **Deep Inspection Panel**:
  - **Injected Services (`@Injectable`)**: Reveals every service injected into the selected component with direct click-through navigation to the Services tab.
  - **Signals & Computeds**: Displays reactive property names, signal types (`signal` vs `computed`), and live reactive values formatted with syntax colors.
  - **Effects & Directives**: Lists all active template-binding effects, `onInit` effects, applied directives (`[highlight]`, `[dropdown]`), and form validators.
  - **Shortcut Navigation**: One-click **"Reactivity"** and **"Metrics"** buttons jumping directly into that component's visual reactivity graph or performance profiler.

### 3. Tab 2: Services View (Dependency Injection)
- **DI Registry**: Displays all singleton and transient `@Injectable` services registered in the Purity Dependency Injection container.
- **Dependency Flow**:
  - **Depends on**: Details which upstream services or providers this service injects (e.g., `Router` depending on `SeoService` and `HttpClient`).
  - **Used by / Depended on by**: Details which downstream components and services depend on this service (e.g., `ThemeService` consumed by `HeaderComponent`, `AnalogueClockComponent`).
- **Internal Service State**: Real-time signal values maintained inside service instances.

### 4. Tab 3: Reactivity Graph (Interactive Bipartite Visualizer)
- **On-Demand Component Scoping**: To ensure peak 60 FPS performance and zero DOM clutter on large applications, reactivity graphs are rendered dynamically for the selected component.
- **Component Selector & Quick Chips**: Search for components or click chips displaying live signal and effect counts.
- **Bipartite Node Visualization**:
  - **Left column**: Signals & Computeds with current values.
  - **Right column**: Subscribed Effects, Directives, and DOM bindings.
- **Dynamic Bézier SVG Connectors**: Smooth cubic Bézier curves connecting signals to their subscribed effect nodes.
- **Interactive Highlighting**:
  - Hovering/clicking a **Signal** illuminates its node, all outgoing reactive curves, and all dependent effects that re-evaluate when that signal mutates.
  - Hovering/clicking an **Effect** illuminates its node, all incoming curves, and all upstream signals that trigger it.

### 5. Tab 4: Metrics & Profiler (Start/Stop Recording & Telemetry)
- **Performance Profiling**: Microsecond-resolution telemetry for initial render time and reactive update latency.
- **Start / Stop Recording Controls**:
  - Click **"Start Recording"** to monitor live user interactions, signal mutations, and effect re-runs.
  - Visual recording indicator with elapsed duration timer.
  - Click **"Stop Recording"** to freeze telemetry and calculate session KPIs:
    - Min, Max, and Average update latency.
    - Total updates processed across the session.
- **Initial Render Budget**: Evaluates template inlining, slot projection, DOM compilation, and mounting against the 16.6ms 60 FPS frame budget.
- **Signal & Effect Breakdown Table**: Comprehensive table displaying update frequencies, last execution duration, average latency, and cumulative execution time.
- **Interactive Benchmark Button ("Test Update")**: Triggers an on-demand reactive signal mutation test directly on the active webpage component to measure real-time roundtrip update latency.

---

## 🔄 How to Update or Reload After Changes

When modifying the extension files or pulling new updates from Git:

1. Open `about:debugging#/runtime/this-firefox`.
2. Locate the **Purity Inspector** card under **Temporary Extensions**.
3. Click the **Reload** button on the card.
4. If Firefox Developer Tools was already open on a tab, close it (<kbd>F12</kbd>) and re-open it to load the updated extension bundle.

---

## 🛠️ Troubleshooting & FAQ

### 1. The "Purity" tab does not appear in Firefox DevTools
- **Check the page URL**: Firefox disallows extension panels on privileged internal browser URLs (`about:*`, `moz-extension://*`, or `addons.mozilla.org`). Make sure you have opened a standard HTTP/HTTPS page (such as `http://localhost:5173`).
- **Check the tab overflow**: If your DevTools window is narrow, Firefox moves additional tabs into the `>>` chevron on the right side of the tab strip. Click `>>` to find **Purity**.
- **Close and reopen DevTools**: Firefox initializes extension panels when DevTools launches. Press <kbd>F12</kbd> twice to reload DevTools.

### 2. Host Permissions in Firefox Manifest V3
- If using the toolbar popup on a new domain, ensure the extension has permission to access the site. You can right-click the **Purity Inspector** toolbar icon and check **Always Allow on localhost** (or grant host permissions in `about:addons` ➔ **Purity Inspector** ➔ **Permissions**).
- Note: The docked DevTools Panel (<kbd>F12</kbd> ➔ **Purity**) uses `devtools.inspectedWindow.eval` and works automatically without extra host prompts.

### 3. "Production Mode Detected — DevTools Disabled"
- In production builds (where `environment.production === true` or `enableDebugTools === false`), Purity DevTools is disabled by design.
- To inspect your app, run it in development mode (`npm run dev` or ensure `production: false` in your environment config).

### 4. Keyboard Shortcuts Cheatsheet

| Shortcut | Action |
|---|---|
| <kbd>F12</kbd> or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> | Open Firefox DevTools (Windows / Linux) |
| <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>I</kbd> | Open Firefox DevTools (macOS) |
| <kbd>F5</kbd> or <kbd>Ctrl</kbd>+<kbd>R</kbd> | Reload page & re-synchronize Purity telemetry |
| <kbd>Esc</kbd> | Toggle DevTools split console |

---

## 📁 Directory Structure

```text
purity-browser-extensions/mozilla/
├── manifest.json       # Firefox WebExtensions Manifest V3 configuration & Gecko settings
├── background.js       # Background event script
├── devtools.html       # DevTools background entry page
├── devtools.js         # Registers the top-level "Purity" panel in Firefox DevTools
├── panel.html          # Main DevTools panel interface (Components, Services, Reactivity, Metrics)
├── panel.css           # Adwaita glassmorphic styling tailored for DevTools viewports
├── panel.js            # DevTools panel controller & visualizer logic
├── inspector.js        # MAIN-world in-page telemetry & inspection agent
├── popup.html          # Browser toolbar launcher card
├── popup.css           # Toolbar launcher styling
├── popup.js            # Quick status checker for browser toolbar action
├── icons/              # Extension icons
│   ├── icon-16.png     # 16x16 icon for favicon & DevTools tab
│   ├── icon-48.png     # 48x48 icon for add-ons management
│   └── icon-128.png    # 128x128 high-res icon for installation & AMO
└── README.md           # This setup, download, and usage guide
```

---

## 📄 License

Purity Inspector is open-source software licensed under the [MIT License](https://github.com/devilbd/purity/blob/main/LICENSE).
