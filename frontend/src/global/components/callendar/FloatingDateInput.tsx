import React, { useRef } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import FloatingLabel from '../controls/FloatingLabel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormError from '../controls/FormError';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import DatePickerSheet from './DatePickerSheet';
import { useTranslation } from 'react-i18next';

export const DatePickerViews = {
    YEAR: 'year',
    MONTH: 'month',
    DAY: 'day'
} as const;

export type DatePickerView = typeof DatePickerViews[keyof typeof DatePickerViews];

export interface DatePickerConfig {
    startView: DatePickerView;
    disableSelectDays: boolean
    disableShowDays: boolean;
}

export const defaultDatePickerConfig: DatePickerConfig = {
    startView: DatePickerViews.YEAR,
    disableSelectDays: true,
    disableShowDays: true,
}

export const datepickerWithDaysConfig: DatePickerConfig = {
    startView: DatePickerViews.YEAR,
    disableSelectDays: false,
    disableShowDays: false,
}

interface DateInputProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    config?: DatePickerConfig;
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
    config = defaultDatePickerConfig
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomSheetCtx = useBottomSheet();
    const { i18n } = useTranslation();

    let myClass = `  ${className}`;
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

        bottomSheetCtx?.open({
            title: label,
            showClose: true,
            children: (
                <DatePickerSheet
                    value={value}
                    onChange={(date) => {
                        if (onChange) onChange(date);
                        bottomSheetCtx.close();
                    }}
                    reset={() => {
                        if (onChange) onChange(null);
                        bottomSheetCtx.close();
                    }}

                    disabled={disabled}
                    config={config}
                />
            )
        });
    };

    const _value = value instanceof Date
        ? config.disableShowDays
            ? value.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })
            : value.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric', day: 'numeric' })
        : ''

    const isLabelFloating = !!_value;

    return (
        <div className={`floating-input-wrapper ${myClass}${center ? ' mx-auto' : ''}`}>
            <div className="floating-input-container">
                <div className="pp-control pp-input-row justify-between">
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
