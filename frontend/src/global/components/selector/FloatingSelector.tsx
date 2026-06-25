import { forwardRef } from 'react';
import React from 'react';
import { SelectorValue, SelectorInterface } from 'global/interface/controls.interface';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import SelectorTrigger from './SelectorTrigger';

const FloatingSelector = forwardRef(<T extends SelectorValue = SelectorValue>(
    {
        items,
        value,
        onSelect,
        id,
        label,
        fullWidth = false,
        disabled = false,
        required = false,
        center = false,
        className = '',
        error,
        enableSearchText = true,
    }: SelectorInterface<T>,
    ref: React.Ref<HTMLDivElement>
) => {
    const bottomSheet = useBottomSheet();

    const handleOpen = () => {
        bottomSheet.openSelector({
            items,
            selectedValues: value ? [value.value] : [],
            title: label ?? '',
            enableSearchText,
            onSelect: (item) => {
                const itemValue = item as T;
                // Clicking the already-selected item deselects it (unless required).
                if (itemValue === value?.value) {
                    if (!required) onSelect(null);
                } else {
                    onSelect(itemValue);
                }
            },
            onClean: () => onSelect(null),
        });
    };

    return (
        <SelectorTrigger
            ref={ref}
            id={id}
            label={label}
            fullWidth={fullWidth}
            disabled={disabled}
            required={required}
            center={center}
            className={className}
            error={error}
            isActive={!!value?.value}
            onClick={handleOpen}
        >
            <span className="dropdown-selected flex items-center gap-2">
                {value?.src && (
                    <span>
                        <img className="pp-dropdown-icon" src={value.src} alt={value.label} />
                    </span>
                )}
                {value?.label || <span className="opacity-0">placeholder</span>}
            </span>
        </SelectorTrigger>
    );
});

FloatingSelector.displayName = 'FloatingSelector';

// Cast preserves the generic type parameter T and exposes `ref` in JSX,
// which plain `forwardRef` inference loses for generic components.
export default FloatingSelector as <T extends SelectorValue = SelectorValue>(
    props: SelectorInterface<T> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement | null;
