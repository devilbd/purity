import { Pipe, BasePipe } from '@purity/core';

const MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PRESETS: Record<string, string> = {
    short: 'M/d/yy, h:mm a',
    medium: 'MMM d, yyyy, h:mm:ss a',
    long: 'MMMM d, yyyy, h:mm:ss a',
    full: 'EEEE, MMMM d, yyyy, h:mm:ss a',
    shortDate: 'M/d/yy',
    mediumDate: 'MMM d, yyyy',
    longDate: 'MMMM d, yyyy',
    fullDate: 'EEEE, MMMM d, yyyy',
    shortTime: 'h:mm a',
    mediumTime: 'h:mm:ss a',
};

/**
 * Transforms dates, timestamps, or date strings into formatted strings in Handlebars expressions.
 * Example: `{{ selectedDate() | date: 'MMM dd, yyyy HH:mm' }}`
 */
@Pipe('date')
export class DatePipe extends BasePipe {
    transform(value: any, format = 'mediumDate'): string {
        if (value === null || value === undefined || value === '') {
            return '';
        }

        let date: Date;
        if (value instanceof Date) {
            date = value;
        } else if (typeof value === 'number' || typeof value === 'string') {
            date = new Date(value);
        } else {
            return '';
        }

        if (isNaN(date.getTime())) {
            return '';
        }

        const pattern = PRESETS[format] || format;
        return this.formatDate(date, pattern);
    }

    private formatDate(date: Date, pattern: string): string {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const dayOfWeek = date.getDay();
        const hours24 = date.getHours();
        const hours12 = hours24 % 12 || 12;
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours24 >= 12 ? 'PM' : 'AM';

        const pad = (n: number, width = 2) => String(n).padStart(width, '0');

        return pattern.replace(
            /(EEEE|EEE|yyyy|yy|MMMM|MMM|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s|a)/g,
            (match) => {
                switch (match) {
                    case 'EEEE':
                        return DAY_NAMES_FULL[dayOfWeek];
                    case 'EEE':
                        return DAY_NAMES_SHORT[dayOfWeek];
                    case 'yyyy':
                        return String(year);
                    case 'yy':
                        return String(year).slice(-2);
                    case 'MMMM':
                        return MONTH_NAMES_FULL[month];
                    case 'MMM':
                        return MONTH_NAMES_SHORT[month];
                    case 'MM':
                        return pad(month + 1);
                    case 'M':
                        return String(month + 1);
                    case 'dd':
                        return pad(day);
                    case 'd':
                        return String(day);
                    case 'HH':
                        return pad(hours24);
                    case 'H':
                        return String(hours24);
                    case 'hh':
                        return pad(hours12);
                    case 'h':
                        return String(hours12);
                    case 'mm':
                        return pad(minutes);
                    case 'm':
                        return String(minutes);
                    case 'ss':
                        return pad(seconds);
                    case 's':
                        return String(seconds);
                    case 'a':
                        return ampm;
                    default:
                        return match;
                }
            },
        );
    }
}
