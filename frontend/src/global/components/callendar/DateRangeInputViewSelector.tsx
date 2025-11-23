import React, { useRef } from 'react';
import FormError from '../controls/FormError';
import FloatingLabel from '../controls/FloatingLabel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DateRange } from '@shared/interfaces/EmployeeProfileI';
import { usePopup } from 'global/providers/PopupProvider';

interface DateRangeProps {
    value?: DateRange | null;
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
    const inputRef = useRef<HTMLInputElement>(null);
    const popupCtx = usePopup();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;

        popupCtx.goToCallendarsView(value, (dateRange) => {
            if (onChange) {
                console.log('dateRange from popup:', dateRange);
                onChange(dateRange || null);
            }
        });
    };
    
    let myClass = `pp-date-input ${className}`;
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
    }
    if (error) {
        myClass += ' pp-control-error';
    }

    const hasValue = !!(value?.start || value?.end);
    const isLabelFloating = hasValue;

    // TODO display - 1 kontrolka
    return (
        <div className={`floating-input-wrapper ${myClass}`}>
            <div className="floating-input-container">
                <div className="pp-control pp-input-row">
                    <div className="flex items-center gap-2 w-full">
                        <input
                            ref={inputRef}
                            id={name}
                            name={name ? `${name}_start` : undefined}
                            type="text"
                            value={value?.start ? new Date(value.start).toLocaleDateString() : ''}
                            onClick={handleClick}
                            className="floating-input primary-text flex-1 cursor-pointer"
                            disabled={disabled}
                            required={required}
                            readOnly
                            placeholder=" "
                        />
                        <span className="secondary-text pt-6">-</span>
                        <input
                            id={name ? `${name}_end` : undefined}
                            name={name ? `${name}_end` : undefined}
                            type="text"
                            value={value?.end?.toLocaleDateString() || ''}
                            onClick={handleClick}
                            className="floating-input primary-text flex-1 cursor-pointer"
                            disabled={disabled}
                            required={required}
                            readOnly
                            placeholder=" "
                        />
                    </div>
                    <span
                        className={`pp-date-input-calendar MuiSvgIcon-root${disabled ? ' disabled' : ''}`}
                        onClick={handleClick}
                    >
                        <CalendarTodayIcon fontSize="medium" />
                    </span>
                    <FloatingLabel
                        htmlFor={name}
                        label={label}
                        required={required}
                        isActive={isLabelFloating}
                        error={error ? { message: error } : undefined}
                    />
                </div>
            </div>
            <FormError error={error ? { message: error } : undefined} />
        </div>
    );
};

export default DateRangeInput;
