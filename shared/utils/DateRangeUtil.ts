import { DateRange, DateRangeI } from "@shared/interfaces/EmployeeProfileI";

export abstract class DateRangeUtil {

    public static formatDateRangeForDb(dateRange: { start: string, end: string }): string {
        return `[${dateRange.start},${dateRange.end}]`;
    }

    public static parseDateRangeFromDb(dbRange: string): { start: string, end: string } {
        // dbRange can be: [2024-01-01,2024-01-31], [2024-01-01,2024-01-31), (2024-01-01,2024-01-31], etc.
        // Remove any brackets or parentheses from start/end
        const trimmed = dbRange.replace(/^[\[(]+|[\])]+$/g, '');
        const [start, end] = trimmed.split(',');
        return {
            start: start,
            end: end,
        };
    }

    public static toDateRange = (dateRangeI?: DateRangeI): DateRange | null => {
        if (!dateRangeI?.dateRange) {
            return null
        }
        const parsed = this.parseDateRangeFromDb(dateRangeI.dateRange);
        const end = new Date(parsed.end);
        end.setDate(end.getDate() - 1); // Adjust end date to be inclusive
        return {
            start: new Date(parsed.start),
            end: end,
        };
    }

    public static fromDateRange = (dateRange?: DateRange | null): DateRangeI | null => {
        if (!dateRange) {
            return null;
        }
        return {
            dateRange: this.formatDateRangeForDb({
                start: dateRange.start.toISOString().split('T')[0],
                end: dateRange.end.toISOString().split('T')[0],
            }),
        }
    }
}