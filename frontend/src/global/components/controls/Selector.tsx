
import { useState, useRef, useEffect, forwardRef } from 'react';
import ControlLabel from './ControlLabel';
import ArrowIcon from './ArrowIcon';
import { SelectorValue, SelectorInterface, SelectorItem } from 'global/interface/controls.interface';
import FormError from './FormError';
import { Utils } from 'global/utils';

const Selector = forwardRef(<T extends SelectorValue = SelectorValue>(
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
        showLabel
    }: SelectorInterface<T>,
    ref: React.Ref<HTMLDivElement>
) => {

    if (!onSingleSelect) {
        throw new Error("onSingleSelect prop is required for single-select dropdowns");
    }

    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [searchText, setSearchText] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    let myClass = `pp-control pp-dropdown${fullWidth ? ' w-full' : ' w-fit'}${disabled ? ' opacity-50 pointer-events-none cursor-not-allowed' : ''}`;
    if (error) {
        myClass += ' pp-control-error';
    }

    // Calculate if dropdown should open upward
    useEffect(() => {
        if (!open || !dropdownRef.current || !listRef.current) return;

        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const listHeight = listRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - dropdownRect.bottom;
        const spaceAbove = dropdownRect.top;

        // Open upward if not enough space below and more space above
        setOpenUpward(spaceBelow < listHeight && spaceAbove > spaceBelow);
    }, [open]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
            // Set cursor at the end
            const length = searchInputRef.current.value.length;
            searchInputRef.current.setSelectionRange(length, length);
        }
    }, [open]);

    // Initialize search text with selected value label when opening
    useEffect(() => {
        if (open) {
            setSearchText(value?.label || '');
        }
    }, [open, value?.label]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            setTimeout(() => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setOpen(false);
                }
            });
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleSelect = (item: SelectorItem<T>) => {
        if (disabled) return;
        if (item?.value === value?.value) {
            if (!required) {
                setOpen(false);
                setSearchText('');
                onSingleSelect(null);
            }
        } else {
            setOpen(false);
            setSearchText('');
            onSingleSelect(item);
        }
    };

    const isActive = (item: SelectorItem<T>) => {
        return String(item.value) === String(value?.value);
    };

    // Filter items based on search text, ignoring diacritics
    const filteredItems = enableSearchText
        ? items.filter(item => Utils.normalize(item.label).includes(Utils.normalize(searchText)))
        : items;

    return (
        <div
            className={`${className || ''}${center ? ' mx-auto' : ''}`}
            style={{ position: 'relative' }}
            ref={ref || dropdownRef}
        >

            {showLabel && (
                <ControlLabel id={id} label={label} required={required} />
            )}

            <div
                className={myClass}
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-expanded={open}
                onClick={() => !disabled && setOpen(!open)}
                onKeyDown={e => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') setOpen(!open);
                    if (e.key === 'Escape') setOpen(false);
                }}
            >
                {!open ? (
                    <span className="dropdown-selected flex items-center gap-2">
                        {value?.src && <span><img className="pp-dropdown-icon" src={value?.src} alt={value?.label} /></span>}
                        {value?.label || <span className="secondary-text">{label}</span>}
                    </span>
                ) : (
                    enableSearchText ? (
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="w-full bg-transparent outline-none"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setOpen(false);
                                    setSearchText('');
                                }
                                e.stopPropagation();
                            }}
                            placeholder={showLabel ? undefined : label}
                        />
                    ) : (
                        <span className="dropdown-selected flex items-center gap-2">
                            {value?.src && <span><img className="pp-dropdown-icon" src={value?.src} alt={value?.label} /></span>}
                            {value?.label || <span className="secondary-text">{label}</span>}
                        </span>
                    )
                )}

                <ArrowIcon open={open} />

                {open && (
                    <ul
                        ref={listRef}
                        className={`pp-dropdown-list${openUpward ? ' pp-dropdown-upward' : ''}`}
                    >
                        {filteredItems.length === 0 ? (
                            <li className="dropdown-item disabled" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                                No results found
                            </li>
                        ) : (
                            (filteredItems as Array<SelectorItem<T> & { disabled?: boolean }>).map(item => (
                                <li
                                    key={String(item.value)}
                                    className={`dropdown-item${isActive(item) ? ' active' : ''}${item.disabled ? ' disabled' : ''}`}
                                    onClick={() => !item.disabled && handleSelect(item)}
                                    tabIndex={item.disabled ? -1 : 0}
                                    aria-disabled={item.disabled}
                                    onKeyDown={e => {
                                        if (!item.disabled && (e.key === 'Enter' || e.key === ' ')) handleSelect(item);
                                    }}
                                    style={item.disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                                >
                                    <span className='flex items-center gap-2'>
                                        {item.src && <img className="pp-dropdown-icon" src={item.src} alt={item.label} />}
                                        <span>{item.label}</span>
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>

            <FormError error={error}></FormError>
        </div>
    );
});

Selector.displayName = 'Selector';

export default Selector;
