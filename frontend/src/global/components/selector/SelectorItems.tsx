import { BtnModes, SelectorItem, SelectorValue } from "global/interface/controls.interface";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";
import Button from "../controls/Button";

interface Props<T extends SelectorValue = SelectorValue> {
    items: SelectorItem<T>[]
    onClose?: () => void;
    selectedValues?: T[];
    onSelect?: (item: T) => void;
    onSelectMulti?: (items: T[]) => void;
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

    const [localSelectedValues, setLocalSelectedValues] = useState<T[]>(selectedValues);

    const handleItemClick = (item: SelectorItem<T>) => {
        if (multiSelect) {
            const newValues = [...localSelectedValues];
            const isSelected = newValues.includes(item.value);

            if (isSelected) {
                const index = newValues.indexOf(item.value);
                if (index > -1) {
                    newValues.splice(index, 1);
                }
            } else {
                newValues.push(item.value);
            }

            setLocalSelectedValues(newValues);
        } else {
            onSelect?.(item.value);
        }
    };

    const handleConfirm = () => {
        if (multiSelect && onSelectMulti) {
            const selectedItems = items.filter(item => localSelectedValues.includes(item.value));
            onSelectMulti(selectedItems.map(item => item.value));
        }
        onClose?.();
    };

    const handleClean = () => {
        if (onClean) {
            onClean();
        }
        onClose?.();
    }

    const isSelected = (value: T) => localSelectedValues.includes(value);

    return (
        <>
            <div className="bottom-sheet-content">
                {items.map((item, index) => {
                    const translatedLabel = translateItems ? t(item.label) : item.label
                    const displayLabel = translatedLabel.charAt(0).toUpperCase() + translatedLabel.slice(1);
                    return (
                        <div
                            key={index}
                            className={`bottom-sheet-item ripple${isSelected(item.value) ? ' selected' : ''}`}
                            onClick={() => handleItemClick(item)}
                        >
                            <div className="bottom-sheet-item-content">
                                {item.icon && (
                                    <span className="bottom-sheet-item-icon">{item.icon}</span>
                                )}
                                {item.src && (
                                    <img
                                        src={item.src}
                                        alt={displayLabel}
                                        className="bottom-sheet-item-image"
                                    />
                                )}
                                <span className="bottom-sheet-item-label">{displayLabel}</span>
                            </div>
                            {multiSelect && (
                                <div className={`bottom-sheet-checkbox ${isSelected(item.value) ? 'checked' : ''}`}>
                                    {isSelected(item.value) && <FaCheck size={14} />}
                                </div>
                            )}
                        </div>
                    )
                }

                )}

            </div>


            <div className="flex gap-2 bottom-sheet-footer py-3">

                {onClean && (
                    <Button onClick={handleClean} mode={BtnModes.ERROR_TXT} fullWidth={true}>
                        {t("common.reset")}
                    </Button>
                )}

                {multiSelect && (
                    <Button onClick={handleConfirm} mode={BtnModes.PRIMARY_TXT} fullWidth={true}>
                        {t("common.confirm")}
                    </Button>
                )}
            </div>
        </>
    )
}

export default SelectorItems;