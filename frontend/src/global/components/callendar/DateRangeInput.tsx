import React, { useState, useRef } from 'react';
import FormError from '../controls/FormError';
import FloatingLabel from '../controls/FloatingLabel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DateRange } from '@shared/interfaces/WorkerI';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import DateRangePickerSheet from './DateRangePickerSheet';
import { useTranslation } from 'react-i18next';
import { DateUtil } from '@shared/utils/DateUtil';

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
    const bottomSheetCtx = useBottomSheet();

    const { t } = useTranslation();
    const handleStartDateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        
        bottomSheetCtx.open({
            title: `${label} - ${t('common.start')}`,
            showClose: true,
            children: (
                <DateRangePickerSheet
                    value={value?.start ? DateUtil.parseLocalDateString(value.start) : undefined}
                    onChange={(startDate) => {
                        if (onChange) {
                            onChange({ start: DateUtil.toLocalDateString(startDate) ?? undefined, end: value?.end });
                        }
                        bottomSheetCtx.close();
                    }}
                    disabled={disabled}
                    startDate={value?.start ? DateUtil.parseLocalDateString(value.start) : undefined}
                    endDate={value?.end ? DateUtil.parseLocalDateString(value.end) : undefined}
                />
            )
        });
    };

    const handleEndDateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        
        bottomSheetCtx.open({
            title: `${label} - ${t('common.end')}`,
            showClose: true,
            children: (
                <DateRangePickerSheet
                    value={value?.end ? DateUtil.parseLocalDateString(value.end) : undefined}
                    onChange={(endDate) => {
                        if (onChange) {
                            onChange({ start: value?.start, end: DateUtil.toLocalDateString(endDate) ?? undefined });
                        }
                        bottomSheetCtx.close();
                    }}
                    disabled={disabled}
                    minDate={value?.start ? DateUtil.parseLocalDateString(value.start) : undefined}
                    startDate={value?.start ? DateUtil.parseLocalDateString(value.start) : undefined}
                    endDate={value?.end ? DateUtil.parseLocalDateString(value.end) : undefined}
                />
            )
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

    return (
        <div className={`floating-input-wrapper ${myClass}`}>
            <div className="floating-input-container">
                <div className="pp-control min-height pp-input-row">
                    <div className="flex items-center gap-2 w-full">
                        <input
                            ref={inputRef}
                            id={name}
                            name={name ? `${name}_start` : undefined}
                            type="text"
                            value={value?.start ? DateUtil.parseLocalDateString(value.start).toLocaleDateString() : ''}
                            onClick={handleStartDateClick}
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
                            value={value?.end ? DateUtil.parseLocalDateString(value.end).toLocaleDateString() : ''}
                            onClick={handleEndDateClick}
                            className="floating-input primary-text flex-1 cursor-pointer"
                            disabled={disabled}
                            required={required}
                            readOnly
                            placeholder=" "
                        />
                    </div>
                    <span
                        className={`pp-date-input-calendar MuiSvgIcon-root${disabled ? ' disabled' : ''}`}
                        onClick={handleStartDateClick}
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
