import { useState, useEffect, forwardRef } from 'react';
import { InputInterface } from '../../../interface/controls.interface';
import FloatingLabel from '../../controls/FloatingLabel';
import PushPinIcon from '@mui/icons-material/PushPin';
import FormError from '../../controls/FormError';
import { Position } from '@shared/interfaces/EmployeeProfileI';
import { usePositionSelector } from 'global/components/selector/position/PositionSelectorProvider';
import { useFullScreenDialog } from 'global/providers/FullScreenDialogProvider';


interface PositionViewSelectorProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: Position | null;
    onChange?: (position: Position | null) => void;
    initializePositionByCountryCode?: string | null;
}

// TODO dodac provider jak popup ale z fullscreen
// TODO position selector użyć w tym fullscreenie
// TODO przerobic stare na ten nowy position selector
// TODO date range picker przerobić na ten nowy popup

const PositionViewSelector = forwardRef<HTMLInputElement, PositionViewSelectorProps>(
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
            children: <div>TODO position selector fullscreen here</div>
        })
        // TODO!!
        const result = null
        
        if (onChange) {
            onChange(result);
        }
        setSelectedPosition(result);
    };

    const displayValue = selectedPosition
        ? selectedPosition.address || `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`
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
                    <span className={`pp-position-selector-icon MuiSvgIcon-root${disabled ? ' disabled' : ''}`}>
                        <PushPinIcon fontSize="medium" />
                    </span>
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

export default PositionViewSelector;
