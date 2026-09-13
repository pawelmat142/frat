import { forwardRef } from 'react';
import React from 'react';
import { SelectorValue, SelectorInterface } from 'global/interface/controls.interface';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import SelectorTrigger from './SelectorTrigger';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import SelectorItems from './SelectorItems';
import { useAnchoredPopover } from 'global/hooks/useAnchoredPopover';

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
    const { isDesktop } = useGlobalContext();
    const triggerRef = React.useRef<HTMLDivElement | null>(null);
    const { closePopover, isPopoverMounted, isPopoverOpen, popoverPlacement, togglePopover } = useAnchoredPopover(isDesktop, triggerRef);

    const setRefs = React.useCallback((node: HTMLDivElement | null) => {
        triggerRef.current = node;
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
    }, [ref]);

    const selectItem = (itemValue: T) => {
        if (itemValue === value?.value) {
            if (!required) onSelect(null);
        } else {
            onSelect(itemValue);
        }
    };

    const handleOpen = () => {
        if (isDesktop) {
            togglePopover();
            return;
        }

        bottomSheet.openSelector({
            items,
            selectedValues: value ? [value.value] : [],
            title: label ?? '',
            enableSearchText,
            onSelect: (item) => {
                selectItem(item as T);
            },
            onClean: () => onSelect(null),
        });
    };

    const desktopPopover = isDesktop && isPopoverMounted ? (
        <div className={`desktop-selector-popover${isPopoverOpen ? ' open' : ''}${popoverPlacement === 'top' ? ' upward' : ''}`} role="listbox" aria-label={label}>
            <SelectorItems
                items={items}
                selectedValues={value ? [value.value] : []}
                hideLastItemBorder
                onSelect={item => {
                    selectItem(item as T);
                    closePopover();
                }}
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
            className={className}
            error={error}
            isActive={!!value?.value}
            isOpen={isDesktop ? isPopoverOpen : true}
            onClick={handleOpen}
            popover={desktopPopover}
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
