import { forwardRef } from 'react';
import React from 'react';
import { SelectorValue, SelectorMultiProps } from 'global/interface/controls.interface';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import SelectorTrigger from './SelectorTrigger';

const FloatingSelectorMulti = forwardRef(<T extends SelectorValue = SelectorValue>(
    {
        items,
        values,
        onSelect,
        id,
        label,
        fullWidth = false,
        disabled = false,
        required = false,
        center = false,
        className = '',
        error,
        displayElementsAsChips = false,
        enableSearchText = false,
    }: SelectorMultiProps<T>,
    ref: React.Ref<HTMLDivElement>
) => {
    const bottomSheet = useBottomSheet();

    const hasValue = Array.isArray(values) && values.length > 0;

    const handleOpen = () => {
        bottomSheet.openSelector({
            items,
            selectedValues: values.map(v => v.value),
            title: label ?? '',
            multiSelect: true,
            enableSearchText,
            onSelectMulti: (selected) => onSelect(selected as T[]),
            onClean: () => onSelect([]),
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
            isActive={hasValue}
            onClick={handleOpen}
        >
            <span className="dropdown-selected">
                {displayElementsAsChips ? (
                    <div className="chip-container">
                        {hasValue
                            ? values.map(v => (
                                <div key={String(v.value)} className="search-chip primary">
                                    {v.label}
                                </div>
                            ))
                            : <div className="empty-chips" />}
                    </div>
                ) : (
                    hasValue
                        ? values.map(v => v.label).join(', ')
                        : <span className="opacity-0">placeholder</span>
                )}
            </span>
        </SelectorTrigger>
    );
});

FloatingSelectorMulti.displayName = 'FloatingSelectorMulti';

// Cast preserves the generic type parameter T and exposes `ref` in JSX,
// which plain `forwardRef` inference loses for generic components.
export default FloatingSelectorMulti as <T extends SelectorValue = SelectorValue>(
    props: SelectorMultiProps<T> & React.RefAttributes<HTMLDivElement>
) => React.ReactElement | null;
