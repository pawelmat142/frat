import { DateRange } from "@shared/interfaces/WorkerI";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import CallendarDaysHeader from "./CallendarDaysHeader";
import { DateUtil } from "@shared/utils/DateUtil";

interface MonthCallendarProps {
    date: Date;
    selectedRanges?: DateRange[] | null;
    selectedDay?: Date | null;
    showDaysHeader?: boolean;
    fullScreenMode?: boolean;
    showOnlyDateMonth?: boolean;
    showMonthHeader?: boolean;
    onDayClick?: (day: Date) => void;
}
interface DayCell {
    day: number | null; // null represents blank cell when showOnlyDateMonth=true
    monthOffset: -1 | 0 | 1; // -1 prev, 0 current, 1 next (or blank when day=null)
}

const MS_DAY = 24 * 60 * 60 * 1000;

const MonthCallendar: React.FC<MonthCallendarProps> = ({
    date,
    selectedRanges,
    showDaysHeader = true,
    fullScreenMode = false,
    showOnlyDateMonth = false,
    showMonthHeader = false,
    onDayClick
}) => {

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

        if (showOnlyDateMonth) {
            // Leading blanks
            for (let i = 0; i < offset; i++) {
                arr.push({ day: null, monthOffset: -1 });
            }
            // Current month days
            for (let d = 1; d <= daysInMonth; d++) {
                arr.push({ day: d, monthOffset: 0 });
            }
            // Fill trailing blanks to reach multiple of 7
            while (arr.length % 7 !== 0) {
                arr.push({ day: null, monthOffset: 1 });
            }
            return arr;
        }

        // Original behavior with spillover days
        // Extra previous full week if month starts Monday (offset===0)
        if (offset === 0) {
            for (let d = prevMonthDays - 6; d <= prevMonthDays; d++) {
                arr.push({ day: d, monthOffset: -1 });
            }
        }
        if (offset > 0) {
            for (let i = 0; i < offset; i++) {
                arr.push({ day: prevMonthDays - offset + 1 + i, monthOffset: -1 });
            }
        }
        for (let d = 1; d <= daysInMonth; d++) {
            arr.push({ day: d, monthOffset: 0 });
        }
        const remainder = arr.length % 7;
        const trailing = remainder === 0 ? 0 : 7 - remainder;
        for (let i = 1; i <= trailing; i++) {
            arr.push({ day: i, monthOffset: 1 });
        }
        let weeksCount = arr.length / 7;
        let nextDay = (trailing + 1) || 1;
        while (weeksCount < 6) {
            for (let i = 0; i < 7; i++) {
                arr.push({ day: nextDay++, monthOffset: 1 });
            }
            weeksCount = arr.length / 7;
        }
        return arr;
    }, [year, month, offset, daysInMonth, showOnlyDateMonth]);

    const allRanges = useMemo(() => {
        return selectedRanges && selectedRanges.length > 0
            ? selectedRanges.filter(Boolean)
            : [];
    }, [selectedRanges]);

    // Normalize selected range boundaries (inclusive)
    const rangeBoundaries = useMemo(() => {
        return allRanges
            .filter((range) => !!range?.start && !!range?.end)
            .map((range) => {
                const startDate = DateUtil.parseLocalDateString(range.start!);
                const endDate = DateUtil.parseLocalDateString(range.end!);
                const startMid = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
                const endMid = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
                return startMid <= endMid
                    ? { start: startMid, end: endMid }
                    : { start: endMid, end: startMid };
            });
    }, [allRanges]);

    // Single start day (no end) highlight
    const singleStartMids = useMemo(() => {
        return allRanges
            .filter((range) => !!range?.start && !range?.end)
            .map((range) => {
                const startDate = DateUtil.parseLocalDateString(range.start!);
                return new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
            });
    }, [allRanges]);

    // Single end day (no start) highlight
    const singleEndMids = useMemo(() => {
        return allRanges
            .filter((range) => !!range?.end && !range?.start)
            .map((range) => {
                const endDate = DateUtil.parseLocalDateString(range.end!);
                return new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
            });
    }, [allRanges]);

    // Base times for month boundaries to reduce Date allocations for current month cells
    const currentMonthBase = useMemo(() => new Date(year, month, 1).getTime(), [year, month]);
    const prevMonthBase = useMemo(() => new Date(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, 1).getTime(), [year, month]);
    const nextMonthBase = useMemo(() => new Date(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, 1).getTime(), [year, month]);

    // Today's midnight time for highlighting
    const todayMid = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    }, []);

    return (
        <>
            <div className="w-full">
                {showDaysHeader && (<CallendarDaysHeader fullScreenMode={fullScreenMode} />)}
            </div>

            {showMonthHeader && (
                <div className="ml-5 secondary-text">{t(`callendar.month.${month}`)} {year}</div>
            )}

            <div className={`month-callendar${fullScreenMode ? ' full-screen-mode' : ''}`}>

                {cells.map((cell, idx) => {
                    const disabled = cell.monthOffset !== 0 || cell.day === null;
                    // Compute cell absolute midnight time using base + (day-1)*MS_DAY
                    let cellTime: number;
                    if (cell.day !== null && cell.monthOffset === 0) {
                        cellTime = currentMonthBase + (cell.day - 1) * MS_DAY;
                    } else if (cell.day !== null && cell.monthOffset === -1) {
                        cellTime = prevMonthBase + (cell.day - 1) * MS_DAY;
                    } else if (cell.day !== null && cell.monthOffset === 1) {
                        cellTime = nextMonthBase + (cell.day - 1) * MS_DAY;
                    } else {
                        cellTime = 0; // blank cells won't be selected
                    }

                    let isSelected = false;
                    let isFirst = false;
                    let isLast = false;
                    let isStartingOnly = false;
                    let isEndingOnly = false;
                    if (rangeBoundaries.length > 0 && cell.day !== null && cell.monthOffset === 0) { // selection only within current month when showOnlyDateMonth
                        isSelected = rangeBoundaries.some((boundary) => cellTime >= boundary.start && cellTime <= boundary.end);
                        if (isSelected) {
                            isFirst = rangeBoundaries.some((boundary) => cellTime === boundary.start);
                            isLast = rangeBoundaries.some((boundary) => cellTime === boundary.end);
                        }
                    }
                    if (rangeBoundaries.length === 0 && singleStartMids.length > 0 && cell.day !== null && cell.monthOffset === 0) {
                        isStartingOnly = singleStartMids.includes(cellTime);
                    }
                    if (rangeBoundaries.length === 0 && singleEndMids.length > 0 && cell.day !== null && cell.monthOffset === 0) {
                        isEndingOnly = singleEndMids.includes(cellTime);
                    }

                    const isToday = cellTime === todayMid;

                    return (
                        <div
                            key={idx}
                            className={`month-callendar-cell month-callendar-day${disabled ? ' disabled' : ''}${isSelected ? ' selected' : ''}${isFirst ? ' first' : ''}${isLast ? ' last' : ''}${isStartingOnly ? ' starting' : ''}${isEndingOnly ? ' ending' : ''}${isToday ? ' today' : ''}`}
                            onClick={() => {
                                if (!disabled && cell.day !== null) {
                                    const clickedDate = new Date(year, month, cell.day);
                                    onDayClick?.(clickedDate);
                                }
                            }}
                        >
                            {cell.day !== null ? cell.day : ''}
                        </div>

                    );
                })}
            </div>
        </>
    );
}

export default MonthCallendar;