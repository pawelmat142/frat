import { DateRange } from "@shared/interfaces/EmployeeProfileI";
import React, { useState } from "react";
import Button from "global/components/controls/Button";
import { useTranslation } from "react-i18next";
import MonthCallendar from "./MonthCallendar";
import CallendarDaysHeader from "./CallendarDaysHeader";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import CallendarsViewControl from "./CallendarsViewControl";
import CallendarViewDurationSelector from "./CallendarViewDurationSelector";
import { BottomSheetContextType } from "global/providers/BottomSheetProvider";

interface CallendarsViewProps {
    range?: DateRange | null;
    onSubmit?: (result?: DateRange | null) => void;
    onCancel?: () => void;
    selectorMode?: boolean;
    bottomSheetCtx: BottomSheetContextType;
}

const CallendarsView: React.FC<CallendarsViewProps> = ({ range, onSubmit, onCancel, selectorMode, bottomSheetCtx }) => {

    const { t } = useTranslation();

    const date = range?.start || null;

    // activeControl determines which control is currently selected/focused
    const [activeControl, setActiveControl] = useState<'start' | 'end'>('start');

    const [currentRange, setCurrentRange] = useState<DateRange | null>(range || {start: null, end: null});
    
    const prepareMonthsArray = (range: DateRange): Date[] => {
        const months: Date[] = [];
        if (selectorMode || !range.end) {
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

        if (activeControl === 'start') {
            newRange.start = day;
        } else {
            newRange.end = day;
        }

        // Normalize ordering if both set and start > end
        if (newRange.start && newRange.end && newRange.start > newRange.end) {
            const temp = newRange.start;
            newRange.start = newRange.end;
            newRange.end = temp;
        }

        setCurrentRange(newRange);
        // Cycle to next control
        setActiveControl(activeControl === 'start' ? 'end' : 'start');
    }


    if (!selectorMode && !date) {
        return (
            <div className="square-tile col-tile px-5">
                {t("others.availableAnytime")}
            </div>
        )
    }

    if (!currentRange) {
        return <div>??</div>
    }

    const months = prepareMonthsArray(currentRange);

    return (

        <div className="callendars-view-wrapper">

            <div className="callendars-view-header flex flex-col gap-2 px-3">
                {selectorMode && (<>

                    <CallendarsViewControl
                        onFocus={() => setActiveControl('start')}
                        onRemove={() => {
                            setCurrentRange({ start: null, end: currentRange.end || null });
                            setActiveControl('start');
                        }}
                        selected={activeControl === 'start'}
                        date={currentRange?.start}
                        placeholder={activeControl === 'start'
                            ? t("callendar.control.rangeStartPlaceholder")
                            : t('callendar.control.anytime')}
                        label={t("callendar.control.rangeStartLabel")}
                        id="start-date"
                    ></CallendarsViewControl>

                    <CallendarsViewControl
                        onFocus={() => setActiveControl('end')}
                        onRemove={() => {
                            setCurrentRange({ start: currentRange.start || null, end: null });
                            if (currentRange.start) {
                                setActiveControl('end');
                            } else {
                                setActiveControl('start');
                            }
                        }}
                        selected={activeControl === 'end'}
                        date={currentRange.end}
                        placeholder={activeControl === 'end'
                            ? t("callendar.control.rangeEndPlaceholder")
                            : t('callendar.control.anytime')}
                        label={t("callendar.control.rangeEndLabel")}
                        id="end-date"
                        injectRightComponent={!!currentRange.start &&
                            <CallendarViewDurationSelector
                                bottomSheetCtx={bottomSheetCtx}
                                initial={currentRange.end ?
                                    Math.max(1,
                                        (currentRange.end.getFullYear() - currentRange.start.getFullYear()) * 12 +
                                        (currentRange.end.getMonth() - currentRange.start.getMonth()))
                                    : 1}
                                onSubmit={(value) => {
                                    if (!value) {
                                        setCurrentRange({ start: currentRange.start || null, end: null });
                                    } else {
                                        const endDate = new Date(currentRange.start!);
                                        endDate.setMonth(endDate.getMonth() + value);
                                        setCurrentRange({ start: currentRange.start || null, end: endDate });
                                    }
                                }}></CallendarViewDurationSelector>
                        }
                    ></CallendarsViewControl>

                </>)}

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

                    <Button
                        disabled={!currentRange.start}
                        onClick={() => onSubmit?.(currentRange)}
                        size={BtnSizes.LARGE} mode={BtnModes.PRIMARY} fullWidth={true}>
                        {t("common.confirm")}
                    </Button>
                </div>
            )}

        </div>

    );
}

export default CallendarsView;