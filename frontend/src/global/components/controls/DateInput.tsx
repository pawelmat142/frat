import React, { useState, useRef } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
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
    error
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

    return (
        <div className={`${myClass}${center ? ' mx-auto' : ''}`}>
            <ControlLabel id={id} label={label} required={required} />
            <div className="pp-control pp-date-input-row">
                <input
                    ref={inputRef}
                    id={id}
                    name={name || id}
                    type="text"
                    value={_value}
                    onClick={handleInputClick}
                    className='pr-10'
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                    readOnly
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
                            selected={value}
                            onChange={handleDateChange}
                            inline
                            disabled={disabled}
                        />
                    </div>
                )}
            </div>

            <FormError error={error} />
        </div>
    );
};

export default DateInput;
