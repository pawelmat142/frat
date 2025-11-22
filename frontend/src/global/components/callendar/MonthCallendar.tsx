import { DateRange } from "@shared/interfaces/EmployeeProfileI";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface MonthCallendarProps {
    date: Date;
    selectedRange?: DateRange | null;
    selectedDay?: Date | null;
}
const daysOfWeek = ['1', '2', '3', '4', '5', '6', '0'];

interface DayCell {
    day: number;
    monthOffset: -1 | 0 | 1; // -1 prev, 0 current, 1 next
}

const MS_DAY = 24 * 60 * 60 * 1000;

const MonthCallendar: React.FC<MonthCallendarProps> = ({ date, selectedRange }) => {

    const { t } = useTranslation();

    const month = date.getMonth();
    const year = date.getFullYear();

    const firstDay = useMemo(() => new Date(year, month, 1), [year, month]);
    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);

    // Monday-based offset (Mon=0 .. Sun=6)
    const offset = useMemo(() => {
        const raw = firstDay.getDay();
        return raw === 0 ? 6 : raw - 1;
    }, [firstDay]);

    // Build cells once
    const cells: DayCell[] = useMemo(() => {
        const prevMonthDays = new Date(year, month, 0).getDate();
        const arr: DayCell[] = [];

        // Extra previous full week if month starts Monday (offset===0)
        if (offset === 0) {
            // Days: prevMonthDays-6 .. prevMonthDays
            for (let d = prevMonthDays - 6; d <= prevMonthDays; d++) {
                arr.push({ day: d, monthOffset: -1 });
            }
        }

        // Prev spill (partial) when offset>0
        if (offset > 0) {
            for (let i = 0; i < offset; i++) {
                arr.push({ day: prevMonthDays - offset + 1 + i, monthOffset: -1 });
            }
        }

        // Current days
        for (let d = 1; d <= daysInMonth; d++) {
            arr.push({ day: d, monthOffset: 0 });
        }

        // Next spill to complete current last week
        const remainder = arr.length % 7;
        const trailing = remainder === 0 ? 0 : 7 - remainder;
        for (let i = 1; i <= trailing; i++) {
            arr.push({ day: i, monthOffset: 1 });
        }

        // Guarantee at least 6 weeks (42 cells). Append full weeks from next month as needed.
        let weeksCount = arr.length / 7; // integer
        let nextDay = (trailing + 1) || 1;
        while (weeksCount < 6) {
            for (let i = 0; i < 7; i++) {
                arr.push({ day: nextDay++, monthOffset: 1 });
            }
            weeksCount = arr.length / 7;
        }
        return arr;
    }, [year, month, offset, daysInMonth]);

    // Normalize selected range boundaries (inclusive)
    const rangeBoundaries = useMemo(() => {
        if (!selectedRange?.start || !selectedRange?.end) return null;
        const startDate = selectedRange.start instanceof Date ? selectedRange.start : new Date(selectedRange.start as any);
        const endDate = selectedRange.end instanceof Date ? selectedRange.end : new Date(selectedRange.end as any);
        // Normalize to midnight to avoid issues with timezones
        const startMid = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        const endMid = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
        return { start: startMid, end: endMid };
    }, [selectedRange]);

    // Base times for month boundaries to reduce Date allocations for current month cells
    const currentMonthBase = useMemo(() => new Date(year, month, 1).getTime(), [year, month]);
    const prevMonthBase = useMemo(() => new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 1).getTime(), [year, month]);
    const nextMonthBase = useMemo(() => new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1).getTime(), [year, month]);

    return (
        <div className="month-callendar month-callendar-grid">
            {daysOfWeek.map((day) => (
                <div key={day} className="month-callendar-cell header-cell month-callendar-header">{t(`callendar.dayOfWeekLetter.${day}`)}</div>
            ))}
            {cells.map((cell, idx) => {
                const disabled = cell.monthOffset !== 0;
                // Compute cell absolute midnight time using base + (day-1)*MS_DAY
                let cellTime: number;
                if (cell.monthOffset === 0) {
                    cellTime = currentMonthBase + (cell.day - 1) * MS_DAY;
                } else if (cell.monthOffset === -1) {
                    cellTime = prevMonthBase + (cell.day - 1) * MS_DAY;
                } else {
                    cellTime = nextMonthBase + (cell.day - 1) * MS_DAY;
                }

                let isSelected = false;
                let isFirst = false;
                let isLast = false;
                if (rangeBoundaries) {
                    isSelected = cellTime >= rangeBoundaries.start && cellTime <= rangeBoundaries.end;
                    if (isSelected) {
                        isFirst = cellTime === rangeBoundaries.start;
                        isLast = cellTime === rangeBoundaries.end;
                    }
                }

                return (
                    <div
                        key={idx}
                        className={`month-callendar-cell month-callendar-day${disabled ? ' disabled' : ''}${isSelected ? ' selected' : ''}${isFirst ? ' first' : ''}${isLast ? ' last' : ''}`}
                    >
                        {cell.day}
                    </div>
                );
            })}
        </div>
    );
}

export default MonthCallendar;