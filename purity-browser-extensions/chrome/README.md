# Purity Chrome Inspector Extension

An official DevTools extension for the **Purity Framework** built with **Manifest V3**.

---

## 🔍 Features

1. **Automatic Detection**:
   - Detects whether the active tab is running a Purity application.
   - Shows active Purity version and status indicator in real time.

2. **Components Tab (First Tab)**:
   - Displays all registered and mounted Purity components as names (e.g. `AppComponent`, `HeaderComponent`, `DateRangePickerComponent`).
   - Filter components via instant search.
   - **Clicking a component reveals**:
     - **Injected Services (`@Injectable`)**: which services the component uses, with direct shortcut navigation to the Services tab.
     - **Signals & Computed Values**: property names, signal types (`signal` vs `computed`), and live reactive values formatted with syntax colors.
     - **Reactive Effects & Directives**: all active template binding effects, `onInit` effects, active directives, and form validators.

3. **Services Tab (Second Tab)**:
   - Displays all registered `@Injectable` services in the Dependency Injection container.
   - Filter services via instant search.
   - **Clicking a service reveals**:
     - **Service Dependencies ("Depends on")**: represents which other services this service depends on (e.g. `Router` depending on `SeoService` or `HttpClient`).
     - **Depended On By ("Used by")**: represents which components and other services inject/depend on this service (e.g. `ThemeService` used by `HeaderComponent`, `AnalogueClockComponent`).
     - **Service Signals**: signals managed inside the service with live values.

4. **Adwaita Glassmorphic Design System**:
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
├── popup.html          # Extension popup markup
├── popup.css           # Adwaita glassmorphic styles
├── popup.js            # Popup view controller & reactive inspector logic
├── icons/              # Extension icons
│   ├── icon-16.png     # 16x16 icon (favicon / context menu)
│   ├── icon-48.png     # 48x48 icon (extensions manager)
│   └── icon-128.png    # 128x128 icon (Chrome Web Store / install)
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
7. Click the **Purity Inspector** icon in your browser toolbar to inspect components, services, dependencies, signals, and effects!
