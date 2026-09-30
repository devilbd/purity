/**
 * Purity Framework - Shared UI Components, Directives, Behaviors & Services
 * Entry point for 'purity-world-ui'.
 */

import './styles/_ui.scss';

// Directives
export {
    DropdownDirective,
    DropdownDirective as DropdownComponent, // Alias specifically requested: import { DropdownComponent } from 'purity-world-ui'
    DropdownDirective as DropDownDirective, // Ergonomics alias
    type DropdownSelectDetail,
} from './app/shared/directives/dropdown/dropdown.directive';

export {
    HighlightDirective,
} from './app/shared/directives/highlight/highlight.directive';

// Components
export {
    SwitchButtonComponent,
} from './app/shared/components/switch-button/switch-button.component';

export {
    ModalViewComponent,
} from './app/shared/components/modal/modal-view.component';

export {
    DateTimePickerComponent,
    type DateRestriction,
    type CalendarDay,
} from './app/shared/components/date-time-picker/date-time-picker.component';

export {
    NotificationComponent,
    type PositionGroup,
} from './app/shared/components/notification/notification.component';

export {
    LoaderComponent,
} from './app/shared/components/loader/loader.component';

export {
    PopoverComponent,
    PopoverDirective,
    type PopoverPosition,
} from './app/shared/components/popover/popover.component';

export {
    RadialContextMenuComponent,
    type MenuItem,
} from './app/shared/components/radial-context-menu/radial-context-menu.component';

export {
    ExpanderComponent,
} from './app/shared/components/expander/expander.component';

export {
    NavigationMenuComponent,
} from './app/shared/components/navigation-menu/navigation-menu.component';

// Widgets
export {
    AnalogueClockComponent,
    type ClockOptions,
} from './app/shared/widgets/analogue-clock/analogue-clock.component';

// Behaviors
export {
    drag,
    drag as draggable,
    type DraggableOptions,
} from './app/shared/behaviors/draggable/draggable';

export {
    droppable,
    findDropTarget,
    type DroppableOptions,
} from './app/shared/behaviors/droppable/droppable';

// Interceptors
export {
    AuthInterceptor,
} from './app/shared/interceptors/auth.interceptor';

export {
    LoggingInterceptor,
} from './app/shared/interceptors/logging.interceptor';

// Pipes
export {
    DatePipe,
} from './app/shared/pipes/date.pipe';

export {
    MyTransformPipe,
    MyTransformPipe as TransformSamplePipe,
} from './app/shared/pipes/transform-sample.pipe';

export {
    UppercasePipe,
} from './app/shared/pipes/uppercase.pipe';

// Validators
export {
    FormsValidationValidator,
} from './app/shared/validators/forms-validation.validator';

// UI Services & Types
export {
    ThemeService,
    type AppTheme,
} from './data/theme.service';

export {
    NotifyService,
    type NotificationType,
    type NotificationPosition,
    type NotificationOptions,
    type NotificationItem,
} from './data/notify.service';
