export abstract class Util {

    // without time
    public static displayDate(date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString();
    }

    public static displayDateWithTime(date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }

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

    public static trimEmail(email: string): string {
        return email.split('@')[0];
    }
}