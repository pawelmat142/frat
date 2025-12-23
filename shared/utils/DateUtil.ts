export abstract class DateUtil {

    // without date
    public static displayDate(date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString();
    }

    public static displayDateWithTime(date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
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

}