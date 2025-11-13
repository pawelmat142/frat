export abstract class DateUtil {
    public static isBefore(date1: Date, date2: Date): boolean {
        // check if day 1 is before day 2
        return date1.getFullYear() < date2.getFullYear() ||
            (date1.getFullYear() === date2.getFullYear() && date1.getMonth() < date2.getMonth()) ||
            (date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() < date2.getDate());
    }
}