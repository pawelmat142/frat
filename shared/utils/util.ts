import { UserI, UserRole, UserRoles } from "../interfaces/UserI";

export abstract class Util {

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

    public static isAdmin(user: UserI | null | undefined): boolean {
        if (!user) {
            return false;
        }
        return [UserRoles.ADMIN, UserRoles.SUPERADMIN].some(role => user.roles.includes(role));
    }

    public static captializeFirstLetter(str: string): string {
        if (!str) {
            return str;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static parseNumber(value: unknown): number | undefined {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : undefined;
        }

        if (typeof value === 'string' && value.trim().length > 0) {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : undefined;
        }

        return undefined;
    }

}

export const isOneOf = (list: any[], item: any): boolean => {
    return list.includes(item);
}