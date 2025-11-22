import { DateRange } from "@shared/interfaces/EmployeeProfileI";
import React from "react";
import Button from "global/components/controls/Button";
import { useTranslation } from "react-i18next";
import MonthCallendar from "./MonthCallendar";
import CallendarDaysHeader from "./CallendarDaysHeader";

interface CallendarsViewProps {
    range: DateRange;
    onSubmit?: (result: DateRange) => void;
    onCancel?: () => void;
}

const CallendarsView: React.FC<CallendarsViewProps> = ({ range, onSubmit, onCancel }) => {

    const { t } = useTranslation();

    const date = range?.start || null;

    const prepareMonthsArray = (range: DateRange): Date[] => {
        const months: Date[] = [];
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


    if (!date) {
        return (
            <div className="square-tile col-tile px-5">
                {t("others.availableAnytime")}
            </div>
        )
    }

    const months = prepareMonthsArray(range);

    return (

        <div className="callendars-view-wrapper">

            <div className="callendars-view-header">
                <CallendarDaysHeader fullScreenMode={true} />
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
                            selectedRange={range}
                            fullScreenMode={true}
                            showOnlyDateMonth={true}
                            showMonthHeader={true}
                        ></MonthCallendar>
                    </div>
                    )
                })}

                <div className="flex gap-2">
                    {onCancel && (
                        <Button onClick={() => onCancel?.()}>Anuluj</Button>
                    )}
                    {onSubmit && (
                        <Button mode="primary" onClick={() => onSubmit?.(range)}>OK</Button>
                    )}
                </div>
            </div>

        </div>

    );
}

export default CallendarsView;