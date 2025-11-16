import { SelectorItem, SelectorValue } from "global/interface/controls.interface";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";

interface Props<T extends SelectorValue = SelectorValue> {
    items: SelectorItem<T>[]
    onClose?: () => void;
    selectedValues?: T[];
    onSelect?: (item: SelectorItem<T>) => void;
    onSelectMulti?: (items: SelectorItem<T>[]) => void;
    multiSelect?: boolean;
    translateItems?: boolean
    onClean?: () => void;
}

const SelectorItems = <T extends SelectorValue = SelectorValue>({
    items,
    multiSelect = false,
    onSelect,
    onSelectMulti,
    selectedValues = [],
    translateItems = false,
    onClose,
    onClean
}: Props<T>) => {

    const { t } = useTranslation();

    // TODO multi select mode
    const handleItemClick = (item: SelectorItem<T>) => {
        if (multiSelect) {
            // const isSelected = localSelectedValues.includes(item.value);
            // const newSelected = isSelected
            //     ? localSelectedValues.filter(v => v !== item.value)
            //     : [...localSelectedValues, item.value];
            // setLocalSelectedValues(newSelected);
        } else {
            onSelect?.(item);
        }
    };

    const handleConfirm = () => {
        if (multiSelect && onSelectMulti) {
            const selectedItems = items.filter(item => null
                // localSelectedValues.includes(item.value)
            );
            onSelectMulti(selectedItems);
        }
        onClose?.();
    };

    const isSelected = (value: T) => selectedValues.includes(value);


    return (
        <>
            <div className="bottom-sheet-content">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={`bottom-sheet-item ${isSelected(item.value) ? 'selected' : ''}`}
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="bottom-sheet-item-content">
                            {item.icon && (
                                <span className="bottom-sheet-item-icon">{item.icon}</span>
                            )}
                            {item.src && (
                                <img
                                    src={item.src}
                                    alt={translateItems ? t(item.label) : item.label}
                                    className="bottom-sheet-item-image"
                                />
                            )}
                            <span className="bottom-sheet-item-label">{translateItems ? t(item.label) : item.label}</span>
                        </div>
                        {multiSelect && (
                            <div className={`bottom-sheet-checkbox ${isSelected(item.value) ? 'checked' : ''}`}>
                                {isSelected(item.value) && <FaCheck size={14} />}
                            </div>
                        )}
                    </div>
                ))}
                
            </div>

            {onClean && (
                <div
                    className="bottom-sheet-item"
                    onClick={() => {
                        onClean();
                    }}
                >
                    <div className="bottom-sheet-item-content w-full mx-auto flex justify-center">
                        <div>
                            {t("common.cancel")}
                        </div>
                    </div>
                </div>
            )}

            {multiSelect && (
                <div className="bottom-sheet-footer">
                    <button
                        className="bottom-sheet-confirm-btn"
                        onClick={handleConfirm}
                    >
                        Potwierdź
                    </button>
                </div>
            )}
        </>
    )
}

export default SelectorItems;