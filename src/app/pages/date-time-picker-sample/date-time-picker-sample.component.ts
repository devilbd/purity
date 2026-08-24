import { Component, signal, ViewChild } from '@purity/core';
import type { DateTimePickerComponent, DateRestriction } from '../../shared/components/date-time-picker/date-time-picker.component';
import './date-time-picker-sample.component.scss';

@Component({
    selector: 'date-time-picker-sample',
    templateUrl: './src/app/pages/date-time-picker-sample/date-time-picker-sample.component.html',
})
export class DateTimePickerSampleComponent {
    // 1. Standard Date & Time
    public standardDate = signal<Date | null>(new Date());

    // 2. Blur Enabled
    public blurDate = signal<Date | null>(new Date());

    // 3. Business Hours & Future Only
    public businessDate = signal<Date | null>(null);

    // 4. Custom Range & Disabled Dates
    public rangeDate = signal<Date | null>(null);

    @ViewChild('#standard-picker')
    public standardPicker?: DateTimePickerComponent | null;

    @ViewChild('#blur-picker')
    public blurPicker?: DateTimePickerComponent | null;

    @ViewChild('#business-picker')
    public businessPicker?: DateTimePickerComponent | null;

    @ViewChild('#range-picker')
    public rangePicker?: DateTimePickerComponent | null;

    protected onInit(): void {
        (window as any).dateTimePickerSample = this;

        // Configure business picker restrictions
        const businessRestrictions: DateRestriction = {
            futureOnly: true,
            daysForward: 60,
            minTime: '09:00',
            maxTime: '18:00',
        };

        // Configure custom range & disabled dates restrictions
        const now = new Date();
        const disabledDay1 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
        const disabledDay2 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);

        const rangeRestrictions: DateRestriction = {
            daysBack: 7,
            daysForward: 14,
            disabledDates: [disabledDay1, disabledDay2],
        };

        // Initialize pickers once DOM is attached
        setTimeout(() => {
            const host = this as unknown as HTMLElement;
            const setupPicker = (
                selector: string,
                sig: { (): Date | null; set: (d: Date | null) => void },
                restrictions?: DateRestriction,
                blur?: boolean,
            ) => {
                const picker = (host.querySelector?.(selector) || document.querySelector(selector)) as
                    | (DateTimePickerComponent & HTMLElement)
                    | null;
                if (picker) {
                    if (sig()) picker.setDate(sig());
                    if (restrictions) picker.setRestrictions(restrictions);
                    if (blur) picker.setBlur(blur);
                    picker.onDateSelected = (date: Date) => {
                        sig.set(date);
                    };
                    picker.addEventListener('date-selected', ((e: CustomEvent) => {
                        if (e.detail?.date) {
                            sig.set(e.detail.date);
                        }
                    }) as EventListener);
                }
            };

            setupPicker('#standard-picker', this.standardDate);
            setupPicker('#blur-picker', this.blurDate, undefined, true);
            setupPicker('#business-picker', this.businessDate, businessRestrictions);
            setupPicker('#range-picker', this.rangeDate, rangeRestrictions);
        }, 0);
    }

    public setTomorrow(): void {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        this.standardDate.set(tomorrow);
        this.standardPicker?.setDate(tomorrow);
    }

    public clearStandard(): void {
        this.standardDate.set(null);
        this.standardPicker?.setDate(null);
    }

    public setNextWeek(): void {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(14, 30, 0, 0);
        this.businessDate.set(nextWeek);
        this.businessPicker?.setDate(nextWeek);
    }
}
