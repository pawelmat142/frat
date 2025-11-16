import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Button from './Button';
import { BtnModes, BtnSizes } from 'global/interface/controls.interface';

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
                <Button
                    mode={BtnModes.SECONDARY}
                    size={BtnSizes.LARGE}
                    onClick={handleCancel}
                    fullWidth
                >
                    Anuluj
                </Button>
                <Button
                    mode={BtnModes.PRIMARY}
                    size={BtnSizes.LARGE}
                    onClick={handleConfirm}
                    fullWidth
                >
                    Potwierdź
                </Button>
            </div>
        </div>
    );
};

export default DatePickerSheet;
