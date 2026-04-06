export abstract class DateUtil {

    public static isIsoDateString(value: unknown): boolean {
        return (
            typeof value === 'string' &&
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(value)
        );
    }

    // without date
    public static displayDate(date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString();
    }

    public static displayDateWithTime(date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    public static displayTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    public static isToday(date: Date): boolean {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    public static isTomorrow(date: Date): boolean {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear();
    }

    public static isYesterday(date: Date): boolean {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();
    }

    public static isBefore(date1: Date, date2: Date): boolean {
        // check if day 1 is before day 2
        return date1.getFullYear() < date2.getFullYear() ||
            (date1.getFullYear() === date2.getFullYear() && date1.getMonth() < date2.getMonth()) ||
            (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() < date2.getDate());
    }

    public static newLocalDate = (input?: Date | null): Date => {
        const date = input ? new Date(input) : new Date();
        // Construct a date at 00:00:00 UTC (not local time)
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }

    public static reviveDatesDeep = (obj: any): any => {
        if (Array.isArray(obj)) {
            return obj.map(DateUtil.reviveDatesDeep);
        } else if (obj && typeof obj === "object") {
            const result: any = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const val = obj[key];
                    if (DateUtil.isDateString(val)) {
                        result[key] = new Date(val);
                    } else {
                        result[key] = DateUtil.reviveDatesDeep(val);
                    }
                }
            }
            return result;
        }
        return obj;
    };

    public static isDateString = (value: any) => {
        // ISO 8601 date string detection
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(value);
    };

    public static parseDate(value: any): Date | null {
        if (typeof value === 'string') {
            const parsed = Date.parse(value);
            return !isNaN(parsed) ? new Date(parsed) : null;
        }
        if (typeof value === 'number') {
            const date = new Date(value);
            return !isNaN(date.getTime()) ? date : null;
        }
        return value instanceof Date ? value : null;
    }

    /** Parse YYYY-MM-DD string to Date object (local time, midnight) */
    public static parseDateFromStringLocalDate = (dateStr: string | null | undefined): Date | null => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        if (!year || !month || !day) return null;
        return new Date(year, month - 1, day);
    }

    /** Parses local date string (YYYY-MM-DD) to Date object */
    public static parseLocalDateString = (dateStr: string): Date => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    /** Converts Date to local date string in YYYY-MM-DD format */
    public static toLocalDateString = (date?: Date | null): string | null => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    public static getMonth(localDateString: string): number | null {
        const date = this.parseLocalDateString(localDateString);
        return isNaN(date.getTime()) ? null : date.getMonth();
    }

    public static getDay(localDateString: string): number | null {
        const date = this.parseLocalDateString(localDateString);
        return isNaN(date.getTime()) ? null : date.getDate();
    }
}