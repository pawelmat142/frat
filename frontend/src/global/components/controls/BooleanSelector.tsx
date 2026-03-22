import React from 'react';
import FloatingSelector from '../selector/FloatingSelector';
import { SelectorItem } from 'global/interface/controls.interface';

const TRUE_VALUE = 'true';
const FALSE_VALUE = 'false';

interface BooleanSelectorProps {
    value: boolean | null | undefined;
    onChange: (value: boolean | null) => void;
    label?: string;
    labelTrue?: string;
    labelFalse?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    error?: { message?: string };
}

const BooleanSelector: React.FC<BooleanSelectorProps> = ({
    value,
    onChange,
    label,
    labelTrue = 'Yes',
    labelFalse = 'No',
    required,
    disabled,
    className,
    error,
}) => {
    const items: SelectorItem<string>[] = [
        { label: labelTrue, value: TRUE_VALUE },
        { label: labelFalse, value: FALSE_VALUE },
    ];

    const selectedItem = value === true
        ? items[0]
        : value === false
            ? items[1]
            : null;

    const handleSelect = (itemValue: string | number | Date | null) => {
        if (itemValue === TRUE_VALUE) onChange(true);
        else if (itemValue === FALSE_VALUE) onChange(false);
        else onChange(null);
    };

    return (
        <FloatingSelector
            items={items}
            value={selectedItem}
            onSelect={handleSelect}
            label={label}
            required={required}
            disabled={disabled}
            className={className}
            error={error}
            enableSearchText={false}
            fullWidth
        />
    );
};

export default BooleanSelector;
