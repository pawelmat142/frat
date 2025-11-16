import { useState, useRef } from 'react';
import FloatingLabel from './FloatingLabel';
import { SelectorValue, SelectorMultiProps, SelectorItem } from 'global/interface/controls.interface';
import FormError from './FormError';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';

function FloatingSelectorMulti<T extends SelectorValue = SelectorValue>({
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
}: SelectorMultiProps<T>) {

    const [isFocused, setIsFocused] = useState(false);
    const bottomSheet = useBottomSheet();
    
    let myClass = `pp-control pp-dropdown floating-input`;
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
        return Array.isArray(values) && values.length > 0;
    };

    const isLabelFloating = isFocused || hasValue();

    const handleOpen = () => {
        bottomSheet.openSelector({
            items: items,
            selectedValues: values ? values.map(v => v.value) : [],
            title: label || '',
            multiSelect: true,
            onSelectMulti: (items) => {
                onSelect(items as SelectorItem<T>[]);
            },
            onClean() {
                onSelect([]);
            },
        });
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
                    aria-expanded={isFocused}
                    onClick={() => {
                        if (disabled) return;
                        handleOpen();
                    }}
                    onFocus={() => setIsFocused(true)}
                >
                    <span className="dropdown-selected">
                        {displayElementsAsChips ? (
                            <div className="chip-container">
                                {Array.isArray(values) && values.length > 0
                                    ? values.map(v => (
                                        <div key={String(v.value)} className="chip">
                                            {v.label}
                                        </div>
                                    ))
                                    : <div className='empty-chips'></div>}
                            </div>
                        ) : (
                            Array.isArray(values) && values.length > 0
                                ? values.map(v => v.label).join(', ')
                                : <span className="opacity-0">placeholder</span>
                        )}
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
}

export default FloatingSelectorMulti;
