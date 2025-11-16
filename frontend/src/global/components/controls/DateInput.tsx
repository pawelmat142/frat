import React, { useState, useRef } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
import FloatingLabel from './FloatingLabel';
// Możesz podmienić na inną ikonę lub bibliotekę
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormError from './FormError';

interface DateInputProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
}

const DateInput: React.FC<DateInputProps> = ({
    fullWidth = false,
    className = '',
    disabled,
    label,
    value,
    id,
    required,
    autoComplete,
    name,
    center,
    onChange,
    error,
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    let myClass = `pp-date-input ${className}`;
    if (fullWidth) {
        myClass += ' w-full';
    } else {
        myClass += ' w-fit';
    }
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
    }
    if (error) {
        myClass += ' pp-control-error';   
    }

    const handleInputClick = () => {
        if (!disabled) setShowPicker(true);
    };

    const handleDateChange = (date: Date | null) => {
        setShowPicker(false);
        if (onChange) onChange(date);
    };

    const _value = value instanceof Date ? value.toLocaleDateString() : ''

    const isLabelFloating = !!_value;

        return (
            <div className={`floating-input-wrapper ${myClass}${center ? ' mx-auto' : ''}`}>
                <div className="floating-input-container">
                    <div className="pp-control pp-date-input-row primary-text">
                        <input
                            ref={inputRef}
                            id={id}
                            name={name || id}
                            type="text"
                            value={_value}
                            onClick={handleInputClick}
                            className={`floating-input pr-10`}
                            disabled={disabled}
                            required={required}
                            autoComplete={autoComplete}
                            readOnly
                            placeholder=" "
                        />
                        <span
                            className={`pp-date-input-calendar MuiSvgIcon-root${disabled ? ' disabled' : ''}`}
                            onClick={handleInputClick}
                        >
                            <CalendarTodayIcon fontSize="medium" />
                        </span>
                        {showPicker && (
                            <div className="pp-date-input-picker left">
                                <DatePicker
                                    selected={value || new Date()}
                                    onChange={handleDateChange}
                                    inline
                                    disabled={disabled}
                                />
                            </div>
                        )}
                        <FloatingLabel
                            htmlFor={id}
                            label={label}
                            required={required}
                            isActive={isLabelFloating}
                            error={error}
                        />
                    </div>
                </div>
                <FormError error={error} />
            </div>
        );

};

export default DateInput;
