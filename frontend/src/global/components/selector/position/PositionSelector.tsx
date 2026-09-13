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
        const [isSelectorOpen, setIsSelectorOpen] = useState(false);

        useEffect(() => {
            setSelectedPosition(value || null);
        }, [value]);

        let inputClass = ''

        let myClass = `pp-control pp-position-selector floating-input min-height ${className}`;
        if (fullWidth) {
            myClass += ' w-full';
        } else {
            myClass += ' w-fit';
        }
        if (disabled) {
            myClass += ' control-disabled';
        }

        const handleInputClick = () => {
            if (disabled) return;
            setIsSelectorOpen(true);
            if (!globalCtx.isDesktop) globalCtx.hideFooter();
        };

        const closeSelector = () => {
            setIsSelectorOpen(false);
            if (!globalCtx.isDesktop) globalCtx.showFooter();
        };

        const confirmPosition = async (position: GeocodedPosition | null) => {
            closeSelector();
            if (!globalCtx.isDesktop) await wait(AppConfig.ROUTER_ANIMATION_DURATION);
            onChange?.(position);
            setSelectedPosition(position);
        };

        const 
        handleInputKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            handleInputClick();
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
                        onKeyDown={handleInputKeyDown}
                        tabIndex={disabled ? -1 : 0}
                        role="button"
                        aria-haspopup="dialog"
                        aria-expanded={isSelectorOpen}
                        aria-disabled={disabled}
                    >
                        <input
                            ref={ref}
                            id={id}
                            name={name || id}
                            type="text"
                            value={displayValue}
                            className={inputClass}
                            disabled={disabled}
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

                {globalCtx.isDesktop ? (
                    isSelectorOpen && (
                        <PositionSelectorContent
                            initialPosition={selectedPosition ?? initialPosition}
                            onChange={confirmPosition}
                            close={closeSelector}
                            desktop
                        />
                    )
                ) : (
                    <PseudoView show={isSelectorOpen}>
                        <PositionSelectorContent
                            initialPosition={selectedPosition ?? initialPosition}
                            onChange={confirmPosition}
                            close={closeSelector}
                        />
                    </PseudoView>
                )}
            </div>
        );
    });

export default PositionSelector;
