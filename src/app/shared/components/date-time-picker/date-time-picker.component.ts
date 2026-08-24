import { Component, signal } from '@purity/core';
import './date-time-picker.component.scss';

export interface DateRestriction {
    minDate?: Date;
    maxDate?: Date;
    daysBack?: number;
    daysForward?: number;
    weeksBack?: number;
    weeksForward?: number;
    monthsBack?: number;
    monthsForward?: number;
    yearsBack?: number;
    yearsForward?: number;
    pastOnly?: boolean;
    futureOnly?: boolean;
    disabledDates?: Date[];
    minTime?: string; // HH:mm format
    maxTime?: string; // HH:mm format
}

export interface CalendarDay {
    date: Date;
    time: number;
    dateNum: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    cellClass: string;
}

@Component({
    selector: 'date-time-picker',
    templateUrl: './src/app/shared/components/date-time-picker/date-time-picker.component.html',
})
export class DateTimePickerComponent {
    // Signals for state management
    public isOpen = signal<boolean>(false);
    public selectedDate = signal<Date | null>(null);
    public viewDate = signal<Date>(new Date());
    public enableBlur = signal<boolean>(false);
    public restrictions = signal<DateRestriction | null>(null);

    // Working (unconfirmed) signals
    public workingDate = signal<Date | null>(null);
    public workingHours = signal<number>(12);
    public workingMinutes = signal<number>(0);

    // View state
    public viewMode = signal<'calendar' | 'year'>('calendar');
    public placement = signal<'placement-bottom' | 'placement-top'>('placement-bottom');
    public alignPlacement = signal<'align-left' | 'align-right'>('align-left');

    // Callback hook
    public onDateSelected?: (date: Date) => void;

    private _hostEl?: HTMLElement;
    private _overlayEl?: HTMLElement;
    private _openedAt = 0;
    private _boundDocClick?: (e: MouseEvent) => void;
    private _boundKeydown?: (e: KeyboardEvent) => void;
    private _boundResize?: () => void;
    private _boundScroll?: () => void;

    private getHost(): HTMLElement | null {
        if (this._hostEl) return this._hostEl;
        const self = this as unknown as HTMLElement;
        if (self && typeof self.querySelector === 'function') {
            return self;
        }
        return null;
    }

    protected onInit(): void {
        const host = this as unknown as HTMLElement;
        this._hostEl = host;
        (host as any)._picker = this;
        this.initWorkingState();

        // Move the dropdown overlay element directly to document.body so it sits
        // above all other stacking contexts, cards, and windows at z-index: 9999
        setTimeout(() => {
            const overlay = host.querySelector('.picker-overlay') as HTMLElement | null;
            if (overlay && overlay.parentElement !== document.body) {
                document.body.appendChild(overlay);
                this._overlayEl = overlay;
                (overlay as any)._picker = this;
            }
        }, 0);

        this._boundDocClick = (event: MouseEvent) => {
            if (!this.isOpen()) return;
            if (Date.now() - this._openedAt < 150) return;

            const path = event.composedPath ? event.composedPath() : [];
            if (host && path.includes(host)) {
                return;
            }
            if (this._overlayEl && path.includes(this._overlayEl)) {
                return;
            }

            const target = event.target as Node | null;
            if (host && target && typeof host.contains === 'function' && host.contains(target)) {
                return;
            }
            if (this._overlayEl && target && typeof this._overlayEl.contains === 'function' && this._overlayEl.contains(target)) {
                return;
            }

            this.close();
        };

        this._boundKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        };

        this._boundResize = () => {
            if (this.isOpen()) {
                this.updateOverlayPosition();
            }
        };

        this._boundScroll = () => {
            if (this.isOpen()) {
                this.updateOverlayPosition();
            }
        };

