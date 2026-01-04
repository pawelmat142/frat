export abstract class AdminUtil {

    public static getRandomizedCreatedAt(idx: number): Date {
        const now = new Date();
        const baseMonth = now.getMonth();
        const baseYear = now.getFullYear();
        // Rozłóż po 24 miesiącach wstecz, po kolei, z losowym dniem 1-7
        const monthOffset = idx % 24;
        const totalMonths = baseYear * 12 + baseMonth - monthOffset;
        const year = Math.floor(totalMonths / 12);
        const month = totalMonths % 12;
        const day = 1 + Math.floor(Math.random() * 7); // 1-7
        return new Date(year, month, day, 8, 0, 0, 0); // 8:00 rano
    }

}