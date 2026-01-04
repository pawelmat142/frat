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
        return[UserRoles.ADMIN, UserRoles.SUPERADMIN].some(role => user.roles.includes(role));
    }

}

export const isOneOf = (list: any[], item: any): boolean => {
    return list.includes(item);
}