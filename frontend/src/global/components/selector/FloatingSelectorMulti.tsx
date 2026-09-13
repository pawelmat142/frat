import { forwardRef } from 'react';
import React from 'react';
import { SelectorValue, SelectorMultiProps } from 'global/interface/controls.interface';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import SelectorTrigger from './SelectorTrigger';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import SelectorItems from './SelectorItems';
import { useAnchoredPopover } from 'global/hooks/useAnchoredPopover';

const FloatingSelectorMulti = forwardRef(<T extends SelectorValue = SelectorValue>(
    {
        items,
        values,
        chipValues,
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
    const { isDesktop } = useGlobalContext();
    const triggerRef = React.useRef<HTMLDivElement | null>(null);
    const { closePopover, isPopoverMounted, isPopoverOpen, togglePopover } = useAnchoredPopover(isDesktop, triggerRef);

    const hasValue = Array.isArray(values) && values.length > 0;
    const displayedChips = chipValues ?? values;

    const setRefs = React.useCallback((node: HTMLDivElement | null) => {
        triggerRef.current = node;
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
    }, [ref]);

    const handleOpen = () => {
        if (isDesktop) {
            togglePopover();
            return;
        }

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

    const desktopPopover = isDesktop && isPopoverMounted ? (
        <div className={`desktop-selector-popover${isPopoverOpen ? ' open' : ''}`} role="listbox" aria-label={label}>
            <SelectorItems
                items={items}
                selectedValues={values.map(value => value.value)}
                multiSelect
                enableSearchText={enableSearchText}
                onSelectMulti={selected => {
                    onSelect(selected as T[]);
                    closePopover();
                }}
                onClean={() => onSelect([])}
            />
        </div>
    ) : null;

    return (
        <SelectorTrigger
            ref={setRefs}
            id={id}
            label={label}
            fullWidth={fullWidth}
            disabled={disabled}
            required={required}
            center={center}
            className={`${className}${displayElementsAsChips ? ' multi-chip-selector' : ''}`}
            error={error}
            isActive={hasValue}
            isOpen={isDesktop ? isPopoverOpen : true}
            onClick={handleOpen}
            popover={desktopPopover}
        >
            <span className="dropdown-selected">
                {displayElementsAsChips ? (
                    <div className="chip-container">
                        {hasValue
                            ? displayedChips.map(v => (
                                <div key={String(v.value)} className="search-chip primary smaller">
                                    {v.label}
                                </div>
                            ))
                            : <div className="empty-chips" />}
                    </div>
                ) : (
                    hasValue
                        ? displayedChips.map(v => v.label).join(', ')
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
