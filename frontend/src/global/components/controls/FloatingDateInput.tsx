import React, { useRef } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import FloatingLabel from './FloatingLabel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormError from './FormError';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import DatePickerSheet from './DatePickerSheet';

interface DateInputProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
}

const FloatingDateInput: React.FC<DateInputProps> = ({
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
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomSheetCtx = useBottomSheet();

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
        if (disabled) return;
        
        bottomSheetCtx.open({
            title: label,
            showClose: true,
            children: (
                <DatePickerSheet
                    value={value}
                    onChange={(date) => {
                        if (onChange) onChange(date);
                        bottomSheetCtx.close();
                    }}
                    disabled={disabled}
                />
            )
        });
    };

    const _value = value instanceof Date ? value.toLocaleDateString() : ''

    const isLabelFloating = !!_value;

    // TODO translations of datepicker content

    return (
        <div className={`floating-input-wrapper ${myClass}${center ? ' mx-auto' : ''}`}>
            <div className="floating-input-container">
                <div className="pp-control pp-date-input-row">
                    <input
                        ref={inputRef}
                        id={id}
                        name={name || id}
                        type="text"
                        value={_value}
                        onClick={handleInputClick}
                        className={`floating-input pr-10 primary-text`}
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

export default FloatingDateInput;
