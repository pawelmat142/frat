import React, { useEffect, useRef } from 'react';
import { SelectorItem, SelectorValue } from '../interface/controls.interface';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface BottomSheetProps<T extends SelectorValue = SelectorValue> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    items: SelectorItem<T>[];
    selectedValues?: T[];
    onSelect?: (item: SelectorItem<T>) => void;
    onSelectMulti?: (items: SelectorItem<T>[]) => void;
    multiSelect?: boolean;
    translateItems?: boolean
}

const BottomSheet = <T extends SelectorValue = SelectorValue>({
    isOpen,
    onClose,
    title,
    items,
    selectedValues = [],
    onSelect,
    onSelectMulti,
    multiSelect = false,
    translateItems = false
}: BottomSheetProps<T>) => {
    const { t } = useTranslation();
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

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
        onClose();
    };

    const isSelected = (value: T) => selectedValues.includes(value);

    if (!isOpen) return null;

    return (
        <div className="bottom-sheet-backdrop" onClick={handleBackdropClick}>
            <div 
                className={`bottom-sheet ${isOpen ? 'bottom-sheet-open' : ''}`}
            >
                <div className="bottom-sheet-header">
                    <div className="bottom-sheet-drag-handle" />
                    {title && <h3 className="bottom-sheet-title">{title}</h3>}
                    <button 
                        className="bottom-sheet-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>
                
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
            </div>
        </div>
    );
};

export default BottomSheet;
