import { useState, useEffect, forwardRef } from 'react';
import { InputInterface } from '../../../interface/controls.interface';
import FloatingLabel from '../../controls/FloatingLabel';
import FormError from '../../controls/FormError';
import { GeocodedPosition } from '@shared/interfaces/EmployeeProfileI';
import { useFullScreenDialog } from 'global/providers/FullScreenDialogProvider';
import PositionSelectorContent from './PositionSelectorContent';
import { Utils } from 'global/utils/utils';

interface PositionSelectorProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: GeocodedPosition | null;
    onChange?: (position?: GeocodedPosition | null) => void;
}

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
    }, ref) => {

        const [selectedPosition, setSelectedPosition] = useState<GeocodedPosition | null>(value || null);
        const fullScreenDialogCtx = useFullScreenDialog();

        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''; // provide via .env.local

        let myClass = `pp-control pp-position-selector floating-input ${className}`;
        if (fullWidth) {
            myClass += ' w-full';
        } else {
            myClass += ' w-fit';
        }
        if (disabled) {
            myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
        }

        const handleInputClick = async () => {
            if (disabled) return;

            await fullScreenDialogCtx.open({
                children: <PositionSelectorContent
                    initialPosition={value}
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
            ? selectedPosition.fullAddress || selectedPosition.city || Utils.formatPosition(selectedPosition)
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
                            className=""
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
