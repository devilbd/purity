import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DateTimePickerComponent, type DateRestriction } from './date-time-picker.component';

describe('DateTimePickerComponent', () => {
    let element: HTMLElement;
    let picker: DateTimePickerComponent;

    beforeEach(() => {
        element = document.createElement('date-time-picker');
        document.body.appendChild(element);
        picker = element as unknown as DateTimePickerComponent;
    });

    afterEach(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        const overlays = document.querySelectorAll('.picker-overlay');
        overlays.forEach((o) => o.remove());
    });

    it('should initialize with default values', () => {
        expect(picker.isOpen()).toBe(false);
        expect(picker.selectedDate()).toBeNull();
        expect(picker.viewMode()).toBe('calendar');
        expect(picker.enableBlur()).toBe(false);
        expect(picker.restrictions()).toBeNull();
        expect(picker.displayLabel).toBe('Select Date & Time');
    });

    it('should format displayLabel when selectedDate is set', () => {
        const testDate = new Date(2026, 4, 15, 14, 30); // 2026-05-15 14:30
        picker.setDate(testDate);

        expect(picker.selectedDate()).toEqual(testDate);
        expect(picker.displayLabel).toBe('2026-05-15 14:30');
    });

    it('should open, close, and toggle picker overlay', () => {
        expect(picker.isOpen()).toBe(false);

        picker.open();
        expect(picker.isOpen()).toBe(true);

        picker.close();
        expect(picker.isOpen()).toBe(false);

        picker.togglePicker();
        expect(picker.isOpen()).toBe(true);

        picker.togglePicker();
        expect(picker.isOpen()).toBe(false);
    });

    it('should generate a 42-day calendarDays grid with correct month and year', () => {
        picker.viewDate.set(new Date(2026, 8, 1)); // September 2026

        const days = picker.calendarDays;
        expect(days.length).toBe(42);

        // Count current month days in Sept (30 days)
        const currentMonthDays = days.filter((d) => d.isCurrentMonth);
        expect(currentMonthDays.length).toBe(30);

        // First day of Sept 2026 is Tuesday (index 2) -> 2 trailing days from August
        const prevMonthDays = days.slice(0, 2);
        expect(prevMonthDays.every((d) => !d.isCurrentMonth)).toBe(true);

        // Remaining 10 days from October to make 42
        const nextMonthDays = days.slice(32);
        expect(nextMonthDays.length).toBe(10);
        expect(nextMonthDays.every((d) => !d.isCurrentMonth)).toBe(true);
    });

    it('should navigate previous and next months', () => {
        picker.viewDate.set(new Date(2026, 5, 1)); // June 2026

        picker.nextMonth();
        expect(picker.viewDate().getMonth()).toBe(6); // July
        expect(picker.viewDate().getFullYear()).toBe(2026);

        picker.prevMonth();
        picker.prevMonth();
        expect(picker.viewDate().getMonth()).toBe(4); // May
        expect(picker.viewDate().getFullYear()).toBe(2026);
    });

    it('should toggle year picker view mode and select year', () => {
        picker.viewDate.set(new Date(2026, 3, 1)); // April 2026

        expect(picker.viewMode()).toBe('calendar');
        picker.toggleYearPicker();
        expect(picker.viewMode()).toBe('year');

        const years = picker.years;
        expect(years.length).toBe(28); // 12 back + current + 15 forward
        expect(years).toContain(2026);
        expect(years).toContain(2030);

        picker.selectYear(2030);
        expect(picker.viewDate().getFullYear()).toBe(2030);
        expect(picker.viewDate().getMonth()).toBe(3); // stays April
        expect(picker.viewMode()).toBe('calendar');
    });

    it('should compute effectiveMinDate and effectiveMaxDate from restrictions', () => {
        const restrictions: DateRestriction = {
            minDate: new Date(2026, 0, 1),
            maxDate: new Date(2026, 11, 31),
        };
        picker.setRestrictions(restrictions);

        expect(picker.effectiveMinDate?.getTime()).toBe(new Date(2026, 0, 1).getTime());
        expect(picker.effectiveMaxDate?.getTime()).toBe(new Date(2026, 11, 31).getTime());
    });

    it('should mark disabled dates in calendarDays based on restrictions', () => {
        const min = new Date(2026, 8, 10);
        const max = new Date(2026, 8, 20);
        picker.setRestrictions({ minDate: min, maxDate: max });
        picker.viewDate.set(new Date(2026, 8, 1)); // Sept 2026

        const days = picker.calendarDays;
        const currentMonthDays = days.filter((d) => d.isCurrentMonth);

        // Day 5 should be disabled (< minDate)
        const day5 = currentMonthDays.find((d) => d.dateNum === 5);
        expect(day5?.isDisabled).toBe(true);

        // Day 15 should be enabled
        const day15 = currentMonthDays.find((d) => d.dateNum === 15);
        expect(day15?.isDisabled).toBe(false);

        // Day 25 should be disabled (> maxDate)
        const day25 = currentMonthDays.find((d) => d.dateNum === 25);
        expect(day25?.isDisabled).toBe(true);
    });

    it('should select day by timestamp', () => {
        const target = new Date(2026, 8, 18);
        picker.viewDate.set(new Date(2026, 8, 1));
        picker.selectDayByTime(target.getTime());

        expect(picker.workingDate()?.getDate()).toBe(18);
        expect(picker.workingDate()?.getMonth()).toBe(8);
        expect(picker.workingDate()?.getFullYear()).toBe(2026);
    });

    it('should handle time input updates', () => {
        const hoursInput = document.createElement('input');
        hoursInput.value = '17';
        picker.onHoursInput(hoursInput);
        expect(picker.workingHours()).toBe(17);
        expect(picker.workingHoursFormatted).toBe('17');

        const minutesInput = document.createElement('input');
        minutesInput.value = '45';
        picker.onMinutesInput(minutesInput);
        expect(picker.workingMinutes()).toBe(45);
        expect(picker.workingMinutesFormatted).toBe('45');
    });

    it('should clamp invalid or out-of-range time inputs', () => {
        const hoursInput = document.createElement('input');
        hoursInput.value = '99';
        picker.onHoursInput(hoursInput);
        expect(picker.workingHours()).toBe(23);

        const invalidHoursInput = document.createElement('input');
        invalidHoursInput.value = 'abc';
        picker.onHoursInput(invalidHoursInput);
        expect(picker.workingHours()).toBe(0);

        const minutesInput = document.createElement('input');
        minutesInput.value = '99';
        picker.onMinutesInput(minutesInput);
        expect(picker.workingMinutes()).toBe(59);

        const invalidMinutesInput = document.createElement('input');
        invalidMinutesInput.value = 'xyz';
        picker.onMinutesInput(invalidMinutesInput);
        expect(picker.workingMinutes()).toBe(0);
    });

    it('should handle time arrow key navigation', () => {
        picker.workingHours.set(10);
        picker.workingMinutes.set(30);

        const hoursInput = document.createElement('input');
        hoursInput.setAttribute('aria-label', 'Hours');
        const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        Object.defineProperty(arrowUpEvent, 'target', { value: hoursInput });

        picker.handleTimeKeydown(arrowUpEvent, 'hours');
        expect(picker.workingHours()).toBe(11);

        const minutesInput = document.createElement('input');
        minutesInput.setAttribute('aria-label', 'Minutes');
        const arrowUpMinEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        Object.defineProperty(arrowUpMinEvent, 'target', { value: minutesInput });

        picker.handleTimeKeydown(arrowUpMinEvent, 'minutes');
        expect(picker.workingMinutes()).toBe(31);
    });

    it('should confirm selection, update selectedDate, and dispatch events', () => {
        const onSelectSpy = vi.fn();
        const eventSpy = vi.fn();

        picker.onDateSelected = onSelectSpy;
        element.addEventListener('date-selected', eventSpy);

        picker.open();
        const testDay = new Date(2026, 6, 22);
        picker.selectDayByTime(testDay.getTime());
        picker.workingHours.set(16);
        picker.workingMinutes.set(45);

        picker.confirmSelection();

        expect(picker.isOpen()).toBe(false);
        const selected = picker.selectedDate();
        expect(selected).not.toBeNull();
        expect(selected?.getFullYear()).toBe(2026);
        expect(selected?.getMonth()).toBe(6);
        expect(selected?.getDate()).toBe(22);
        expect(selected?.getHours()).toBe(16);
        expect(selected?.getMinutes()).toBe(45);

        expect(onSelectSpy).toHaveBeenCalledWith(selected);
        expect(eventSpy).toHaveBeenCalled();
    });

    it('should toggle blur and clean up on destroy', () => {
        picker.setBlur(true);
        expect(picker.enableBlur()).toBe(true);

        picker.setBlur(false);
        expect(picker.enableBlur()).toBe(false);

        picker.open();
        element.remove();
        expect(document.querySelector('.picker-overlay')).toBeNull();
    });
});
