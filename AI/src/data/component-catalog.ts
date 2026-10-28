import { ComponentMetadata } from '../types.js';

export const COMPONENT_CATALOG: ComponentMetadata[] = [
  {
    name: 'SwitchButtonComponent',
    selector: 'switch-button',
    description: 'Adwaita toggle switch component with fine-grained signals and programmatic control.',
    category: 'form',
    inputs: [
      { name: 'checked', type: 'boolean | string', description: 'Initial checked state (supports boolean or "true")', default: 'false' },
      { name: 'disabled', type: 'boolean | string', description: 'Whether the switch is interactive', default: 'false' }
    ],
    signals: [
      { name: 'checked', type: 'Signal<boolean>', description: 'Current toggle state signal' },
      { name: 'disabled', type: 'Signal<boolean>', description: 'Disabled state signal' }
    ],
    methods: [
      { name: 'toggle', signature: 'toggle(): void', description: 'Toggles between checked and unchecked' },
      { name: 'check', signature: 'check(): void', description: 'Sets state to checked' },
      { name: 'uncheck', signature: 'uncheck(): void', description: 'Sets state to unchecked' }
    ],
    events: [
      { name: 'change', description: 'Dispatched when state changes with detail: { checked: boolean }' }
    ],
    slots: [],
    htmlExample: `<!-- Declarative attribute sync with parent signal -->
<switch-button checked="{{ isDarkMode() }}" onchange="handleThemeToggle($event)"></switch-button>`,
    typescriptExample: `import { Component, signal, ViewChild } from '@purity/core';
import { SwitchButtonComponent } from '@components/switch-button/switch-button.component';

@Component({ selector: 'settings-view' })
export class SettingsView {
  @ViewChild('switch-button')
  toggleSwitch?: SwitchButtonComponent;

  isDarkMode = signal(true);

  handleThemeToggle(e: CustomEvent) {
    this.isDarkMode.set(e.detail.checked);
  }
}`
  },
  {
    name: 'ModalViewComponent',
    selector: 'modal-view',
    description: 'Floating Adwaita dialog with open, close, maximize, backdrop blur, and slotted regions.',
    category: 'overlay',
    inputs: [
      { name: 'is-open', type: 'boolean | string', description: 'Visibility state of the modal', default: 'false' },
      { name: 'title', type: 'string', description: 'Modal header title text', default: '""' }
    ],
    signals: [
      { name: 'isOpen', type: 'Signal<boolean>', description: 'Modal open/closed reactive state' },
      { name: 'isMaximized', type: 'Signal<boolean>', description: 'Maximized full-screen state' }
    ],
    methods: [
      { name: 'open', signature: 'open(): void', description: 'Opens the modal dialog' },
      { name: 'close', signature: 'close(): void', description: 'Closes the modal dialog' },
      { name: 'toggle', signature: 'toggle(): void', description: 'Toggles open/close state' },
      { name: 'maximize', signature: 'maximize(): void', description: 'Toggles maximized state' }
    ],
    events: [
      { name: 'modal-opened', description: 'Fired when modal opens' },
      { name: 'modal-closed', description: 'Fired when modal closes' }
    ],
    slots: [
      { name: 'header', description: 'Custom header content' },
      { name: 'default', description: 'Body content' },
      { name: 'footer', description: 'Action buttons / footer' }
    ],
    htmlExample: `<modal-view is-open="{{ showDialog() }}" title="Confirm Action">
  <p>Are you sure you want to proceed?</p>
  <div slot="footer">
    <button class="button-default" onclick="showDialog.set(false)">Cancel</button>
    <button class="button-primary" onclick="confirmAction()">Confirm</button>
  </div>
</modal-view>`,
    typescriptExample: `import { Component, signal } from '@purity/core';

@Component({ selector: 'user-manager' })
export class UserManager {
  showDialog = signal(false);

  confirmAction() {
    this.showDialog.set(false);
  }
}`
  },
  {
    name: 'ExpanderComponent',
    selector: 'expander',
    description: 'Collapsible accordion card with animated header, toggle methods, and slot support.',
    category: 'layout',
    inputs: [
      { name: 'title', type: 'string', description: 'Title displayed on the expander header', default: '""' },
      { name: 'is-expanded', type: 'boolean | string', description: 'Whether the expander is currently open', default: 'false' }
    ],
    signals: [
      { name: 'isExpanded', type: 'Signal<boolean>', description: 'Expanded reactive state signal' }
    ],
    methods: [
      { name: 'toggle', signature: 'toggle(): void', description: 'Toggles expanded/collapsed state' },
      { name: 'expand', signature: 'expand(): void', description: 'Expands the content' },
      { name: 'collapse', signature: 'collapse(): void', description: 'Collapses the content' }
    ],
    events: [
      { name: 'expander-toggled', description: 'Dispatched with detail: { expanded: boolean }' }
    ],
    slots: [
      { name: 'header', description: 'Optional custom header content' },
      { name: 'default', description: 'Collapsible body content' }
    ],
    htmlExample: `<!-- Direct structural repeater interoperability -->
<expander for="let section of sections" title="{{ section.name }}" is-expanded="{{ section.isOpen }}">
  <p>{{ section.details }}</p>
</expander>`,
    typescriptExample: `import { Component, signal } from '@purity/core';

@Component({ selector: 'faq-section' })
export class FaqSection {
  sections = signal([
    { name: 'Reactivity', isOpen: true, details: 'Synchronous signals with automatic tracking' },
    { name: 'Components', isOpen: false, details: 'Native Custom Elements v1' }
  ]);
}`
  },
  {
    name: 'PopoverComponent',
    selector: 'popover',
    description: 'Anchored floating container with viewport collision auto-flipping and directional placement.',
    category: 'overlay',
    inputs: [
      { name: 'is-open', type: 'boolean | string', description: 'Popover visibility state', default: 'false' },
      { name: 'target', type: 'string', description: 'CSS selector or ID of anchor trigger element', default: '""' },
      { name: 'placement', type: '"top" | "bottom" | "left" | "right"', description: 'Preferred anchor placement', default: '"bottom"' }
    ],
    signals: [
      { name: 'isOpen', type: 'Signal<boolean>', description: 'Current open signal' }
    ],
    methods: [
      { name: 'open', signature: 'open(): void', description: 'Shows the popover' },
      { name: 'close', signature: 'close(): void', description: 'Hides the popover' },
      { name: 'toggle', signature: 'toggle(): void', description: 'Toggles popover visibility' }
    ],
    events: [
      { name: 'popover-opened', description: 'Dispatched when popover displays' },
      { name: 'popover-closed', description: 'Dispatched when popover closes' }
    ],
    slots: [
      { name: 'default', description: 'Popover card contents' }
    ],
    htmlExample: `<button id="btnOptions" class="button-default" onclick="showOptions.set(!showOptions())">Options</button>
<popover target="#btnOptions" is-open="{{ showOptions() }}" placement="bottom">
  <div class="popover-menu">
    <button onclick="edit()">Edit</button>
    <button onclick="deleteItem()">Delete</button>
  </div>
</popover>`,
    typescriptExample: `import { Component, signal } from '@purity/core';

@Component({ selector: 'action-bar' })
export class ActionBar {
  showOptions = signal(false);
}`
  },
  {
    name: 'DateTimePickerComponent',
    selector: 'date-time-picker',
    description: 'Reactive calendar and time selector with body teleportation and Adwaita styling.',
    category: 'form',
    inputs: [
      { name: 'value', type: 'string', description: 'ISO date string or current value', default: '""' },
      { name: 'format', type: 'string', description: 'Date format string (e.g. "YYYY-MM-DD")', default: '"YYYY-MM-DD"' },
      { name: 'mode', type: '"date" | "time" | "datetime"', description: 'Picker selection mode', default: '"date"' }
    ],
    signals: [
      { name: 'selectedDate', type: 'Signal<Date | null>', description: 'Currently selected date signal' }
    ],
    methods: [
      { name: 'open', signature: 'open(): void', description: 'Opens the calendar popup' },
      { name: 'close', signature: 'close(): void', description: 'Closes the calendar popup' },
      { name: 'setDate', signature: 'setDate(date: Date): void', description: 'Programmatically selects a date' }
    ],
    events: [
      { name: 'date-change', description: 'Dispatched with detail: { date: Date, formatted: string }' }
    ],
    slots: [],
    htmlExample: `<date-time-picker value="{{ eventDate() }}" ondate-change="handleDateSelect($event)"></date-time-picker>`,
    typescriptExample: `import { Component, signal } from '@purity/core';

@Component({ selector: 'event-form' })
export class EventForm {
  eventDate = signal('2026-10-28');
  handleDateSelect(e: CustomEvent) {
    this.eventDate.set(e.detail.formatted);
  }
}`
  },
  {
    name: 'LoaderComponent',
    selector: 'loader-component',
    description: 'Glassmorphic spinner and progress indicator with show/hide methods and message signal.',
    category: 'overlay',
    inputs: [
      { name: 'is-loading', type: 'boolean | string', description: 'Loading state', default: 'false' },
      { name: 'message', type: 'string', description: 'Optional status message text', default: '""' }
    ],
    signals: [
      { name: 'isLoading', type: 'Signal<boolean>', description: 'Loading state signal' },
      { name: 'message', type: 'Signal<string>', description: 'Current message signal' }
    ],
    methods: [
      { name: 'show', signature: 'show(message?: string): void', description: 'Activates loader with optional message' },
      { name: 'hide', signature: 'hide(): void', description: 'Hides loader' }
    ],
    events: [],
    slots: [],
    htmlExample: `<loader-component is-loading="{{ isFetching() }}" message="Syncing records..."></loader-component>`,
    typescriptExample: `import { Component, signal } from '@purity/core';

@Component({ selector: 'data-grid' })
export class DataGrid {
  isFetching = signal(false);
}`
  },
  {
    name: 'ProfileAvatarComponent',
    selector: 'profile-avatar',
    description: 'User avatar displaying image, fallback initials, presence status badge, and custom sizing.',
    category: 'widget',
    inputs: [
      { name: 'src', type: 'string', description: 'Avatar image URL', default: '""' },
      { name: 'name', type: 'string', description: 'User full name for initial computation', default: '""' },
      { name: 'status', type: '"online" | "offline" | "busy" | "away"', description: 'Presence indicator status', default: '"offline"' },
      { name: 'size', type: '"sm" | "md" | "lg" | "xl"', description: 'Avatar dimensions', default: '"md"' }
    ],
    signals: [
      { name: 'status', type: 'Signal<string>', description: 'Presence status signal' }
    ],
    methods: [],
    events: [],
    slots: [],
    htmlExample: `<profile-avatar src="{{ user().avatar }}" name="{{ user().fullName }}" status="online" size="md"></profile-avatar>`,
    typescriptExample: `import { Component, signal } from '@purity/core';

@Component({ selector: 'user-badge' })
export class UserBadge {
  user = signal({ fullName: 'Ada Lovelace', avatar: '' });
}`
  },
  {
    name: 'RadialContextMenuComponent',
    selector: 'radial-context-menu',
    description: 'Circular context menu with pie segments, icon badges, submenus, and mouse trigger.',
    category: 'navigation',
    inputs: [
      { name: 'radius', type: 'number', description: 'Outer circle radius in pixels', default: '120' }
    ],
    signals: [
      { name: 'isOpen', type: 'Signal<boolean>', description: 'Menu open signal' }
    ],
    methods: [
      { name: 'openAt', signature: 'openAt(x: number, y: number): void', description: 'Opens menu at specific viewport coordinates' },
      { name: 'close', signature: 'close(): void', description: 'Closes radial menu' }
    ],
    events: [
      { name: 'item-selected', description: 'Dispatched with detail: { action: string, data?: any }' }
    ],
    slots: [
      { name: 'default', description: 'Menu item icons and actions' }
    ],
    htmlExample: `<div oncontextmenu="handleContextMenu($event)">
  Right click here
  <radial-context-menu id="radialMenu"></radial-context-menu>
</div>`,
    typescriptExample: `import { Component, ViewChild } from '@purity/core';
import { RadialContextMenuComponent } from '@components/radial-context-menu/radial-context-menu.component';

@Component({ selector: 'canvas-view' })
export class CanvasView {
  @ViewChild('#radialMenu')
  radialMenu?: RadialContextMenuComponent;

  handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    this.radialMenu?.openAt(e.clientX, e.clientY);
  }
}`
  },
  {
    name: 'NavigationMenuComponent',
    selector: 'navigation-menu',
    description: 'Draggable floating radial navigation bar with quick routes, glassmorphic backdrop, and Breeze cursors.',
    category: 'navigation',
    inputs: [],
    signals: [
      { name: 'isExpanded', type: 'Signal<boolean>', description: 'Menu expansion state signal' }
    ],
    methods: [
      { name: 'toggle', signature: 'toggle(): void', description: 'Toggles expanded floating items' }
    ],
    events: [],
    slots: [],
    htmlExample: `<navigation-menu></navigation-menu>`,
    typescriptExample: `import { Component } from '@purity/core';

@Component({ selector: 'app-root' })
export class AppRoot {}`
  },
  {
    name: 'AnalogueClockComponent',
    selector: 'analogue-clock',
    description: '2D Canvas analogue clock widget with smooth sweep hands, configurable theme, and timezone support.',
    category: 'widget',
    inputs: [
      { name: 'size', type: 'number', description: 'Canvas dimension in pixels', default: '200' },
      { name: 'timezone', type: 'string', description: 'IANA timezone string (e.g. "UTC", "America/New_York")', default: '"local"' }
    ],
    signals: [
      { name: 'currentTime', type: 'Signal<Date>', description: 'Current ticking clock time' }
    ],
    methods: [],
    events: [],
    slots: [],
    htmlExample: `<analogue-clock size="240" timezone="UTC"></analogue-clock>`,
    typescriptExample: `import { Component } from '@purity/core';

@Component({ selector: 'clock-dashboard' })
export class ClockDashboard {}`
  }
];