        document.addEventListener('click', this._boundDocClick);
        window.addEventListener('keydown', this._boundKeydown);
        window.addEventListener('resize', this._boundResize);
        window.addEventListener('scroll', this._boundScroll, true);
    }

    public onDestroy(): void {
        if (this._boundDocClick) document.removeEventListener('click', this._boundDocClick);
        if (this._boundKeydown) window.removeEventListener('keydown', this._boundKeydown);
        if (this._boundResize) window.removeEventListener('resize', this._boundResize);
        if (this._boundScroll) window.removeEventListener('scroll', this._boundScroll, true);

        if (this._overlayEl && this._overlayEl.parentNode) {
            this._overlayEl.parentNode.removeChild(this._overlayEl);
            this._overlayEl = undefined;
        }
    }

    public disconnectedCallback(): void {
        this.onDestroy();
    }

    // Computed / Getters
    public get effectiveMinDate(): Date | null {
        const rest = this.restrictions();
        if (!rest) return null;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const bounds: (number | null)[] = [];

        if (rest.minDate) bounds.push(rest.minDate.getTime());
        if (rest.daysBack !== undefined) bounds.push(startOfToday.getTime() - rest.daysBack * 86400000);
        if (rest.weeksBack !== undefined) bounds.push(startOfToday.getTime() - rest.weeksBack * 7 * 86400000);
        if (rest.monthsBack !== undefined) {
            const d = new Date(startOfToday);
            d.setMonth(d.getMonth() - rest.monthsBack);
            bounds.push(d.getTime());
        }
        if (rest.yearsBack !== undefined) {
            const d = new Date(startOfToday);
            d.setFullYear(d.getFullYear() - rest.yearsBack);
            bounds.push(d.getTime());
        }
        if (rest.futureOnly) bounds.push(now.getTime());

        const validBounds = bounds.filter((b): b is number => b !== null);
        return validBounds.length > 0 ? new Date(Math.max(...validBounds)) : null;
    }

    public get effectiveMaxDate(): Date | null {
        const rest = this.restrictions();
        if (!rest) return null;

        const now = new Date();
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const bounds: (number | null)[] = [];

        if (rest.maxDate) bounds.push(rest.maxDate.getTime());
        if (rest.daysForward !== undefined) bounds.push(endOfToday.getTime() + rest.daysForward * 86400000);
        if (rest.weeksForward !== undefined) bounds.push(endOfToday.getTime() + rest.weeksForward * 7 * 86400000);
        if (rest.monthsForward !== undefined) {
            const d = new Date(endOfToday);
            d.setMonth(d.getMonth() + rest.monthsForward);
            bounds.push(d.getTime());
        }
        if (rest.yearsForward !== undefined) {
            const d = new Date(endOfToday);
            d.setFullYear(d.getFullYear() + rest.yearsForward);
            bounds.push(d.getTime());
        }
        if (rest.pastOnly) bounds.push(now.getTime());

        const validBounds = bounds.filter((b): b is number => b !== null);
        return validBounds.length > 0 ? new Date(Math.min(...validBounds)) : null;
    }

    public get years(): number[] {
        const currentYear = this.viewDate().getFullYear();
        const startYear = currentYear - 10;
        return Array.from({ length: 21 }, (_, i) => startYear + i);
    }

    public get viewYear(): number {
        return this.viewDate().getFullYear();
    }

    public get monthYearLabel(): string {
        const date = this.viewDate();
        return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    }

    public get workingHoursFormatted(): string {
        return String(this.workingHours()).padStart(2, '0');
    }

    public get workingMinutesFormatted(): string {
        return String(this.workingMinutes()).padStart(2, '0');
    }

    public get displayLabel(): string {
        const d = this.selectedDate();
        if (!d) return '+ choose date';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[d.getMonth()];
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        return `${month} ${day}, ${year} ${hours}:${mins}`;
    }

    public get calendarDays(): CalendarDay[] {
        const date = this.viewDate();
        const year = date.getFullYear();
        const month = date.getMonth();

        // First day of current month
        const firstDay = new Date(year, month, 1);
        const lastDayPreviousMonth = new Date(year, month, 0);
        const lastDayCurrentMonth = new Date(year, month + 1, 0);

        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const working = this.workingDate();
        const selectedCompare = working
            ? new Date(working.getFullYear(), working.getMonth(), working.getDate()).getTime()
            : null;

        // Days from previous month to fill the first row
        const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, lastDayPreviousMonth.getDate() - i);
            days.push(this.createCalendarDay(d, false, today, selectedCompare));
        }

        // Days of current month
        for (let i = 1; i <= lastDayCurrentMonth.getDate(); i++) {
            const d = new Date(year, month, i);
            days.push(this.createCalendarDay(d, true, today, selectedCompare));
        }

        // Days from next month to fill the last row
        const endDayOfWeek = lastDayCurrentMonth.getDay();
        const remainingDays = 6 - endDayOfWeek;
        for (let i = 1; i <= remainingDays; i++) {
            const d = new Date(year, month + 1, i);
            days.push(this.createCalendarDay(d, false, today, selectedCompare));
        }

        return days;
    }

    private createCalendarDay(
        date: Date,
        isCurrentMonth: boolean,
        today: Date,
        selectedTime: number | null,
    ): CalendarDay {
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

        const min = this.effectiveMinDate;
        const max = this.effectiveMaxDate;
        const rest = this.restrictions();

        let isDisabled = false;
        if (min && dayEnd < min.getTime()) isDisabled = true;
        if (max && dayStart > max.getTime()) isDisabled = true;

        if (rest?.disabledDates) {
            const isDisabledSpecific = rest.disabledDates.some(
                (d: Date) =>
                    d.getFullYear() === date.getFullYear() &&
                    d.getMonth() === date.getMonth() &&
                    d.getDate() === date.getDate(),
            );
            if (isDisabledSpecific) isDisabled = true;
        }

        const isToday = dayStart === today.getTime();
        const isSelected = dayStart === selectedTime;

        const cellClasses: string[] = ['day-cell'];
        if (!isCurrentMonth) cellClasses.push('off-month');
        if (isToday) cellClasses.push('today');
        if (isSelected) cellClasses.push('selected');
        if (isDisabled) cellClasses.push('disabled');

        return {
            date,
            time: date.getTime(),
            dateNum: date.getDate(),
            isCurrentMonth,
            isToday,
            isSelected,
            isDisabled,
            cellClass: cellClasses.join(' '),
        };
    }

    public initWorkingState(): void {
        const baseDate = this.selectedDate() || new Date();
        this.workingDate.set(this.selectedDate());
        this.viewDate.set(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));

        this.workingHours.set(baseDate.getHours());
        this.workingMinutes.set(baseDate.getMinutes());

        this.enforceTimeRestrictions();
    }

    public updateOverlayPosition(): void {
        const host = this.getHost();
        const overlay = this._overlayEl || (host?.querySelector?.('.picker-overlay') as HTMLElement | null);
        const toggleBtn = host?.querySelector?.('.picker-toggle') as HTMLElement | null;
        if (!overlay || !toggleBtn) return;

        const btnRect = toggleBtn.getBoundingClientRect();
        const overlayHeight = overlay.offsetHeight > 0 ? overlay.offsetHeight : 390;
        const overlayWidth = overlay.offsetWidth > 0 ? overlay.offsetWidth : 290;

        const spaceBelow = window.innerHeight - btnRect.bottom;
        const spaceAbove = btnRect.top;

        // Vertical placement (flip to top if cramped below)
        let top: number;
        if (spaceBelow < overlayHeight + 12 && spaceAbove > spaceBelow) {
            top = Math.max(12, btnRect.top - overlayHeight - 6);
            this.placement.set('placement-top');
        } else {
            top = Math.min(window.innerHeight - overlayHeight - 12, btnRect.bottom + 6);
            this.placement.set('placement-bottom');
        }

        // Horizontal placement (flip to right if cramped on right)
        let left: number;
        if (btnRect.left + overlayWidth > window.innerWidth - 12) {
            left = Math.max(12, btnRect.right - overlayWidth);
            this.alignPlacement.set('align-right');
        } else {
            left = Math.max(12, btnRect.left);
            this.alignPlacement.set('align-left');
        }

        overlay.style.position = 'fixed';
        overlay.style.top = `${Math.round(top)}px`;
        overlay.style.left = `${Math.round(left)}px`;
        overlay.style.zIndex = '9999';
    }

    public togglePicker(event?: MouseEvent): void {
        event?.stopPropagation();
        if (!this.isOpen()) {
            this.open();
        } else {
            this.close();
        }
    }

    public open(): void {
        const host = this.getHost();
        if (!this._overlayEl && host) {
            const overlay = host.querySelector('.picker-overlay') as HTMLElement | null;
            if (overlay && overlay.parentElement !== document.body) {
                document.body.appendChild(overlay);
                this._overlayEl = overlay;
                (overlay as any)._picker = this;
            }
        }

        this._openedAt = Date.now();
        this.initWorkingState();
        this.viewMode.set('calendar');
        this.isOpen.set(true);

        requestAnimationFrame(() => {
            this.updateOverlayPosition();
        });
        setTimeout(() => this.updateOverlayPosition(), 50);
    }

    public close(): void {
        this.isOpen.set(false);
    }

    public onCalendarGridClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        const btn = target?.closest('.day-cell') as HTMLElement | null;
        if (btn && btn.dataset.time) {
            const time = Number(btn.dataset.time);
            if (!isNaN(time)) {
                this.selectDayByTime(time);
            }
        }
    }

    public onYearGridClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        const btn = target?.closest('.year-cell') as HTMLElement | null;
        if (btn && btn.dataset.year) {
            const year = Number(btn.dataset.year);
            if (!isNaN(year)) {
                this.selectYear(year);
            }
        }
    }

    public selectDayByTime(time: number): void {
        const targetDate = new Date(time);
        const day = this.createCalendarDay(targetDate, true, new Date(), null);
        if (day.isDisabled) return;
        this.workingDate.set(targetDate);
        if (
            targetDate.getMonth() !== this.viewDate().getMonth() ||
            targetDate.getFullYear() !== this.viewDate().getFullYear()
        ) {
            this.viewDate.set(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
        }
        this.enforceTimeRestrictions();
    }

    public toggleYearPicker(): void {
        this.viewMode.update((v: string) => (v === 'calendar' ? 'year' : 'calendar'));
    }

    public selectYear(year: number): void {
        const current = this.viewDate();
        this.viewDate.set(new Date(year, current.getMonth(), 1));

        const working = this.workingDate();
        if (working) {
            const updated = new Date(working);
            updated.setFullYear(year);
            this.workingDate.set(updated);
        }

        this.viewMode.set('calendar');
    }

    public confirmSelection(): void {
        const working = this.workingDate() || new Date();
        const confirmed = new Date(working);
        this.updateDateWithTime(confirmed);
        this.selectedDate.set(confirmed);
        this.emitSelection();
        this.isOpen.set(false);
    }

    public prevMonth(): void {
        const current = this.viewDate();
        this.viewDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    }

    public nextMonth(): void {
        const current = this.viewDate();
        this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    }

    public onHoursInput(target: HTMLInputElement): void {
        let val = parseInt(target.value, 10);
        if (isNaN(val)) val = 0;
        this.workingHours.set(val);
        this.onTimeChange();
    }

    public onMinutesInput(target: HTMLInputElement): void {
        let val = parseInt(target.value, 10);
        if (isNaN(val)) val = 0;
        this.workingMinutes.set(val);
        this.onTimeChange();
    }

    public onTimeChange(): void {
        let h = this.workingHours();
        if (isNaN(h) || h < 0) h = 0;
        if (h > 23) h = 23;
        this.workingHours.set(h);

        let m = this.workingMinutes();
        if (isNaN(m) || m < 0) m = 0;
        if (m > 59) m = 59;
        this.workingMinutes.set(m);

        this.enforceTimeRestrictions();
    }

    private enforceTimeRestrictions(): void {
        const rest = this.restrictions();
        if (!rest) return;

        const working = this.workingDate();
        if (!working) return;

        const current = new Date(working);
        this.updateDateWithTime(current);

        const min = this.effectiveMinDate;
        const max = this.effectiveMaxDate;

        if (min && current.getTime() < min.getTime()) {
            this.applyDateToWorking(min);
            this.updateDateWithTime(current);
        }

        if (max && current.getTime() > max.getTime()) {
            this.applyDateToWorking(max);
            this.updateDateWithTime(current);
        }

        if (rest.minTime || rest.maxTime) {
            const timeVal = this.workingHours() * 60 + this.workingMinutes();

            if (rest.minTime) {
                const [minH, minM] = rest.minTime.split(':').map(Number);
                const minVal = minH * 60 + minM;
                if (timeVal < minVal) {
                    this.setWorkingTime(minH, minM);
                }
            }

            if (rest.maxTime) {
                const [maxH, maxM] = rest.maxTime.split(':').map(Number);
                const maxVal = maxH * 60 + maxM;
                if (timeVal > maxVal) {
                    this.setWorkingTime(maxH, maxM);
                }
            }
        }
    }

    private setWorkingTime(h24: number, m: number): void {
        this.workingHours.set(h24);
        this.workingMinutes.set(m);
    }

    private applyDateToWorking(date: Date): void {
        this.setWorkingTime(date.getHours(), date.getMinutes());
    }

    public handleTimeKeydown(event: KeyboardEvent): void {
        const target = event.target as HTMLInputElement;
        const key = event.key;

        const isControlKey = [
            'Backspace', 'Tab', 'Enter', 'Escape', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End',
        ].includes(key);

        if (isControlKey || (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(key.toLowerCase()))) {
            return;
        }

        if (!/^\d$/.test(key)) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (target.selectionStart !== target.selectionEnd) {
            return;
        }

        if (target.value.length >= 2) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    public handleWheel(event: WheelEvent, type: 'hours' | 'minutes'): void {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 1 : -1;

        if (type === 'hours') {
            let h = this.workingHours() + delta;
            if (h > 23) h = 0;
            if (h < 0) h = 23;
            this.workingHours.set(h);
        } else {
            let m = this.workingMinutes() + delta;
            if (m > 59) m = 0;
            if (m < 0) m = 59;
            this.workingMinutes.set(m);
        }
        this.onTimeChange();
    }

    public setDate(date: Date | null): void {
        this.selectedDate.set(date);
        this.initWorkingState();
    }

    public setRestrictions(restrictions: DateRestriction | null): void {
        this.restrictions.set(restrictions);
        this.enforceTimeRestrictions();
    }

    public setBlur(enable: boolean): void {
        this.enableBlur.set(enable);
    }

    private updateDateWithTime(date: Date): void {
        date.setHours(this.workingHours(), this.workingMinutes(), 0, 0);
    }

    private emitSelection(): void {
        const date = this.selectedDate();
        if (date) {
            this.onDateSelected?.(date);
            const host = this.getHost();
            host?.dispatchEvent?.(
                new CustomEvent('date-selected', {
                    detail: { date },
                    bubbles: true,
                    composed: true,
                }),
            );
        }
    }
}
