# Purity Chrome Inspector Extension

An official DevTools extension for the **Purity Framework** built with **Manifest V3**.

---

## 🔍 Features

1. **Automatic Detection**:
   - Detects whether the active tab is running a Purity application.
   - Shows active Purity version and status indicator in real time.

2. **Tab 1: Components View**:
   - Displays all registered and mounted Purity components as names (e.g. `AppComponent`, `HeaderComponent`, `DateRangePickerComponent`).
   - Filter components via instant search.
   - **Clicking a component reveals**:
     - **Injected Services (`@Injectable`)**: which services the component uses, with direct shortcut navigation to the Services tab.
     - **Signals & Computed Values**: property names, reactive types (`signal` vs `computed`), and live reactive values formatted with syntax colors.
     - **Reactive Effects & Directives**: all active template binding effects, `onInit` effects, active directives, and form validators.

3. **Tab 2: Services View**:
   - Displays all registered `@Injectable` services in the Dependency Injection container.
   - Filter services via instant search.
   - **Clicking a service reveals**:
     - **Service Dependencies ("Depends on")**: represents which other services this service depends on (e.g. `Router` depending on `SeoService` or `HttpClient`).
     - **Depended On By ("Used by")**: represents which components and other services inject/depend on this service (e.g. `ThemeService` used by `HeaderComponent`, `AnalogueClockComponent`).
     - **Service Signals**: signals managed inside the service with live values.

4. **Tab 3: Reactivity Graph (High-Performance On-Demand Component Visualizer)**:
   - **On-Demand Component Scoping**: To ensure peak rendering performance and prevent DOM clutter in large applications, signals and effects are rendered **only after a component is chosen**.
   - **Component Filter & Quick Chips**:
     - Fast search box (`#react-comp-search`) to filter components dynamically or select via `Enter`.
     - Horizontal chip bar listing components with signal and effect count badges.
     - Direct **"Reactivity"** shortcut button from Tab 1 (Components) to jump straight into a component's reactivity graph.
   - **Active Component Banner**: Displays the currently inspected component tag, along with live counts for signals, effects, and active reactive connections, plus a one-click `✕ Clear` button.
   - **Visual Bipartite Graph**: Visualizes the selected component's Signals/Computeds (left) and subscribed Effects/Directives (right).
   - **Dynamic SVG Connectors**: Renders smooth cubic Bézier curves connecting the chosen component's signals to their subscriber effects.
   - **Interactive Highlights**:
     - Hovering/clicking a **Signal** illuminates its node, all outgoing reactive curves, and all dependent effects that re-run when it changes.
     - Hovering/clicking an **Effect** illuminates its node, all incoming reactive curves, and all upstream signals that feed it.

5. **Tab 4: Metrics & Profiler (Start/Stop Recording & Re-render Telemetry)**:
   - **Component-Scoped Performance Profiling**: Filter and choose a component to profile exact microsecond-resolution render times and value update latency.
   - **Start / Stop Recording Controls**:
     - Dedicated **"Start Recording"** button initiates an active measurement recording session for the chosen component.
     - Live recording session indicator with pulsing red glow and timer (`00:04`).
     - Real-time polling automatically captures re-renders, signal mutations, and effect executions triggered as the user interacts with the webpage.
     - **"Stop Recording"** concludes the session, freezes the recorded telemetry, and computes session KPIs:
       - Total recorded updates and total session duration.
       - Min, Max, and Average update latency across the entire recording session.
       - Chronological updates log specific to the recorded interaction.
   - **Key Performance Indicators (KPIs)**:
     - **Initial Render Time**: Time taken for template inlining, slot projection, DOM compilation, and mounting (evaluated against the 16.6ms 60 FPS frame budget).
     - **Value Update / Re-render Latency**: Live measurement of how much time is needed when signals change and trigger subscribed effects (displaying average, last, minimum, and maximum duration in milliseconds).
     - **Updates Processed**: Total count of value mutations and cumulative execution time spent updating.
   - **Signal & Effect Breakdown Table**: Comprehensive table tracking each signal and effect, displaying individual update counts, last execution duration, average latency, and total time spent.
   - **Recent Updates Timeline / Log**: Chronological live log with timestamps, triggers, and precise duration badges.
   - **Interactive Benchmark Button ("Test Update")**: Triggers an on-demand reactive signal mutation test directly on the active webpage component and immediately measures the roundtrip update latency!

6. **Dedicated F12 Developer Tools Tab (Like Angular DevTools)**:
   - Native integration directly into Chrome DevTools panel tab strip (alongside *Elements*, *Console*, *Sources*, *Network*).
   - Stays permanently open side-by-side or docked at the bottom while interacting with your application.
   - Automatically synchronizes with page reload (`F5`) and client-side route navigations.

---

## 📁 Directory Structure

```
purity-browser-extensions/chrome/
├── manifest.json       # Manifest V3 extension configuration (devtools_page & host permissions)
├── devtools.html       # DevTools background entry page
├── devtools.js         # Registers the top-level "Purity" panel in Chrome DevTools
├── panel.html          # Full DevTools interface (Components, Services, Reactivity, Metrics)
├── panel.css           # Adwaita glassmorphic styles tailored for full DevTools viewport
├── panel.js            # Main DevTools panel controller
├── inspector.js        # MAIN-world in-page telemetry & inspection script
├── popup.html          # Toolbar action launcher card pointing to F12 DevTools
├── popup.css           # Launcher card styling
├── popup.js            # Quick status checker for toolbar icon
├── icons/              # Extension icons (16px, 48px, 128px)
└── README.md           # Setup and usage guide
```

---

## 🚀 How to Load and Test in Google Chrome

1. Open Google Chrome (or any Chromium browser: Brave, Edge, Vivaldi, Arc).
2. In the URL address bar, enter:
   ```text
   chrome://extensions/
   ```
3. Enable **Developer mode** using the toggle switch located in the upper-right corner.
4. Click the **Load unpacked** button in the top toolbar.
5. In the file picker dialog, select this folder:
   ```text
   purity-browser-extensions/chrome
   ```
6. Open your Purity application (e.g., `http://localhost:5173` or any deployed Purity app).
7. **Use in F12 Developer Tools (Recommended — Like Angular DevTools)**:
   - Press **F12** (or `Ctrl+Shift+I` / right-click and choose **Inspect**).
   - In the top DevTools panel tabs (alongside *Elements*, *Console*, *Sources*, *Network*), click **"Purity"**.
   - The inspector stays permanently open docked alongside your app, automatically refreshes on page reload (`F5`), and never closes while interacting with the page!
8. **Use as Standalone Browser Tab or Toolbar Popup**:
   - Click the **Purity Inspector** icon in your browser extension toolbar.
   - Click **"Open in New Browser Tab"** to open the full Purity Inspector inside its own dedicated browser tab.

---

## 🛠️ Troubleshooting & DevTools Tips

- **DevTools Tab Not Showing**:
  1. DevTools must be opened on a regular web page (e.g. `http://localhost:5173`), **not** on internal browser pages like `chrome://extensions` or `about:blank`, because Chrome security disables extension tabs on internal pages.
  2. If DevTools was already open when you reloaded the extension, close DevTools (<kbd>F12</kbd>) and re-open it. Chrome only attaches extension panels when DevTools launches.
  3. If your DevTools window is narrow, Chrome moves tabs into the `>>` overflow chevron at the far right of the tab bar. Click `>>` to reveal "Purity".
  4. You can also click the extension toolbar icon and click **"Open in New Browser Tab"** to view Purity DevTools in a standard browser tab.
