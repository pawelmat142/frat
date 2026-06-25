import { BtnModes, FloatingInputModes, SelectorItem, SelectorValue } from "global/interface/controls.interface";
import { ReactNode, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaCheck } from "react-icons/fa";
import Button from "../controls/Button";
import FloatingInput from "../controls/FloatingInput";
import { Close, Search } from "@mui/icons-material";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props<T extends SelectorValue = SelectorValue> {
    items: SelectorItem<T>[];
    selectedValues?: T[];
    multiSelect?: boolean;
    translateItems?: boolean;
    enableSearchText?: boolean;
    /** Items pinned at the top of the list (shown before the main list, never re-sorted). */
    initialSelectedItems?: SelectorItem<T>[];
    /** Called after the "Confirm" button is pressed (multi-select non-automated mode). */
    onSelectMulti?: (items: T[]) => void;
    /** Called on every selection change immediately – skips the "Confirm" button.
     *  When provided, the component operates in "automated" mode. */
    onChangeImmediate?: (items: T[]) => void;
    /** Called for single-select mode. */
    onSelect?: (item: T) => void;
    /** Called when the "Reset" button is pressed. Also closes the sheet. */
    onClean?: () => void;
    /** Called to close the parent bottom sheet / popup. */
    onClose?: () => void;
    /** Render additional content after each item row. */
    renderAfterItem?: (item: SelectorItem<T>, isSelected: boolean) => ReactNode;
}

// ---------------------------------------------------------------------------
// SelectorItemRow – extracted to eliminate duplicate JSX
// ---------------------------------------------------------------------------

interface ItemRowProps<T extends SelectorValue> {
    item: SelectorItem<T>;
    selected: boolean;
    last: boolean;
    multiSelect: boolean;
    highlightLabel: (label: string) => ReactNode;
    onItemClick: (item: SelectorItem<T>) => void;
    renderAfterItem?: (item: SelectorItem<T>, isSelected: boolean) => ReactNode;
}

function SelectorItemRow<T extends SelectorValue>({
    item,
    selected,
    last,
    multiSelect,
    highlightLabel,
    onItemClick,
    renderAfterItem,
}: ItemRowProps<T>) {
    return (
        <div key={String(item.value)}>
            <div
                className={`bottom-sheet-item ripple${selected ? ' selected' : ''}${last ? ' last' : ''}`}
                onClick={() => onItemClick(item)}
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
                            alt={item.label}
                            className="bottom-sheet-item-image"
                        />
                    )}
                    <span className="bottom-sheet-item-label">
                        {highlightLabel(item.label)}
                    </span>
                </div>
            </div>
            {renderAfterItem?.(item, selected)}
        </div>
    );
}

// ---------------------------------------------------------------------------
// SelectorItems
// ---------------------------------------------------------------------------

const SelectorItems = <T extends SelectorValue = SelectorValue>({
    items,
    multiSelect = false,
    onSelect,
    onSelectMulti,
    onChangeImmediate,
    selectedValues = [],
    translateItems = false,
    enableSearchText = false,
    onClose,
    onClean,
    renderAfterItem,
    initialSelectedItems = [],
}: Props<T>) => {
    const { t } = useTranslation();

    const [localSelectedValues, setLocalSelectedValues] = useState<T[]>(selectedValues);
    const [searchText, setSearchText] = useState<string>('');

    // Keep local state in sync when external selection changes (e.g. parent re-render).
    useEffect(() => {
        setLocalSelectedValues(selectedValues);
    }, [selectedValues]);

    // ----- helpers ----------------------------------------------------------

    const getDisplayLabel = (item: SelectorItem<T>): string => {
        const raw = translateItems ? t(item.label) : item.label;
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    };

    const normalizedSearch = searchText.trim().toLowerCase();

    const highlightLabel = (label: string): ReactNode => {
        if (!enableSearchText || !normalizedSearch) return label;

        const escaped = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return label.split(regex).map((part, i) =>
            part.toLowerCase() === normalizedSearch
                ? <span className="highlight font-bold" key={i}>{part}</span>
                : part
        );
    };

    // Fixed: all dependencies included so the list stays up-to-date.
    const filteredItems = useMemo(() => {
        if (!enableSearchText || !normalizedSearch) return items;
        return items.filter(item => {
            const label = translateItems ? t(item.label) : item.label;
            return label.toLowerCase().includes(normalizedSearch);
        });
    }, [items, normalizedSearch, translateItems, t]);

    const isSelected = (value: T) => localSelectedValues.includes(value);

    // ----- interaction ------------------------------------------------------

    const handleItemClick = (item: SelectorItem<T>) => {
        if (!multiSelect) {
            onSelect?.(item.value);
            return;
        }

        let newValues = [...localSelectedValues];
        const alreadySelected = newValues.includes(item.value);

        if (alreadySelected) {
            newValues = newValues.filter(v => v !== item.value);
        } else if (item.exclusionCode) {
            // Remove mutually-exclusive siblings, then add the clicked item.
            const siblings = items
                .filter(i => i.exclusionCode === item.exclusionCode && i.value !== item.value)
                .map(i => i.value);
            newValues = [...newValues.filter(v => !siblings.includes(v)), item.value];
        } else {
            newValues = [...newValues, item.value];
        }

        setLocalSelectedValues(newValues);
        onChangeImmediate?.(newValues);
    };

    const handleConfirm = () => {
        onSelectMulti?.(localSelectedValues);
        onClose?.();
    };

    const handleClean = () => {
        onClean?.();
        onClose?.();
    };

    // Whether the "Confirm" / "Reset" footer should be visible.
    const isAutomated = !!onChangeImmediate;

    // ----- render -----------------------------------------------------------

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
                        icon={!!searchText ? <Close /> : <Search />}
                        onIconClick={e => {
                            e.preventDefault();
                            setSearchText('');
                        }}
                    />
                </div>
            )}

            <div className="bottom-sheet-content">
                {/* Pinned items – always at the top, never re-sorted */}
                {initialSelectedItems.map(item => (
                    <SelectorItemRow
                        key={String(item.value)}
                        item={{ ...item, label: getDisplayLabel(item) }}
                        selected={isSelected(item.value)}
                        last={false}
                        multiSelect={multiSelect}
                        highlightLabel={highlightLabel}
                        onItemClick={handleItemClick}
                        renderAfterItem={renderAfterItem}
                    />
                ))}

                {/* Main list */}
                {filteredItems.map((item, index) => (
                    <SelectorItemRow
                        key={String(item.value)}
                        item={{ ...item, label: getDisplayLabel(item) }}
                        selected={isSelected(item.value)}
                        last={index === filteredItems.length - 1}
                        multiSelect={multiSelect}
                        highlightLabel={highlightLabel}
                        onItemClick={handleItemClick}
                        renderAfterItem={renderAfterItem}
                    />
                ))}
            </div>

            {!isAutomated && (
                <div className="flex gap-2 bottom-sheet-footer py-3">
                    {onClean && (
                        <Button onClick={handleClean} mode={BtnModes.ERROR_TXT} fullWidth>
                            {t("common.reset")}
                        </Button>
                    )}
                    {multiSelect && (
                        <Button onClick={handleConfirm} mode={BtnModes.PRIMARY_TXT} fullWidth>
                            {t("common.confirm")}
                        </Button>
                    )}
                </div>
            )}
        </>
    );
};

export default SelectorItems;
