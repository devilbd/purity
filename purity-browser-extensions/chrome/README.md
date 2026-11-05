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

5. **Resizable Window with Memory**:
   - Resizable via the corner drag handle in the bottom-right corner.
   - Persists chosen dimensions in `localStorage` and automatically restores them on launch.
   - Double-clicking the resize handle resets to the default size.

6. **Adwaita Glassmorphic Design System**:
   - Translucent frosted glass surfaces with specular borders.
   - Smooth GNOME transitions and system typography.
   - Native dark mode baseline with light mode support.

---

## 📁 Directory Structure

```
purity-browser-extensions/chrome/
├── manifest.json       # Manifest V3 extension configuration
├── background.js       # Background service worker (lifecycle & messaging)
├── inspector.js        # MAIN-world in-page inspector script
├── popup.html          # Three-tab inspector interface (Components, Services, Reactivity)
├── popup.css           # Adwaita glassmorphic styles with visual graph & resize handle
├── popup.js            # Controller handling inspection, tabs, graph visualization, and resizing
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
7. Click the **Purity Inspector** icon in your browser toolbar to inspect components, services, dependency graphs, and live signal-to-effect reactive connections!
