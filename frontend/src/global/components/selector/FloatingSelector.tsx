import { forwardRef } from 'react';
import ArrowIcon from '../controls/ArrowIcon';
import FloatingLabel from '../controls/FloatingLabel';
import { SelectorValue, SelectorInterface, SelectorItem } from 'global/interface/controls.interface';
import FormError from '../controls/FormError';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';

const FloatingSelector = forwardRef(<T extends SelectorValue = SelectorValue>(
    {
        items,
        value,
        onSelect: onSingleSelect,
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

    if (!onSingleSelect) {
        throw new Error("onSingleSelect prop is required for single-select dropdowns");
    }

    const bottomSheet = useBottomSheet();

    let myClass = `pp-control min-height pp-dropdown floating-input`;
    if (fullWidth) {
        myClass += ' w-full';
    } else {
        myClass += ' w-fit';
    }
    if (disabled) {
        myClass += ' opacity-50 pointer-events-none cursor-not-allowed';
    }
    if (error) {
        myClass += ' pp-control-error';
    }

    const hasValue = () => {
        return !!value?.value;
    };
    const isLabelFloating = hasValue();
    
    const handleSelect = (itemValue: T) => {
        if (disabled) return;
        if (itemValue === value?.value) {
            if (!required) {
                onSingleSelect(null);
            }
        } else {
            onSingleSelect(itemValue);
        }
    };

    const handleOpen = () => {
        openSelectorList();
    }

    const openSelectorList = () => {
        bottomSheet.openSelector({
            items: items,
            selectedValues: value ? [value.value] : [],
            title: label || '',
            onSelect: (item) => {
                handleSelect(item as T);
            },
            onClean: () => {
                onSingleSelect(null);
            },
        })
    }

    return (
        <div
            className={`floating-input-wrapper ${className || ''}${center ? ' mx-auto' : ''}`}
            style={{ position: 'relative' }}
        >
            <div className="floating-input-container">
                <div
                    className={myClass}
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    onClick={() => {
                        if (!disabled) {
                            handleOpen();
                        }
                    }}
                >

                         <span className="dropdown-selected flex items-center gap-2">
                            {value?.src && <span><img className="pp-dropdown-icon" src={value?.src} alt={value?.label} /></span>}
                            {value?.label || <span className="opacity-0">placeholder</span>}
                        </span>
                    <ArrowIcon open={true} />

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

FloatingSelector.displayName = 'FloatingSelector';

export default FloatingSelector;
