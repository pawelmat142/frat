import { DateRange } from "@shared/interfaces/EmployeeProfileI";
import React, { useState } from "react";
import Button from "global/components/controls/Button";
import { useTranslation } from "react-i18next";
import MonthCallendar from "./MonthCallendar";
import CallendarDaysHeader from "./CallendarDaysHeader";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import CallendarsViewControl from "./CallendarsViewControl";

interface CallendarsViewProps {
    range: DateRange;
    onSubmit?: (result?: DateRange) => void;
    onCancel?: () => void;
}

const CallendarsView: React.FC<CallendarsViewProps> = ({ range, onSubmit, onCancel }) => {

    const { t } = useTranslation();
    const date = range?.start || null;
    const selectorMode = !!onSubmit;

    const [currentRange, setCurrentRange] = useState<DateRange>(range);

    const prepareMonthsArray = (range: DateRange): Date[] => {
        const months: Date[] = [];
        if (selectorMode) {
            return prepareMonthArrayForTwelveMonths(range.start || new Date());
        }
        if (!range.start || !range.end) return months;
        // Start one month before range.start
        let current = new Date(range.start.getFullYear(), range.start.getMonth() - 1, 1);
        // End five months after range.end
        const end = new Date(range.end.getFullYear(), range.end.getMonth() + 5, 1);
        while (current <= end) {
            months.push(new Date(current));
            current.setMonth(current.getMonth() + 1);
        }
        return months;
    }

    const prepareMonthArrayForTwelveMonths = (date: Date): Date[] => {
        const months: Date[] = [];
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        for (let i = 0; i < 12; i++) {
            const monthDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
            months.push(monthDate);
        }
        return months;
    }

    const handleClickDay = (day: Date) => {
        if (!selectorMode) return;

        let newRange: DateRange = { ...currentRange };
        const { start, end } = currentRange;

        if (!start || (start && end)) {
            newRange = { start: day, end: null };
        }
        else if (start && !end) {
            if (day < start) {
                newRange = { start: day, end: start };
            } else {
                newRange = { start: start, end: day };
            }
        }
        setCurrentRange(newRange);
    }


    if (!selectorMode && !date) {
        return (
            <div className="square-tile col-tile px-5">
                {t("others.availableAnytime")}
            </div>
        )
    }

    const months = prepareMonthsArray(currentRange);

    return (

        <div className="callendars-view-wrapper">

            <div className="callendars-view-header flex flex-col gap-2 px-3">
                <CallendarsViewControl
                    onFocus={() => { console.log('start')}}
                    onRemove={() => {
                        setCurrentRange({ start: null, end: currentRange.end || null });
                    }}
                    selected={false}
                    date={currentRange?.start}
                    placeholder={t("callendar.control.rangeStartPlaceholder")}
                    label={t("callendar.control.rangeStartLabel")}
                    id="start-date"
                ></CallendarsViewControl>
                <CallendarsViewControl
                    onFocus={() => { console.log('end')}}
                    onRemove={() => {
                        setCurrentRange({ start: currentRange.start || null, end: null });
                    }}
                    selected={false}
                    date={currentRange.end}
                    placeholder={t("callendar.control.rangeEndPlaceholder")}
                    label={t("callendar.control.rangeEndLabel")}
                    id="end-date"
                ></CallendarsViewControl>
                <div className="mt-2">
                    <CallendarDaysHeader fullScreenMode={true} />
                </div>
            </div>

            <div className="w-full flex flex-col items-center gap-4 h-full justify-center p-2 callendars-view-fullscreen">

                {months.map((monthDate) => {
                    return (<div
                        key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
                        className="callendars-view-item"
                    >
                        <MonthCallendar
                            showDaysHeader={false}
                            date={monthDate}
                            selectedRange={currentRange}
                            fullScreenMode={true}
                            showOnlyDateMonth={true}
                            showMonthHeader={true}
                            onDayClick={handleClickDay}
                        ></MonthCallendar>
                    </div>
                    )
                })}

            </div>
            {selectorMode && (
                <div className="flex gap-4 bottom-sheet-footer callendars-view-footer w-full py-2">
                    <Button onClick={onCancel} size={BtnSizes.LARGE} mode={BtnModes.ERROR} fullWidth={true}>
                        {t("common.reset")}
                    </Button>

                    <Button onClick={() => onSubmit?.(currentRange)} size={BtnSizes.LARGE} mode={BtnModes.PRIMARY} fullWidth={true}>
                        {t("common.confirm")}
                    </Button>
                </div>
            )}

        </div>

    );
}

export default CallendarsView;