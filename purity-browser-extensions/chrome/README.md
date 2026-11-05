# Purity Chrome Inspector Extension

[![Manifest V3](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Purity Framework](https://img.shields.io/badge/Purity-DevTools-10b981)](https://github.com/devilbd/purity)
[![Zero Build](https://img.shields.io/badge/Build-Zero_Compilation_Required-brightgreen)](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/devilbd/purity/blob/main/LICENSE)

An official, zero-build Chrome DevTools extension for the **[Purity Framework](https://github.com/devilbd/purity)** built on **Chrome Extensions Manifest V3**.

Purity Inspector integrates directly into Google Chrome's Developer Tools panel (alongside *Elements*, *Console*, *Sources*, and *Network*). It provides deep, real-time introspection into Purity components, fine-grained reactive signals, computed values, active effects, the Dependency Injection container, and live microsecond-resolution render/update profiling.

---

## 📋 Table of Contents

- [📥 How to Download the Extension](#-how-to-download-the-extension)
  - [Method 1: Clone the Entire Repository (Recommended)](#method-1-clone-the-entire-repository-recommended)
  - [Method 2: Download Only the Chrome Extension Folder (Fastest & Lightest)](#method-2-download-only-the-chrome-extension-folder-fastest--lightest)
  - [Method 3: Download as a ZIP Archive via GitHub Web](#method-3-download-as-a-zip-archive-via-github-web)
  - [Method 4: Quick Terminal One-Liner (curl / tar)](#method-4-quick-terminal-one-liner-curl--tar)
- [🛠️ How to Set Up & Install in Google Chrome](#️-how-to-set-up--install-in-google-chrome)
  - [Prerequisites & Supported Browsers](#prerequisites--supported-browsers)
  - [Step-by-Step Installation Walkthrough](#step-by-step-installation-walkthrough)
- [🚀 How to Launch and Inspect Purity Applications](#-how-to-launch-and-inspect-purity-applications)
  - [Mode 1: Dedicated Chrome DevTools Panel (Recommended)](#mode-1-dedicated-chrome-devtools-panel-recommended)
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
cd purity/purity-browser-extensions/chrome
```

The extension files will be immediately available in the `purity/purity-browser-extensions/chrome` directory.

### Method 2: Download Only the Chrome Extension Folder (Fastest & Lightest)

If you only want the Chrome extension without cloning the rest of the framework codebase:

#### Option A: Using `degit` (Zero-config one-liner)

```bash
npx degit devilbd/purity/purity-browser-extensions/chrome purity-chrome-extension
cd purity-chrome-extension
```

#### Option B: Using Git Sparse-Checkout

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/devilbd/purity.git purity-extension
cd purity-extension
git sparse-checkout set purity-browser-extensions/chrome
```

The extension will be located at `purity-extension/purity-browser-extensions/chrome`.

### Method 3: Download as a ZIP Archive via GitHub Web

1. Open your browser and navigate to the repository: [https://github.com/devilbd/purity](https://github.com/devilbd/purity)
2. Click the green **Code** button at the top-right of the file list.
3. Select **Download ZIP** (or directly download: `https://github.com/devilbd/purity/archive/refs/heads/main.zip`).
4. Once downloaded, extract the ZIP file to your preferred folder (e.g. `Downloads/` or `Desktop/`).
5. Open the extracted folder and locate the extension directory:
   ```text
   purity-main/purity-browser-extensions/chrome
   ```

### Method 4: Quick Terminal One-Liner (curl / tar)

On Linux or macOS, you can extract just the Chrome extension directory in a single command:

```bash
mkdir -p purity-chrome-extension && curl -sSL https://github.com/devilbd/purity/tarball/main | tar -xz -C purity-chrome-extension --strip-components=3 "*/purity-browser-extensions/chrome"
```

---

## 🛠️ How to Set Up & Install in Google Chrome

The Purity Chrome Inspector requires **zero build step** or compilation. It is pure standard web technology ready to be loaded as an unpacked extension immediately.

### Prerequisites & Supported Browsers

- **Google Chrome** (v88+ with Manifest V3 support)
- Any modern **Chromium-based browser**:
  - Microsoft Edge
  - Brave Browser
  - Arc Browser
  - Vivaldi
  - Opera

---

### Step-by-Step Installation Walkthrough

#### Step 1: Open Chrome Extensions Page
Open Google Chrome and navigate to the extensions management page:
- In the address bar, type:
  ```text
  chrome://extensions/
  ```
  and press <kbd>Enter</kbd>.
- Alternatively, click the Chrome menu (**⋮** three dots in the upper-right corner) ➔ **Extensions** ➔ **Manage Extensions**.

---

#### Step 2: Enable "Developer mode"
In the top-right corner of the `chrome://extensions` page, find the toggle switch labeled **Developer mode** and switch it **ON**.

```text
[ Developer mode   (●) ]
```

When enabled, a secondary toolbar containing three buttons will appear in the top-left:
- **Load unpacked**
- **Pack extension**
- **Update**

---

#### Step 3: Click "Load unpacked"
Click the **Load unpacked** button in the top toolbar.

---

#### Step 4: Select the Extension Folder
A system file chooser dialog will appear. Browse to and select the `chrome` folder:

```text
/path/to/purity/purity-browser-extensions/chrome
```

> [!IMPORTANT]
> **Select the folder containing `manifest.json`!**
> Ensure you select the `chrome/` directory directly (which contains `manifest.json`, `devtools.html`, etc.). Do **NOT** select the parent directory `purity-browser-extensions/`. Selecting the wrong folder will cause Chrome to display a *"Manifest file is missing or unreadable"* error.

---

#### Step 5: Verify Successful Installation
Once selected, the extension card will immediately appear on your `chrome://extensions` page:

- **Name**: Purity Inspector
- **Version**: 1.0.0
- **Description**: Inspect Purity framework components, services, dependency injection, signals, and effects.
- **Status**: Enabled (blue toggle switch)

---

#### Step 6: (Recommended) Pin to Chrome Toolbar
1. Click the **Extensions** puzzle icon (🧩) in the top-right corner of Chrome's toolbar.
2. Locate **Purity Inspector**.
3. Click the **Pin** icon (📌) next to it so the Purity icon remains visible in your browser toolbar for fast one-click access.

---

## 🚀 How to Launch and Inspect Purity Applications

### Mode 1: Dedicated Chrome DevTools Panel (Recommended)

Like Angular DevTools, Vue DevTools, or React Developer Tools, Purity Inspector runs as a first-class citizen inside Chrome DevTools:

1. Open your Purity web application in Chrome:
   - For local development: `http://localhost:5173` (or your local dev server port).
   - Or any deployed Purity web application.
2. Open Chrome Developer Tools:
   - Press <kbd>F12</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>I</kbd> (macOS).
   - Or right-click anywhere on the page and select **Inspect**.
3. In the top DevTools panel tabs (*Elements*, *Console*, *Sources*, *Network*...), locate and click the **Purity** tab.
   > [!TIP]
   > If your DevTools window is narrow, Chrome moves trailing tabs into the overflow menu marked with double chevrons (`>>`). Click `>>` to reveal and select **Purity**.
4. The Purity DevTools panel will connect to the page and display real-time telemetry. It stays docked, auto-refreshes on page reload (<kbd>F5</kbd>), and updates live as you interact with the page!

---

### Mode 2: Toolbar Popup & Standalone Browser Tab

1. Click the **Purity Inspector** icon in your browser's top toolbar.
2. A status launcher card will pop up showing whether a Purity application is detected on the active tab.
3. Click **"Open in New Browser Tab"** to launch the full inspector in its own dedicated, full-screen browser window. This is ideal for dual-monitor setups or side-by-side inspection.

---

## 🔍 Features & Inspection Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│  Purity DevTools [v2.1.1] [🟢 Active]               [🔄 Refresh]        │
├──────────────┬──────────────┬──────────────────┬───────────────────────┤
│  Components  │   Services   │ Reactivity Graph │  Metrics & Profiler   │
│     (12)     │     (5)      │       (24)       │        (0.2ms)        │
└──────────────┴──────────────┴──────────────────┴───────────────────────┘
```

### 1. Automatic Detection & App Telemetry
- Inspects the active tab in real time to detect if a Purity application is mounted.
- Displays the active Purity framework version, total component count, and reactive state.
- Automatically handles tab changes, SPA route navigations, and live reloads.

### 2. Tab 1: Components View
- **Component Tree & Discovery**: Lists all registered and mounted Purity components (e.g. `AppComponent`, `HeaderComponent`, `DateTimePickerComponent`).
- **Instant Search**: Filter through component trees dynamically with debounced fuzzy search.
- **Deep Inspection Panel**:
  - **Injected Services (`@Injectable`)**: Reveals every service injected into the selected component with direct click-through navigation to the Services tab.
  - **Signals & Computeds**: Displays reactive property names, signal types (`signal` vs `computed`), and live reactive values formatted with syntax colors.
  - **Effects & Directives**: Lists all active template-binding effects, `onInit` effects, applied directives (`[highlight]`, `[dropdown]`), and form validators.
  - **Shortcut Navigation**: One-click **"Reactivity"** button jumping directly into that component's visual reactivity graph.

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

1. Open `chrome://extensions/`.
2. Locate the **Purity Inspector** card.
3. Click the circular **Reload** icon (🔄) on the card.
4. If Chrome DevTools was already open on a tab, close it (<kbd>F12</kbd>) and re-open it to load the updated extension bundle.

---

## 🛠️ Troubleshooting & FAQ

### 1. The "Purity" tab does not appear in Chrome DevTools
- **Check the page URL**: Chrome disallows extension panels on internal browser URLs (`chrome://*`, `chrome-extension://*`, `about:blank`, or the Chrome Web Store). Make sure you have opened a standard HTTP/HTTPS page (such as `http://localhost:5173`).
- **Check the tab overflow**: If your DevTools window is narrow, Chrome moves additional tabs into the `>>` chevron on the right side of the tab strip. Click `>>` to find **Purity**.
- **Close and reopen DevTools**: Chrome only initializes extension panels when DevTools launches. Press <kbd>F12</kbd> twice to reload DevTools.

### 2. Error: "Manifest file is missing or unreadable"
- You selected the parent directory `purity-browser-extensions` instead of `purity-browser-extensions/chrome`.
- When clicking **Load unpacked**, navigate *inside* `purity-browser-extensions/` and select the `chrome` folder where `manifest.json` is located.

### 3. "Purity DevTools cannot be used in production mode"
- In production builds (where `environment.production === true`), debug inspection hooks are disabled by default for security and performance.
- To inspect your app, run it in development mode (`npm run dev` or ensure `production: false` in your environment config).

### 4. Keyboard Shortcuts Cheatsheet

| Shortcut | Action |
|---|---|
| <kbd>F12</kbd> or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> | Open Chrome DevTools (Windows / Linux) |
| <kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>I</kbd> | Open Chrome DevTools (macOS) |
| <kbd>F5</kbd> or <kbd>Ctrl</kbd>+<kbd>R</kbd> | Reload page & re-synchronize Purity telemetry |
| <kbd>Esc</kbd> | Toggle DevTools bottom drawer console |

---

## 📁 Directory Structure

```text
purity-browser-extensions/chrome/
├── manifest.json       # Manifest V3 extension configuration & permissions
├── devtools.html       # DevTools background entry page
├── devtools.js         # Registers the top-level "Purity" panel in Chrome DevTools
├── panel.html          # Main DevTools panel interface (Components, Services, Reactivity, Metrics)
├── panel.css           # Adwaita glassmorphic styling tailored for DevTools viewports
├── panel.js            # DevTools panel controller & visualizer logic
├── inspector.js        # MAIN-world in-page telemetry & inspection agent
├── popup.html          # Browser toolbar launcher card
├── popup.css           # Toolbar launcher styling
├── popup.js            # Quick status checker for browser toolbar action
├── icons/              # Extension icons
│   ├── icon-16.png     # 16x16 icon for favicon & tab
│   ├── icon-48.png     # 48x48 icon for extensions management
│   └── icon-128.png    # 128x128 high-res icon for installation & Web Store
└── README.md           # This setup, download, and usage guide
```

---

## 📄 License

Purity Inspector is open-source software licensed under the [MIT License](https://github.com/devilbd/purity/blob/main/LICENSE).
