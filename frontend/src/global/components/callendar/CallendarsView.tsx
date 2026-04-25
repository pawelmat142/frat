import { DateRange } from "@shared/interfaces/WorkerI";
import React, { useState, useEffect, useRef } from "react";
import Button from "global/components/controls/Button";
import { useTranslation } from "react-i18next";
import MonthCallendar from "./MonthCallendar";
import CallendarDaysHeader from "./CallendarDaysHeader";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import CallendarsViewControl from "./CallendarsViewControl";
import CallendarViewDurationSelector from "./CallendarViewDurationSelector";
import { BottomSheetContextType } from "global/providers/BottomSheetProvider";
import { DateUtil } from "@shared/utils/DateUtil";
import Header from "../Header";


interface CallendarsViewProps {
    ranges?: DateRange[] | null;
    onSubmit?: (result?: DateRange | null) => void;
    onCancel?: () => void;
    onClose?: () => void;
    selectorMode?: boolean;
    /** When true, only single date selection is allowed (end date is ignored) */
    singleDateMode?: boolean;
    bottomSheetCtx: BottomSheetContextType;
    title: string
}

const CallendarsView: React.FC<CallendarsViewProps> = ({ ranges, onSubmit, onCancel, onClose, selectorMode, singleDateMode, bottomSheetCtx, title }) => {
    
    const { t } = useTranslation();

    const firstRange = ranges && ranges.length > 0 ? ranges[0] : null;
    const date = firstRange?.start ? DateUtil.parseLocalDateString(firstRange.start) : null;

    // activeControl determines which control is currently selected/focused
    const [activeControl, setActiveControl] = useState<'start' | 'end'>('start');

    const [currentRange, setCurrentRange] = useState<DateRange>(firstRange || {start: null, end: null});
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const initialScrollDone = useRef(false);

    // Scroll to start date month on initial mount
    useEffect(() => {
        if (initialScrollDone.current) return;
        
        const targetDate = firstRange?.start ? DateUtil.parseLocalDateString(firstRange.start) : null;
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
    }, [firstRange?.start]);

    const prepareMonthsArray = (rangesList: DateRange[]): Date[] => {
        const months: Date[] = [];
        const now = new Date();
        // Always start from current month
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Find the furthest selected date
        let furthestDate: Date | null = null;
        rangesList.forEach((range) => {
            const rangeStart = range.start ? DateUtil.parseLocalDateString(range.start) : null;
            const rangeEnd = range.end ? DateUtil.parseLocalDateString(range.end) : null;

            let candidate: Date | null = null;
            if (rangeStart && rangeEnd) {
                candidate = rangeStart > rangeEnd ? rangeStart : rangeEnd;
            } else if (rangeStart) {
                candidate = rangeStart;
            } else if (rangeEnd) {
                candidate = rangeEnd;
            }

            if (candidate && (!furthestDate || candidate > furthestDate)) {
                furthestDate = candidate;
            }
        });
        
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

        const dayStr = DateUtil.toLocalDateString(day);

        // In single date mode, only set start date
        if (singleDateMode) {
            setCurrentRange({ start: dayStr, end: null });
            return;
        }

        let newRange: DateRange = { ...currentRange };

        if (activeControl === 'start') {
            newRange.start = dayStr;
        } else {
            newRange.end = dayStr;
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
            <div className="p-tile square-tile col-tile px-5">
                {t("others.availableAnytime")}
            </div>
        )
    }

    const months = prepareMonthsArray(selectorMode ? [currentRange] : (ranges || []));

    return (

        <div className="callendars-view-wrapper primary-bg">

            <Header onBack={() => onClose?.()} title={title} />

            <div className="callendars-view-header flex flex-col gap-1">
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
                                    initial={currentRange.end && currentRange.start ?
                                        (() => {
                                            const startDate = DateUtil.parseLocalDateString(currentRange.start);
                                            const endDate = DateUtil.parseLocalDateString(currentRange.end);
                                            return Math.max(1,
                                                (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                                                (endDate.getMonth() - startDate.getMonth()));
                                        })()
                                        : 1}
                                    onSubmit={(value) => {
                                        if (!value) {
                                            setCurrentRange({ start: currentRange.start || null, end: null });
                                        } else {
                                            const startDate = DateUtil.parseLocalDateString(currentRange.start!);
                                            startDate.setMonth(startDate.getMonth() + value);
                                            setCurrentRange({ start: currentRange.start || null, end: DateUtil.toLocalDateString(startDate) });
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
                            selectedRanges={selectorMode ? [currentRange] : (ranges || [])}
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