import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from '../controls/Button';
import { BtnModes } from 'global/interface/controls.interface';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
import { DatePickerConfig, DatePickerView, DatePickerViews, defaultDatePickerConfig } from './FloatingDateInput';
import { isOneOf } from '@shared/utils/util';

interface DatePickerSheetProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    reset: () => void;
    disabled?: boolean;
    config?: DatePickerConfig;
    minDate?: Date;
}

const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
    value,
    onChange,
    reset,
    disabled,
    config = defaultDatePickerConfig,
    minDate,
}) => {
    const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
    const effectiveMinDate = config.futureDatesOnly ? today : minDate;

    const [selectedDate, setSelectedDate] = React.useState<Date | null>(value || new Date());
    const [view, setView] = React.useState<DatePickerView>(config.startView);
    const [direction, setDirection] = React.useState<1 | -1>(1);

    const changeView = (next: DatePickerView) => {
        const order: DatePickerView[] = [DatePickerViews.YEAR, DatePickerViews.MONTH, DatePickerViews.DAY];
        setDirection(order.indexOf(next) > order.indexOf(view) ? 1 : -1);
        setView(next);
    };

    const handleConfirm = () => {
        onChange(selectedDate);
    };

    const { t } = useTranslation();

    const handleViewBack = () => {
        const order: DatePickerView[] = [DatePickerViews.YEAR, DatePickerViews.MONTH, DatePickerViews.DAY];
        const prevView = order[Math.max(0, order.indexOf(view) - 1)];
        setDirection(order.indexOf(prevView) > order.indexOf(view) ? 1 : -1);
        setView(prevView);
    }

    return (
        <div className="date-picker-sheet">
            <div className="date-picker-sheet-calendar overflow-hidden relative">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={view}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -40 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                    >
                        {view === DatePickerViews.YEAR && (
                            <DatePicker
                                className='w-full'
                                selected={selectedDate}
                                onChange={(date) => { setSelectedDate(date); changeView(DatePickerViews.MONTH); }}
                                showYearPicker
                                inline
                                disabled={disabled}
                                minDate={config.futureDatesOnly ? today : minDate}
                            />
                        )}
                        {view === DatePickerViews.MONTH && (
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => {
                                    if (config.disableSelectDays && date) {
                                        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                                        setSelectedDate(firstDay);
                                        onChange(firstDay);
                                    } else {
                                        setSelectedDate(date);
                                        changeView(DatePickerViews.DAY);
                                    }
                                }}
                                showMonthYearPicker
                                inline
                                disabled={disabled}
                                minDate={config.futureDatesOnly ? today : minDate}
                            />
                        )}
                        {view === DatePickerViews.DAY && (
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                inline
                                disabled={disabled}
                                minDate={effectiveMinDate}
                            />
                        )}

                        {isOneOf([DatePickerViews.MONTH, DatePickerViews.DAY], view) && (
                            <div className='flex justify-end items-center mt-5'>
                                <Button mode={BtnModes.SECONDARY_TXT} onClick={handleViewBack}>
                                    {t("common.back")} <FaChevronRight />
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="date-picker-sheet-actions">
                <Button onClick={reset} mode={BtnModes.SECONDARY_TXT} fullWidth={true}>
                    {t("common.reset")}
                </Button>
                <Button onClick={handleConfirm} mode={BtnModes.PRIMARY} fullWidth={true}>
                    {t("common.confirm")}
                </Button>
            </div>
        </div>
    );
};

export default DatePickerSheet;
