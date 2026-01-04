import React from 'react';
import DateRangeInputViewSelector from './DateRangeInputViewSelector';

interface DateInputProps {
    /** Local date string in YYYY-MM-DD format */
    value?: string | null;
    onChange?: (date: string | null) => void;
    label?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    name?: string;
    className?: string;
}

/**
 * Single date selector component.
 * Wrapper around DateRangeInputViewSelector with singleDateMode enabled.
 * Works with local date strings in YYYY-MM-DD format.
 */
const DateInputViewSelector: React.FC<DateInputProps> = ({
    value,
    onChange,
    label,
    required,
    error,
    disabled,
    name,
    className,
}) => {
    return (
        <DateRangeInputViewSelector
            value={value ? { start: value, end: null } : null}
            onChange={(range) => onChange?.(range?.start ?? null)}
            label={label}
            required={required}
            error={error}
            disabled={disabled}
            name={name}
            className={className}
            singleDateMode={true}
        />
    );
};

export default DateInputViewSelector;
