import { DateRange } from "@shared/interfaces/EmployeeProfileI";
import React, { useState, useEffect, useRef } from "react";
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
    /** When true, only single date selection is allowed (end date is ignored) */
    singleDateMode?: boolean;
    bottomSheetCtx: BottomSheetContextType;
}

const CallendarsView: React.FC<CallendarsViewProps> = ({ range, onSubmit, onCancel, selectorMode, singleDateMode, bottomSheetCtx }) => {

    const { t } = useTranslation();

    const date = range?.start || null;

    // activeControl determines which control is currently selected/focused
    const [activeControl, setActiveControl] = useState<'start' | 'end'>('start');

    const [currentRange, setCurrentRange] = useState<DateRange | null>(range || {start: null, end: null});
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const initialScrollDone = useRef(false);

    // Scroll to start date month on initial mount
    useEffect(() => {
        if (initialScrollDone.current) return;
        
        const targetDate = range?.start;
        if (targetDate && scrollContainerRef.current) {
            const monthId = `month-${targetDate.getFullYear()}-${targetDate.getMonth()}`;
            const targetElement = document.getElementById(monthId);
            if (targetElement) {
                // Small delay to ensure DOM is ready and allow smooth animation to be visible
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    initialScrollDone.current = true;
                }, 100);
            }
        }
    }, [range?.start]);

    const prepareMonthsArray = (range: DateRange): Date[] => {
        const months: Date[] = [];
        const now = new Date();
        // Always start from current month
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Find the furthest selected date
        let furthestDate: Date | null = null;
        if (range.start && range.end) {
            furthestDate = range.start > range.end ? range.start : range.end;
        } else if (range.start) {
            furthestDate = range.start;
        } else if (range.end) {
            furthestDate = range.end;
        }
        
        // End at furthest date + 12 months, or current month + 12 if no date selected
        const endBase = furthestDate || now;
        const end = new Date(endBase.getFullYear(), endBase.getMonth() + 12, 1);
        
        let current = new Date(start);
        while (current <= end) {
            months.push(new Date(current));
            current.setMonth(current.getMonth() + 1);
        }
        return months;
    }

    const handleClickDay = (day: Date) => {
        if (!selectorMode) return;

        // In single date mode, only set start date
        if (singleDateMode) {
            setCurrentRange({ start: day, end: null });
            return;
        }

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

            <div className="callendars-view-header flex flex-col gap-1 px-3">
                {selectorMode && (<>

                    <CallendarsViewControl
                        onFocus={() => setActiveControl('start')}
                        onRemove={() => {
                            setCurrentRange({ start: null, end: singleDateMode ? null : (currentRange.end || null) });
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

                    {!singleDateMode && (
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
                    )}

                </>)}

                <div>
                    <CallendarDaysHeader fullScreenMode={true} />
                </div>
            </div>

            <div ref={scrollContainerRef} className="w-full flex flex-col items-center gap-4 h-full justify-center p-2 callendars-view-fullscreen">

                {months.map((monthDate) => {
                    return (<div
                        key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
                        id={`month-${monthDate.getFullYear()}-${monthDate.getMonth()}`}
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
                    <Button onClick={onCancel} mode={BtnModes.ERROR_TXT} fullWidth={true}>
                        {t("common.reset")}
                    </Button>

                    <Button
                        disabled={!currentRange.start}
                        onClick={() => onSubmit?.(currentRange)}
                        mode={BtnModes.PRIMARY} fullWidth={true}>
                        {t("common.confirm")}
                    </Button>
                </div>
            )}

        </div>

    );
}

export default CallendarsView;