import { useState, useEffect, forwardRef } from 'react';
import { InputInterface } from '../../../interface/controls.interface';
import FloatingLabel from '../../controls/FloatingLabel';
import FormError from '../../controls/FormError';
import PositionSelectorContent from './PositionSelectorContent';
import { PositionUtil } from '@shared/utils/PositionUtil';
import { GeocodedPosition, Position } from '@shared/interfaces/MapsInterfaces';
import PseudoView from 'global/components/PseudoView';
import { wait } from 'global/utils/utils';
import { AppConfig } from '@shared/AppConfig';
import { useGlobalContext } from 'global/providers/GlobalProvider';

interface PositionSelectorProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: GeocodedPosition | null;
    initialPosition: Position
    onChange?: (position?: GeocodedPosition | null) => void;
}

const PositionSelector = forwardRef<HTMLInputElement, PositionSelectorProps>(
    ({
        fullWidth = false,
        className = '',
        disabled,
        label,
        value,
        initialPosition,
        id,
        required,
        name,
        center,
        onChange,
        error,
    }, ref) => {

        const globalCtx = useGlobalContext();

        const [selectedPosition, setSelectedPosition] = useState<GeocodedPosition | null>(value || null);
        const [openPseudoView, setOpenPseudoView] = useState(false);

        useEffect(() => {
            setSelectedPosition(value || null);
        }, [value]);

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
            setOpenPseudoView(true);
            globalCtx.hideFooter();
        };

        const displayValue = selectedPosition
            ? selectedPosition.fullAddress || selectedPosition.city || PositionUtil.formatPosition(selectedPosition)
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

                <PseudoView show={openPseudoView}>
                    <PositionSelectorContent
                        initialPosition={initialPosition}
                        onChange={async (position) => {
                            setOpenPseudoView(false);
                            await wait(AppConfig.ROUTER_ANIMATION_DURATION);
                            onChange?.(position);
                            setSelectedPosition(position);
                            globalCtx.showFooter();
                        }}
                        close={() => {
                            setOpenPseudoView(false);
                            globalCtx.showFooter();
                        }}
                    ></PositionSelectorContent>
                </PseudoView>
            </div>
        );
    });

export default PositionSelector;
