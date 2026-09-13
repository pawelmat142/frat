import React, { useRef } from 'react';
import { InputInterface } from '../../interface/controls.interface';
import FloatingLabel from '../controls/FloatingLabel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormError from '../controls/FormError';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import DatePickerSheet from './DatePickerSheet';
import { useTranslation } from 'react-i18next';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import { useAnchoredPopover } from 'global/hooks/useAnchoredPopover';

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
    futureDatesOnly?: boolean;
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

export const datepickerWithDaysConfigFutureOnly: DatePickerConfig = {
    ...datepickerWithDaysConfig,
    futureDatesOnly: true,
}

interface DateInputProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: Date | null;
    onChange?: (date: Date | null) => void;
    config?: DatePickerConfig;
    minDate?: Date;
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
    config = defaultDatePickerConfig,
    mode,
    minDate,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomSheetCtx = useBottomSheet();
    const { isDesktop } = useGlobalContext();
    const { i18n } = useTranslation();
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const { closePopover, isPopoverMounted, isPopoverOpen, togglePopover } = useAnchoredPopover(isDesktop, wrapperRef);

    let myClass = `  ${className}`;
    if (fullWidth) {
        myClass += ' w-full';
    } else {
        myClass += ' w-fit';
    }
    if (disabled) {
        myClass += ' control-disabled';
    }
    if (error) {
        myClass += ' pp-control-error';
    }

    const closeDatePicker = () => {
        if (isDesktop) {
            closePopover();
        } else {
            bottomSheetCtx.close();
        }
    };

    const datePicker = (
        <DatePickerSheet
            value={value}
            onChange={date => {
                onChange?.(date);
                closeDatePicker();
            }}
            reset={() => {
                onChange?.(null);
                closeDatePicker();
            }}
            disabled={disabled}
            config={config}
            minDate={minDate}
        />
    );

    const handleInputClick = () => {
        if (disabled) return;

        if (isDesktop) {
            togglePopover();
            return;
        }

        bottomSheetCtx.open({
            title: label,
            showClose: true,
            children: datePicker,
        });
    };

    const desktopPopover = isDesktop && isPopoverMounted ? (
        <div
            className={`desktop-date-picker-popover${isPopoverOpen ? ' open' : ''}`}
            role="dialog"
            aria-label={label}
        >
            {datePicker}
        </div>
    ) : null;

    const _value = value instanceof Date
        ? config.disableShowDays
            ? value.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })
            : value.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric', day: 'numeric' })
        : ''

    const isLabelFloating = !!_value;

    return (
        <div ref={wrapperRef} className={`floating-input-wrapper ${myClass}${center ? ' mx-auto' : ''}`}>
            <div className="floating-input-container">
                <div
                    className="pp-control pp-input-row floating-date-input-control justify-between"
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-haspopup="dialog"
                    aria-disabled={disabled}
                    onClick={handleInputClick}
                    onKeyDown={event => {
                        if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                            event.preventDefault();
                            handleInputClick();
                        }
                    }}
                >
                    <input
                        ref={inputRef}
                        id={id}
                        name={name || id}
                        type="text"
                        value={_value}
                        className={`floating-input pr-10 primary-text ${mode}`}
                        disabled={disabled}
                        required={required}
                        autoComplete={autoComplete}
                        readOnly
                        placeholder=" "
                    />
                    <span
                        className={`pp-date-input-calendar MuiSvgIcon-root${disabled ? ' disabled' : ''}`}
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
                {desktopPopover}
            </div>
            <FormError error={error} />
        </div>
    );
};

export default FloatingDateInput;
