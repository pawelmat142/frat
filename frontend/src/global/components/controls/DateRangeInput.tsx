import React, { useState } from 'react';
import { DateRange as DateRangeType } from '@shared/interfaces/EmployeeProfileI';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ControlLabel from './ControlLabel';
import FormError from './FormError';

interface DateRangeProps {
    value?: DateRangeType;
    onChange?: (range: DateRangeType | null) => void;
    label?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    name?: string;
    className?: string;
}

const DateRangeInput: React.FC<DateRangeProps> = ({
    value,
    onChange,
    label,
    required,
    error,
    disabled,
    name,
    className = '',
}) => {
    const [startDate, setStartDate] = useState<Date | null>(value ? new Date(value.start) : null);
    const [endDate, setEndDate] = useState<Date | null>(value ? new Date(value.end) : null);

    const handleStartChange = (date: Date | null) => {
        setStartDate(date);
        if (onChange) {
            onChange(date && endDate ? { start: date.toISOString(), end: endDate ? endDate.toISOString() : '' } : null);
        }
    };

    const handleEndChange = (date: Date | null) => {
        setEndDate(date);
        if (onChange) {
            onChange(startDate && date ? { start: startDate.toISOString(), end: date.toISOString() } : null);
        }
    };

    return (
        <div className={`pp-date-range-input ${className}`}>
            <ControlLabel label={label} required={required} />
            <div className="flex gap-2 items-center">
                <DatePicker
                    selected={startDate}
                    onChange={handleStartChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    disabled={disabled}
                    placeholderText="Start"
                    className="w-32"
                    name={name ? `${name}_start` : undefined}
                />
                <span className="mx-2">-</span>
                <DatePicker
                    selected={endDate}
                    onChange={handleEndChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || undefined}
                    disabled={disabled}
                    placeholderText="Koniec"
                    className="w-32"
                    name={name ? `${name}_end` : undefined}
                />
            </div>
            <FormError error={error ? { message: error } : undefined} />
        </div>
    );
};

export default DateRangeInput;
