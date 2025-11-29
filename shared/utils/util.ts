import { UserI, UserRole } from "@shared/interfaces/UserI";

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

    public static hasPermission(allowedRoles?: UserRole[], userI?: UserI | null): boolean {
        if (!allowedRoles) {
            return true
        }
        if (!userI) {
            return false
        }
        return userI.roles.some(role => allowedRoles.includes(role));
    }

    public static isDateString = (value: any) => {
        // ISO 8601 date string detection
        return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(value);
    };
    
    public static reviveDatesDeep = (obj: any): any => {
        if (Array.isArray(obj)) {
            return obj.map(Util.reviveDatesDeep);
        } else if (obj && typeof obj === "object") {
            const result: any = {};
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const val = obj[key];
                    if (Util.isDateString(val)) {
                        result[key] = new Date(val);
                    } else {
                        result[key] = Util.reviveDatesDeep(val);
                    }
                }
            }
            return result;
        }
        return obj;
    };

    
}

export const isOneOf = (list: any[], item: any): boolean => {
    return list.includes(item);
}