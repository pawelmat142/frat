import { DateRange } from "@shared/interfaces/EmployeeProfileI";

export abstract class DateRangeUtil {

    public static formatDateRangeForDb(dateRange: DateRange): string {
        return `[${dateRange.start},${dateRange.end}]`;
    }

    public static parseDateRangeFromDb(dbRange: string): DateRange {
        // dbRange is in format: [2024-01-01,2024-01-31]
        const trimmed = dbRange.replace(/[\[\]]/g, ''); // remove brackets
        const [start, end] = trimmed.split(',');
        return {
            start: start,
            end: end,
        };
    }
}