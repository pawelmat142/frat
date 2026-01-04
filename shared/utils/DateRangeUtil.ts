import { DateRange, DateRangeI, WorkerI } from "@shared/interfaces/WorkerProfileI";
import { DateUtil } from "./DateUtil";

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
            let endDate = DateUtil.newLocalDate(new Date(end));
            endDate.setDate(endDate.getDate() - 1);
            end = DateUtil.toLocalDateString(endDate);
        }
        return {
            start: start,
            end: end || DateUtil.toLocalDateString(DateUtil.newLocalDate()),
        }
    }

    public static toDateRange = (dateRangeI?: DateRangeI, params?: { adjustEndDate?: boolean }): DateRange | null => {
        if (!dateRangeI?.dateRange) {
            return null
        }
        const parsed = this.parseDateRangeFromDb(dateRangeI.dateRange);
        const end = DateUtil.newLocalDate(new Date(parsed.end));
        if (params?.adjustEndDate) {
            end.setDate(end.getDate() - 1); // Adjust end date to be inclusive
        }
        return {
            start: DateUtil.newLocalDate(new Date(parsed.start)),
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
                start: DateUtil.toLocalDateString(dateRange.start),
                end: dateRange.end ? DateUtil.toLocalDateString(dateRange.end) : undefined,
            }),
        }
    }

    public static findEarliestDate = (ranges: DateRangeI[]): Date => {
        let earliest: Date | null = null;
        for (const rangeI of ranges) {
            const range = this.toDateRange(rangeI);
            if (range?.start) {
                if (!earliest || range.start < earliest) {
                    earliest = range.start;
                }
            }
        }
        return earliest || new Date();
    }


    public static getFirstRange = (profile: WorkerI): DateRange | null => {
        const rangeI = profile.availabilityDateRanges?.[0];
        if (!rangeI) {
            return null;
        }
        return DateRangeUtil.toDateRange(rangeI);
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


}