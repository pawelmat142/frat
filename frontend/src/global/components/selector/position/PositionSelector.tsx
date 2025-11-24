import { useState, useEffect, forwardRef } from 'react';
import { InputInterface } from '../../../interface/controls.interface';
import FloatingLabel from '../../controls/FloatingLabel';
import FormError from '../../controls/FormError';
import { Position } from '@shared/interfaces/EmployeeProfileI';
import { useFullScreenDialog } from 'global/providers/FullScreenDialogProvider';
import PositionSelectorContent from './PositionSelectorContent';


interface PositionSelectorProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: Position | null;
    onChange?: (position?: Position | null) => void;
    initializePositionByCountryCode?: string | null;
}

// TODO date range picker przerobić na ten nowy popup
// TODO auto uzupelniaj location country na podstawie pozycji
const PositionSelector = forwardRef<HTMLInputElement, PositionSelectorProps>(
    ({
        fullWidth = false,
        className = '',
        disabled,
        label,
        value,
        id,
        required,
        name,
        center,
        onChange,
        error,
        initializePositionByCountryCode
    }, ref) => {

        const [selectedPosition, setSelectedPosition] = useState<Position | null>(value || null);

        const fullScreenDialogCtx = useFullScreenDialog();

        let myClass = `pp-control pp-position-selector floating-input ${className}`;
        if (fullWidth) {
            myClass += ' w-full';
        } else {
            myClass += ' w-fit';
        }
        if (disabled) {
            myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
        }

        useEffect(() => {
            setSelectedPosition(value || null);
        }, [value]);

        const handleInputClick = async () => {
            if (disabled) return;

            await fullScreenDialogCtx.open({
                children: <PositionSelectorContent
                    initialPosition={value}
                    initializeByCountryCode={initializePositionByCountryCode}
                    onChange={(position) => {
                        fullScreenDialogCtx.close();
                        onChange?.(position);
                        setSelectedPosition(position);
                    }}
                    onCancel={() => {
                        fullScreenDialogCtx.close();
                    }}
                ></PositionSelectorContent>
            })
        };

        const displayValue = selectedPosition
            ? selectedPosition.address || `${selectedPosition.lat.toFixed(3)}, ${selectedPosition.lng.toFixed(3)}`
            : '';

        const hasValue = () => {
            return !!displayValue;
        };
        const isLabelFloating = hasValue();

        return (
            <div className={`floating-input-wrapper ${className}${center ? ' mx-auto' : ''}`}>
                <div className="floating-input-container">
                    <div
                        className={myClass + (error ? ' pp-control-error' : '')}
                        onClick={handleInputClick}
                        tabIndex={disabled ? -1 : 0}
                        aria-disabled={disabled}
                    >
                        <input
                            ref={ref}
                            id={id}
                            name={name || id}
                            type="text"
                            value={displayValue}
                            className="pr-10 bg-transparent"
                            disabled={disabled}
                            required={required}
                            readOnly
                            placeholder=" "
                        />
                    </div>
                    <FloatingLabel
                        htmlFor={id}
                        label={label}
                        required={required}
                        isActive={isLabelFloating}
                        error={error}
                    />
                </div>
                <FormError error={error} />
            </div>
        );
    });

export default PositionSelector;
