import { BtnModes, FloatingInputModes, SelectorItem, SelectorValue } from "global/interface/controls.interface";
import { ReactNode, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";
import Button from "../controls/Button";
import FloatingInput from "../controls/FloatingInput";
import { Close, Search } from "@mui/icons-material";

interface Props<T extends SelectorValue = SelectorValue> {
    items: SelectorItem<T>[]
    onClose?: () => void;
    selectedValues?: T[];
    onSelect?: (item: T) => void;
    onSelectMulti?: (items: T[]) => void;
    multiSelect?: boolean;
    translateItems?: boolean
    enableSearchText?: boolean;
    onClean?: () => void;
    automatedMode?: boolean;
    renderAfterItem?: (item: SelectorItem<T>, isSelected: boolean) => ReactNode;
    emitAllSelectedValues?: boolean;
    initialSelectedItems?: SelectorItem<T>[];
}

const SelectorItems = <T extends SelectorValue = SelectorValue>({
    items,
    multiSelect = false,
    onSelect,
    onSelectMulti,
    selectedValues = [],
    translateItems = false,
    enableSearchText = false,
    onClose,
    onClean,
    automatedMode = false,
    renderAfterItem,
    emitAllSelectedValues = false,
    initialSelectedItems = [],
}: Props<T>) => {
    const { t } = useTranslation();

    const [localSelectedValues, setLocalSelectedValues] = useState<T[]>(selectedValues);
    const [searchText, setSearchText] = useState<string>('');

    useEffect(() => {
        setLocalSelectedValues(selectedValues);
    }, [selectedValues]);

    const handleItemClick = (item: SelectorItem<T>) => {
        if (multiSelect) {
            const newValues = [...localSelectedValues];
            const selected = newValues.includes(item.value);

            if (selected) {
                const index = newValues.indexOf(item.value);
                if (index > -1) {
                    newValues.splice(index, 1);
                }
            } else {
                newValues.push(item.value);
            }

            setLocalSelectedValues(newValues);
            if (automatedMode && onSelectMulti) {
                if (emitAllSelectedValues) {
                    onSelectMulti(newValues);
                } else {
                    const selectedItems = items.filter((listItem) => newValues.includes(listItem.value));
                    onSelectMulti(selectedItems.map((listItem) => listItem.value));
                }
            }
        } else {
            onSelect?.(item.value);
        }
    };

    const handleConfirm = () => {
        if (multiSelect && onSelectMulti) {
            if (emitAllSelectedValues) {
                onSelectMulti(localSelectedValues);
            } else {
                const selectedItems = items.filter((item) => localSelectedValues.includes(item.value));
                onSelectMulti(selectedItems.map((item) => item.value));
            }
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

    // If enableSearchText is false, use items in original order (already organized by parent)
    // If enableSearchText is true, can reorganize based on search
    const sortedItems = useMemo(() => {
        return items;
    }, [items]);

    return (
        <>
            {enableSearchText && (
                <div className="px-4 py-2">

                    <FloatingInput
                        mode={FloatingInputModes.THIN}
                        name="freeText"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        label={t("common.search")}
                        fullWidth
                        icon={ !!searchText ? <Close /> : <Search /> }
                        onIconClick={(e) => {
                            e.preventDefault();
                            setSearchText('');
                        }}
                    />
                </div>
            )}
            <div className="bottom-sheet-content">
                {/* Initially selected items - always shown at top, never reorganized */}
                {initialSelectedItems.map((item) => {
                    const translatedLabel = translateItems ? t(item.label) : item.label;
                    const displayLabel = translatedLabel.charAt(0).toUpperCase() + translatedLabel.slice(1);
                    const selected = isSelected(item.value);

                    return (
                        <div key={String(item.value)}>
                            <div
                                className={`bottom-sheet-item ripple${selected ? ' selected' : ''}`}
                                onClick={() => handleItemClick(item)}
                            >
                                {multiSelect && (
                                    <div className={`bottom-sheet-checkbox mr-3 ${selected ? 'checked' : ''}`}>
                                        {selected && <FaCheck size={14} />}
                                    </div>
                                )}
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
                            </div>
                            {renderAfterItem?.(item, selected)}
                        </div>
                    );
                })}

                {/* Other items */}
                {sortedItems.map((item) => {
                    const translatedLabel = translateItems ? t(item.label) : item.label;
                    const displayLabel = translatedLabel.charAt(0).toUpperCase() + translatedLabel.slice(1);
                    const last = item === sortedItems[sortedItems.length - 1];
                    const selected = isSelected(item.value);

                    return (
                        <div key={String(item.value)}>
                            <div
                                className={`bottom-sheet-item ripple${selected ? ' selected' : ''}${last ? ' last' : ''}`}
                                onClick={() => handleItemClick(item)}
                            >
                                {multiSelect && (
                                    <div className={`bottom-sheet-checkbox mr-3 ${selected ? 'checked' : ''}`}>
                                        {selected && <FaCheck size={14} />}
                                    </div>
                                )}
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
                            </div>
                            {renderAfterItem?.(item, selected)}
                        </div>
                    );
                })}
            </div>

            {!automatedMode && (
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
            )}
        </>
    );
}

export default SelectorItems;
