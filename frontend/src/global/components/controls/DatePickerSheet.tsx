import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from './Button';
import { BtnModes } from 'global/interface/controls.interface';
import { useTranslation } from 'react-i18next';

interface DatePickerSheetProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    disabled?: boolean;
}

const DatePickerSheet: React.FC<DatePickerSheetProps> = ({
    value,
    onChange,
    disabled
}) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(value || new Date());

    const handleConfirm = () => {
        onChange(selectedDate);
    };

    const handleCancel = () => {
        onChange(null)
    }

    const { t } = useTranslation();

    return (
        <div className="date-picker-sheet">
            <div className="date-picker-sheet-calendar">
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    inline
                    disabled={disabled}
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

export default DatePickerSheet;
