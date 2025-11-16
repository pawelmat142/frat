import { forwardRef } from 'react';
import { InputInterface } from '../../../interface/controls.interface';
import { Position } from '@shared/interfaces/EmployeeProfileI';
import { PositionSelectorProvider } from 'global/components/selector/position/PositionSelectorProvider';
import PositionSelectorControl from './PositionSelectorControl';

interface PositionSelectorProps extends Omit<InputInterface, 'type' | 'value' | 'onChange'> {
    value?: Position | null;
    onChange?: (position: Position | null) => void;
    initializePositionByCountryCode?: string;
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
        initializePositionByCountryCode
    }, ref) => {

        return (
            <PositionSelectorProvider>
                <PositionSelectorControl
                    label={label}
                    fullWidth={fullWidth}
                    className={className}
                    disabled={disabled}
                    value={value}
                    id={id}
                    required={required}
                    name={name}
                    center={center}
                    onChange={onChange}
                    error={error}
                    initializePositionByCountryCode={initializePositionByCountryCode}
                    ref={ref}
                />
            </PositionSelectorProvider>
        );
    });

PositionSelector.displayName = 'PositionSelector';

export default PositionSelector;
