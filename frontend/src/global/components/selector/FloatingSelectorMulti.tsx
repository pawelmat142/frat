import { SelectorValue, SelectorMultiProps, SelectorItem } from 'global/interface/controls.interface';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import ArrowIcon from '../controls/ArrowIcon';
import FloatingLabel from '../controls/FloatingLabel';
import FormError from '../controls/FormError';
import { AppConfig } from '@shared/AppConfig';

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

    const bottomSheet = useBottomSheet();
    
    let myClass = `pp-control min-height pp-dropdown floating-input`;
    if (fullWidth) {
        myClass += ' w-full';
    } else {
        myClass += ' w-fit';
    }
    if (disabled) {
        myClass += ' opacity-20';
    }
    if (error) {
        myClass += ' pp-control-error';
    }

    const hasValue = () => {
        return Array.isArray(values) && values.length > 0;
    };

    const isLabelFloating = hasValue();

    const handleOpen = () => {
        bottomSheet.openSelector({
            items: items,
            selectedValues: values ? values.map(v => v.value) : [],
            title: label || '',
            multiSelect: true,
            onSelectMulti: (items) => {
                onSelect(items);
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
                    onClick={() => {
                        if (disabled) return;
                        handleOpen();
                    }}
                >
                    <span className="dropdown-selected">
                            {displayElementsAsChips ? (
                                <div className="chip-container">
                                    {Array.isArray(values) && values.length > 0
                                        ? values.map(v => (
                                            <div key={String(v.value)} className="search-chip primary">
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
                            <ArrowIcon open={true} />
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
