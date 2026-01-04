import React, { useRef } from 'react';
import FormError from '../controls/FormError';
import FloatingLabel from '../controls/FloatingLabel';
import { DateRange } from '@shared/interfaces/WorkerProfileI';
import { usePopup } from 'global/providers/PopupProvider';
import { useTranslation } from 'react-i18next';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import { useFullScreenDialog } from 'global/providers/FullScreenDialogProvider';
import CallendarsView from './CallendarsView';

interface DateRangeProps {
    value?: DateRange | null;
    onChange?: (range?: DateRange | null) => void;
    label?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    name?: string;
    className?: string;
    /** When true, only single date selection is allowed (end date is ignored) */
    singleDateMode?: boolean;
}

const DateRangeInputViewSelector: React.FC<DateRangeProps> = ({
    value,
    onChange,
    label,
    required,
    error,
    disabled,
    name,
    className = '',
    singleDateMode = false,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomSheetCtx = useBottomSheet();
    const fullScreenDialogCtx = useFullScreenDialog();
    const { t } = useTranslation();

    const _value = {
        start: value?.start ? new Date(value.start) : null,
        end: value?.end ? new Date(value.end) : null,
        id: value?.id || undefined,
    }

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;

        fullScreenDialogCtx.open({
            title: label,
            children: <CallendarsView
                range={_value}
                selectorMode={true}
                singleDateMode={singleDateMode}
                bottomSheetCtx={bottomSheetCtx}
                onSubmit={(dateRange) => {
                    onChange?.(dateRange);
                    fullScreenDialogCtx.close();
                }}
                onCancel={() => {
                    onChange?.(null);
                    fullScreenDialogCtx.close();
                }}
            ></CallendarsView>
        })
    }

    let myClass = `pp-date-input ${className}`;
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
    }
    if (error) {
        myClass += ' pp-control-error';
    }

    const hasValue = !!(_value?.start || _value?.end);
    const isLabelFloating = hasValue;

    const formatDateRange = (range?: DateRange | null, placeholder?: string): string => {
        if (!range?.start) return placeholder || '';

        const startMonth = t(`callendar.monthShort.${range.start.getMonth()}`);
        const startDayNumber = range.start.getDate();
        let result = `${startDayNumber} ${startMonth}`;
        
        // In single date mode, just show the date with year
        if (singleDateMode) {
            result += ` ${range.start.getFullYear()}`;
            return result;
        }
        
        if (range.end) {
            const endMonth = t(`callendar.monthShort.${range.end.getMonth()}`);
            const endDayNumber = range.end.getDate();
            result += ` - ${endDayNumber} ${endMonth} ${range.end.getFullYear()}`;
        } else {
            result += ` ${range.start.getFullYear()}`;
        }
        return result;
    }

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
                            value={formatDateRange(_value)}
                            onClick={handleClick}
                            className="floating-input primary-text flex-1 cursor-pointer"
                            disabled={disabled}
                            required={required}
                            readOnly
                            placeholder=" "
                        />
                    </div>
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

export default DateRangeInputViewSelector;
