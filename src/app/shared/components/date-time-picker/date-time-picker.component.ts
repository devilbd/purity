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

    private _hostEl?: HTMLElement | null;
    private _overlayEl?: HTMLElement | null;
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
        this.initWorkingState();

        const overlay = host.querySelector('.picker-overlay') as HTMLElement | null;
        if (overlay) {
            this._overlayEl = overlay;
            overlay.classList.toggle('blur-enabled', this.enableBlur());
        }

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

            this.close();
        };

        this._boundKeydown = (event: KeyboardEvent) => {
            if (this.isOpen() && event.key === 'Escape') {
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

    public get displayLabel(): string {
        const date = this.selectedDate();
        if (!date) {
            return 'Select Date & Time';
        }
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d} ${hh}:${mm}`;
    }

    public get monthYearLabel(): string {
        const v = this.viewDate();
        return v.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }

    public get viewYear(): number {
        return this.viewDate().getFullYear();
    }

    public get workingHoursFormatted(): string {
        return String(this.workingHours()).padStart(2, '0');
    }

    public get workingMinutesFormatted(): string {
        return String(this.workingMinutes()).padStart(2, '0');
    }

    public get calendarDays(): CalendarDay[] {
        const currentView = this.viewDate();
        const year = currentView.getFullYear();
        const month = currentView.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startDayIndex = firstDayOfMonth.getDay();
        const totalDaysInMonth = lastDayOfMonth.getDate();

        const days: CalendarDay[] = [];
        const today = new Date();
        const working = this.workingDate();

        // 1. Previous month trailing days
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        for (let i = startDayIndex - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthLastDate - i);
            days.push(this.createCalendarDay(date, false, today, working));
        }

        // 2. Current month days
        for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
            const date = new Date(year, month, dayNum);
            days.push(this.createCalendarDay(date, true, today, working));
        }

        // 3. Next month leading days to fill 42 cells grid (6 rows of 7)
        const remainingCells = 42 - days.length;
        for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
            const date = new Date(year, month + 1, nextDay);
            days.push(this.createCalendarDay(date, false, today, working));
        }

        return days;
    }

    public get years(): number[] {
        const currentYear = this.viewYear;
        const yearsList: number[] = [];
        const start = currentYear - 12;
        const end = currentYear + 15;

        for (let yr = start; yr <= end; yr++) {
            yearsList.push(yr);
        }
        return yearsList;
    }

    private createCalendarDay(
        date: Date,
        isCurrentMonth: boolean,
        today: Date,
        working: Date | null,
    ): CalendarDay {
        const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        const isSelected =
            working !== null &&
            date.getDate() === working.getDate() &&
            date.getMonth() === working.getMonth() &&
            date.getFullYear() === working.getFullYear();

        const isDisabled = this.isDateDisabled(date);

        const classes = ['day-cell'];
        if (!isCurrentMonth) classes.push('off-month');
        if (isToday) classes.push('today');
        if (isSelected) classes.push('selected');
        if (isDisabled) classes.push('disabled');

        return {
            date,
            time: date.getTime(),
            dateNum: date.getDate(),
            isCurrentMonth,
            isToday,
            isSelected,
            isDisabled,
            cellClass: classes.join(' '),
        };
    }

    private isDateDisabled(date: Date): boolean {
        const min = this.effectiveMinDate;
        const max = this.effectiveMaxDate;

        const checkTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

        if (min) {
            const minTime = new Date(min.getFullYear(), min.getMonth(), min.getDate()).getTime();
            if (checkTime < minTime) return true;
        }

        if (max) {
            const maxTime = new Date(max.getFullYear(), max.getMonth(), max.getDate()).getTime();
            if (checkTime > maxTime) return true;
        }

        const rest = this.restrictions();
        if (rest?.disabledDates && rest.disabledDates.length > 0) {
            for (const disabled of rest.disabledDates) {
                if (
                    date.getDate() === disabled.getDate() &&
                    date.getMonth() === disabled.getMonth() &&
                    date.getFullYear() === disabled.getFullYear()
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    private initWorkingState(): void {
        const sel = this.selectedDate();
        if (sel) {
            this.workingDate.set(new Date(sel));
            this.workingHours.set(sel.getHours());
            this.workingMinutes.set(sel.getMinutes());
            this.viewDate.set(new Date(sel.getFullYear(), sel.getMonth(), 1));
        } else {
            const now = new Date();
            this.workingDate.set(null);
            this.workingHours.set(12);
            this.workingMinutes.set(0);
            this.viewDate.set(new Date(now.getFullYear(), now.getMonth(), 1));
        }
        this.enforceTimeRestrictions();
    }

    private updateOverlayPosition(): void {
        const host = this.getHost();
        const overlay = this._overlayEl || (host?.querySelector('.picker-overlay') as HTMLElement | null);
        if (!host || !overlay) return;

        const trigger = host.querySelector('.picker-toggle') as HTMLElement | null;
        if (!trigger) return;

        const triggerRect = trigger.getBoundingClientRect();
        const overlayHeight = 380;
        const overlayWidth = 290;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        let placeTop = false;
        if (spaceBelow < overlayHeight && spaceAbove >= overlayHeight) {
            placeTop = true;
        }

        this.placement.set(placeTop ? 'placement-top' : 'placement-bottom');

        let top = placeTop ? triggerRect.top - overlayHeight - 6 : triggerRect.bottom + 6;
        let left = triggerRect.left;

        if (left + overlayWidth > viewportWidth - 10) {
            left = Math.max(10, viewportWidth - overlayWidth - 10);
            this.alignPlacement.set('align-right');
        } else {
            this.alignPlacement.set('align-left');
        }

        if (top < 10) top = 10;
        if (top + overlayHeight > viewportHeight - 10) {
            top = Math.max(10, viewportHeight - overlayHeight - 10);
        }

        overlay.style.top = `${top}px`;
        overlay.style.left = `${left}px`;
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
            this._overlayEl = host.querySelector('.picker-overlay') as HTMLElement | null;
        }

        this._openedAt = Date.now();
        this.initWorkingState();
        this.viewMode.set('calendar');
        this.isOpen.set(true);

        if (this._overlayEl) {
            this._overlayEl.classList.add('is-open');
            this._overlayEl.classList.remove('is-closed');
            this._overlayEl.classList.toggle('blur-enabled', this.enableBlur());
        }

        requestAnimationFrame(() => {
            this.updateOverlayPosition();
        });
        setTimeout(() => this.updateOverlayPosition(), 50);
    }

    public close(): void {
        this.isOpen.set(false);
        if (this._overlayEl) {
            this._overlayEl.classList.remove('is-open');
            this._overlayEl.classList.add('is-closed');
        }
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
        const nextMode = this.viewMode() === 'calendar' ? 'year' : 'calendar';
        this.viewMode.set(nextMode);
        if (this._overlayEl) {
            const calBody = this._overlayEl.querySelector('.calendar-body');
            const yearOverlay = this._overlayEl.querySelector('.year-selector-overlay');
            if (calBody) {
                calBody.classList.toggle('blurred', this.enableBlur() && nextMode === 'year');
            }
            if (yearOverlay) {
                yearOverlay.classList.toggle('is-visible', nextMode === 'year');
                yearOverlay.classList.toggle('is-hidden', nextMode !== 'year');
            }
        }
    }

    public selectYear(year: number): void {
        const cur = this.viewDate();
        this.viewDate.set(new Date(year, cur.getMonth(), 1));
        this.viewMode.set('calendar');
        if (this._overlayEl) {
            const calBody = this._overlayEl.querySelector('.calendar-body');
            const yearOverlay = this._overlayEl.querySelector('.year-selector-overlay');
            if (calBody) calBody.classList.remove('blurred');
            if (yearOverlay) {
                yearOverlay.classList.remove('is-visible');
                yearOverlay.classList.add('is-hidden');
            }
        }
    }

    public prevMonth(): void {
        const cur = this.viewDate();
        this.viewDate.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
    }

    public nextMonth(): void {
        const cur = this.viewDate();
        this.viewDate.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
    }

    public onHoursInput(inputEl: HTMLInputElement): void {
        const val = inputEl.value.replace(/\D/g, '');
        let num = parseInt(val, 10);
        if (isNaN(num)) num = 0;
        if (num > 23) num = 23;
        if (num < 0) num = 0;
        this.workingHours.set(num);
    }

    public onMinutesInput(inputEl: HTMLInputElement): void {
        const val = inputEl.value.replace(/\D/g, '');
        let num = parseInt(val, 10);
        if (isNaN(num)) num = 0;
        if (num > 59) num = 59;
        if (num < 0) num = 0;
        this.workingMinutes.set(num);
    }

    public onTimeChange(): void {
        this.enforceTimeRestrictions();
    }

    public handleTimeKeydown(event: KeyboardEvent, type?: 'hours' | 'minutes'): void {
        const target = event.target as HTMLInputElement;
        const key = event.key;

        if (key === 'ArrowUp' || key === 'ArrowDown') {
            event.preventDefault();
            event.stopPropagation();
            const delta = key === 'ArrowUp' ? 1 : -1;
            const isHours = type === 'hours' || target.getAttribute('aria-label') === 'Hours';
            if (isHours) {
                let h = this.workingHours() + delta;
                if (h > 23) h = 0;
                if (h < 0) h = 23;
                this.workingHours.set(h);
                target.value = this.workingHoursFormatted;
            } else {
                let m = this.workingMinutes() + delta;
                if (m > 59) m = 0;
                if (m < 0) m = 59;
                this.workingMinutes.set(m);
                target.value = this.workingMinutesFormatted;
            }
            this.onTimeChange();
            target.select();
            return;
        }

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
        event.stopPropagation();
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

        const inputEl = event.target as HTMLInputElement | null;
        if (inputEl) {
            inputEl.value = type === 'hours' ? this.workingHoursFormatted : this.workingMinutesFormatted;
            inputEl.select();
        }
    }

    public confirmSelection(): void {
        let work = this.workingDate();
        if (!work) {
            work = new Date();
            if (this.isDateDisabled(work)) {
                return;
            }
        }

        const result = new Date(
            work.getFullYear(),
            work.getMonth(),
            work.getDate(),
            this.workingHours(),
            this.workingMinutes(),
            0,
            0,
        );

        this.selectedDate.set(result);
        this.emitSelection();
        this.close();
    }

    private enforceTimeRestrictions(): void {
        const work = this.workingDate();
        const rest = this.restrictions();
        if (!rest) return;

        const isTodayOrMin =
            work &&
            rest.minDate &&
            work.getDate() === rest.minDate.getDate() &&
            work.getMonth() === rest.minDate.getMonth() &&
            work.getFullYear() === rest.minDate.getFullYear();

        if (isTodayOrMin || !work) {
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
        if (this._overlayEl) {
            this._overlayEl.classList.toggle('blur-enabled', enable);
        }
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
