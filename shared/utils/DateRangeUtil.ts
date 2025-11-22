import { DateRange, DateRangeI, EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";

export abstract class DateRangeUtil {

    public static formatDateRangeForDb(dateRange: { start: string, end?: string }): string {
        if (!dateRange.end) {
            return `[${dateRange.start},)`; // Open-ended range (no upper bound)
        }
        return `[${dateRange.start},${dateRange.end}]`;
    }

    public static parseDateRangeFromDb = (dbRange: string): { start: string, end: string } => {
        // dbRange can be: [2024-01-01,2024-01-31], [2024-01-01,2024-01-31), (2024-01-01,2024-01-31], etc.
        // Remove any brackets or parentheses from start/end
        // do adjustment - end date -1 when: [2024-01-01,2024-01-31)
        const adjustEndDate = dbRange.endsWith(')');
        const trimmed = dbRange.replace(/^[\[(]+|[\])]+$/g, '');
        let [start, end] = trimmed.split(',');
        if (adjustEndDate && end) {
            let endDate = DateRangeUtil.newLocalDate(new Date(end));
            endDate.setDate(endDate.getDate() - 1);
            end = DateRangeUtil.displayLocalDate(endDate);
        }
        return {
            start: start,
            end: end || DateRangeUtil.displayLocalDate(DateRangeUtil.newLocalDate()),
        }
    }

    public static toDateRange = (dateRangeI?: DateRangeI, params?: { adjustEndDate?: boolean }): DateRange | null => {
        if (!dateRangeI?.dateRange) {
            return null
        }
        const parsed = this.parseDateRangeFromDb(dateRangeI.dateRange);
        const end = DateRangeUtil.newLocalDate(new Date(parsed.end));
        if (params?.adjustEndDate) {
            end.setDate(end.getDate() - 1); // Adjust end date to be inclusive
        }
        return {
            start: DateRangeUtil.newLocalDate(new Date(parsed.start)),
            end: end,
            id: dateRangeI.id,
        };
    }

    public static fromDateRange = (ranges: DateRangeI[], dateRange?: DateRange | null): DateRangeI | null => {
        if (!dateRange?.start) {
            return null;
        }
        return {
            id: dateRange?.id || this.newId(ranges),
            dateRange: this.formatDateRangeForDb({
                start: DateRangeUtil.displayLocalDate(dateRange.start),
                end: dateRange.end ? DateRangeUtil.displayLocalDate(dateRange.end) : undefined,
            }),
        }
    }


    public static getFirstRange = (profile: EmployeeProfileI): DateRange | null => {
        const rangeI = profile.availabilityDateRanges?.[0];
        if (!rangeI) {
            return null;
        }
        return DateRangeUtil.toDateRange(rangeI);
    }

    public static displayLocalDate = (date: Date): string => {
        return DateRangeUtil.newLocalDate(date).toISOString().split('T')[0];
    }

    public static newId = (dateRanges: (DateRangeI | DateRange)[]): number => {
        let maxId = 0;
        for (const range of dateRanges) {
            if (range?.id && range.id > maxId) {
                maxId = range.id;
            }
        }
        return maxId + 1;
    }

    public static newLocalDate = (input?: Date | null): Date => {
        const date = input ? new Date(input) : new Date();
        // Construct a date at 00:00:00 UTC (not local time)
        return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }
}