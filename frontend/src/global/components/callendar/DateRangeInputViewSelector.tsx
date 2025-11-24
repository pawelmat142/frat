import React, { useRef } from 'react';
import FormError from '../controls/FormError';
import FloatingLabel from '../controls/FloatingLabel';
import { DateRange } from '@shared/interfaces/EmployeeProfileI';
import { usePopup } from 'global/providers/PopupProvider';
import { Utils } from 'global/utils';
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
    const bottomSheetCtx = useBottomSheet();
    const fullScreenDialogCtx = useFullScreenDialog();
    const { t } = useTranslation();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;

        fullScreenDialogCtx.open({
            children: <CallendarsView
                range={value}
                selectorMode={true}
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

    const hasValue = !!(value?.start || value?.end);
    const isLabelFloating = hasValue;

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
                            value={Utils.formatDateRange(t, value)}
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

export default DateRangeInput;
