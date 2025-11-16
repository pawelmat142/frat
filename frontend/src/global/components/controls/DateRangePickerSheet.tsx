import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from './Button';
import { BtnModes, BtnSizes } from 'global/interface/controls.interface';
import { useTranslation } from 'react-i18next';

interface DateRangePickerSheetProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    disabled?: boolean;
    minDate?: Date | null;
    maxDate?: Date | null;
    startDate?: Date | null;
    endDate?: Date | null;
}

const DateRangePickerSheet: React.FC<DateRangePickerSheetProps> = ({
    value,
    onChange,
    disabled,
    minDate,
    maxDate,
    startDate,
    endDate
}) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(value || new Date());

    const handleConfirm = () => {
        onChange(selectedDate);
    };

    const handleCancel = () => {
        onChange(null);
    };

    const { t } = useTranslation();

    return (
        <div className="date-picker-sheet">
            <div className="date-picker-sheet-calendar">
                <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    inline
                    disabled={disabled}
                    minDate={minDate || undefined}
                    maxDate={maxDate || undefined}
                    startDate={startDate || undefined}
                    endDate={endDate || undefined}
                    highlightDates={startDate && !endDate ? [startDate] : undefined}
                />
            </div>

            <div className="date-picker-sheet-actions">
                <Button onClick={handleCancel} mode={BtnModes.ERROR_TXT} fullWidth={true}>
                    {t("common.cancel")}
                </Button>
                <Button onClick={handleConfirm} mode={BtnModes.PRIMARY_TXT} fullWidth={true}>
                    {t("common.confirm")}
                </Button>
            </div>
        </div>
    );
};

export default DateRangePickerSheet;
