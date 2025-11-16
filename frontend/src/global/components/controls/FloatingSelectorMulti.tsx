import { useState, useRef, useEffect } from 'react';
import ArrowIcon from './ArrowIcon';
import FloatingLabel from './FloatingLabel';
import { useTranslation } from 'react-i18next';
import { SelectorValue, SelectorMultiProps, SelectorItem } from 'global/interface/controls.interface';
import FormError from './FormError';
import Checkbox from './Checkbox';
import { Utils } from 'global/utils';
import Input from './Input';

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
    enableSearchText = true,
    displayElementsAsChips = false,
}: SelectorMultiProps<T>) {

    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
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

    const { t } = useTranslation();

    const hasValue = () => {
        return Array.isArray(values) && values.length > 0;
    };

    const isLabelFloating = isFocused || hasValue();

    // Calculate if dropdown should open upward
    useEffect(() => {
        if (!open || !dropdownRef.current || !listRef.current) return;

        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const listHeight = listRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - dropdownRect.bottom;
        const spaceAbove = dropdownRect.top;

        setOpenUpward(spaceBelow < listHeight && spaceAbove > spaceBelow);
    }, [open]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (open && enableSearchText && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open, enableSearchText]);

    // Reset search text when dropdown closes
    useEffect(() => {
        if (!open) {
            setSearchText('');
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            setTimeout(() => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setOpen(false);
                    setIsFocused(false);
                }
            });
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleSelect = (item: SelectorItem<T>) => {
        if (disabled) return;
        const currentValues = values ?? [];
        const exists = currentValues.some((v: SelectorItem<T>) => String(v.value) === String(item.value));
        let newValues: SelectorItem<T>[];
        if (exists) {
            newValues = removeItem(item);
        } else {
            newValues = [...currentValues, item];
        }
        onSelect(newValues);
    };

    const removeItem = (item: SelectorItem<T>): SelectorItem<T>[] => {
        if (disabled) return [];
        const currentValues = values ?? [];
        return currentValues.filter((v: SelectorItem<T>) => String(v.value) !== String(item.value));
    };

    const isActive = (item: SelectorItem<T>) => {
        return (values ?? []).some((v: SelectorItem<T>) => String(v.value) === String(item.value));
    };

    // Filter items based on search text, ignoring diacritics
    const filteredItems = enableSearchText
        ? items.filter(i => Utils.normalize(i.label).includes(Utils.normalize(searchText)))
        : items;

    return (
        <div
            className={`floating-input-wrapper ${className || ''}${center ? ' mx-auto' : ''}`}
            style={{ position: 'relative' }}
            ref={dropdownRef}
        >
            <div className="floating-input-container">
                <div
                    className={myClass}
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    aria-expanded={open}
                    onClick={() => {
                        if (disabled) return;
                        if (!open) {
                            setOpen(true);
                            setIsFocused(true);
                        }
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
                            setIsFocused(false);
                        }
                    }}
                    onKeyDown={e => {
                        if (disabled) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                            if (!open) setOpen(true);
                        }
                        if (e.key === 'Escape') {
                            setOpen(false);
                            setIsFocused(false);
                        }
                    }}
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
                                    : <span className="opacity-0">placeholder</span>}
                            </div>
                        ) : (
                            Array.isArray(values) && values.length > 0
                                ? values.map(v => v.label).join(', ')
                                : <span className="opacity-0">placeholder</span>
                        )}
                    </span>
                    
                    <ArrowIcon open={open} />
                    
                    {open && (
                        <ul
                            ref={listRef}
                            className={`pp-dropdown-list${openUpward ? ' pp-dropdown-upward' : ''}`}
                        >
                            {enableSearchText && (
                                <li className="dropdown-item" style={{ padding: '8px', background: 'var(--bg-secondary)' }}>
                                    <Input
                                        ref={searchInputRef}
                                        type="text"
                                        fullWidth={true}
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        id="search-input"
                                        name="search-input"
                                    />
                                </li>
                            )}
                            {filteredItems.length === 0 ? (
                                <li className="dropdown-item disabled" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                    No results found
                                </li>
                            ) : (
                                filteredItems.map(item => (
                                    <li
                                        key={String(item.value)}
                                        className={`dropdown-item${isActive(item) ? ' active' : ''}`}
                                        onClick={() => handleSelect(item)}
                                        tabIndex={0}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') handleSelect(item);
                                        }}
                                    >
                                        <span className='flex items-center'>
                                            <Checkbox
                                                checked={isActive(item)}
                                                onChange={() => handleSelect(item)}
                                                disabled={disabled}
                                            />
                                            {item.src && <img className="pp-dropdown-icon pl-4" src={item.src} alt={item.label} />}
                                            <span className='pl-2'>{item.label}</span>
                                        </span>
                                    </li>
                                ))
                            )}
                            <li
                                className="dropdown-item dropdown-item-additional"
                                tabIndex={0}
                            >
                                <button
                                    type="button"
                                    className="pp-btn px-3 py-1"
                                    onClick={() => {
                                        setOpen(false);
                                        setIsFocused(false);
                                    }}
                                    tabIndex={0}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            setOpen(false);
                                            setIsFocused(false);
                                        }
                                    }}
                                >
                                    {t('common.close')}
                                </button>
                                <button
                                    type="button"
                                    className="pp-btn px-3 py-1"
                                    onClick={() => onSelect([])}
                                    tabIndex={0}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') onSelect([]);
                                    }}
                                >
                                    {t('common.clear')}
                                </button>
                            </li>
                        </ul>
                    )}
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
