import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ControlLabel from './ControlLabel';
import FormError from './FormError';
import { DateRange } from '@shared/interfaces/EmployeeProfileI';
import { DateRangeUtil } from '@shared/utils/DateRangeUtil';
import { DateUtil } from '@shared/utils/DateUtil';

interface DateRangeProps {
    value?: DateRange;
    onChange?: (range: DateRange | null) => void;
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
    const [startDate, setStartDate] = useState<Date | null>(value?.start || null);
    const [endDate, setEndDate] = useState<Date | null>(value?.end || null);

    const handleStartChange = (_date: Date | null) => {
        const date = _date ? DateRangeUtil.newLocalDate(_date) : null
        if (!date) {
            return
        }
        setStartDate(date);
        if (onChange) {
            onChange({ start: date, end: getEndDate(date, endDate) });
        }
    };

    const getEndDate = (startDate: Date, prevEndDate: Date | null): Date | null => {
        if (!prevEndDate) {
            return prevEndDate
        }
        if (DateUtil.isBefore(prevEndDate, startDate)) {
            const result = new Date(startDate);
            result.setDate(result.getDate() + 7);
            return result;
        }
        return prevEndDate;
    }
    
    const handleEndChange = (_date: Date | null) => {
        const date = _date ? DateRangeUtil.newLocalDate(_date) : null;
        setEndDate(date);
        if (onChange) {
            onChange({ start: startDate, end: date });
        }
    };

    let myClass = `pp-date-input ${className} cursor-pointer`;
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
    }
    if (error) {
        myClass += ' pp-control-error';
    }

    return (
        <div className={myClass}>
            <ControlLabel label={label} required={required} />
            <div className="pp-control pp-date-input-row gap-2">
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
                    dateFormat={"dd-MM-yyyy"}
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
                    dateFormat={"dd-MM-yyyy"}
                />
            </div>
            <FormError error={error ? { message: error } : undefined} />
        </div>
    );
};

export default DateRangeInput;
