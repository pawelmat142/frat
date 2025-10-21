import React, { useState, useRef, useEffect } from 'react';
import ControlLabel from './ControlLabel';
import ArrowIcon from './ArrowIcon';
import { useTranslation } from 'react-i18next';
import { SelectorValue, SelectorMultiProps, SelectorItem } from 'global/interface/controls.interface';
import FormError from './FormError';
import Checkbox from './Checkbox';

const SelectorMulti = <T extends SelectorValue = SelectorValue>({
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
    error
}: SelectorMultiProps<T>) => {

    const [open, setOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    let myClass = `pp-control pp-dropdown${fullWidth ? ' w-full' : ' w-fit'}${disabled ? ' opacity-50 pointer-events-none cursor-not-allowed' : ''}`;

    if (error) {
        myClass += ' pp-control-error';
    }

    const { t } = useTranslation()

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
    }, [open])

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
        const currentValues = values ?? [];
        const exists = currentValues.some((v: SelectorItem<T>) => String(v.value) === String(item.value));
        let newValues: SelectorItem<T>[];
        if (exists) {
            newValues = currentValues.filter((v: SelectorItem<T>) => String(v.value) !== String(item.value));
        } else {
            newValues = [...currentValues, item];
        }
        onSelect(newValues);
    };

    const isActive = (item: SelectorItem<T>) => {
        return (values ?? []).some((v: SelectorItem<T>) => String(v.value) === String(item.value));
    };

    return (
        <div
            className={`${className || ''}${center ? ' mx-auto' : ''}`}
            style={{ position: 'relative' }}
            ref={dropdownRef}
        >
            <ControlLabel id={id} label={label} required={required} />

            <div
                className={myClass}
                tabIndex={disabled ? -1 : 0}
                aria-disabled={disabled}
                aria-expanded={open}
                onClick={() => {
                    if (disabled) return;
                    if (!open) setOpen(true);
                }}
                onKeyDown={e => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        if (!open) setOpen(true);
                    }
                    if (e.key === 'Escape') setOpen(false);
                }}
            >
                <span className="dropdown-selected">
                    {Array.isArray(values) && values.length > 0
                        ? values.map(v => v.label).join(', ')
                        : <span className="secondary-text">select...</span>}
                </span>
                <ArrowIcon open={open} />
                {open && (
                    <ul 
                        ref={listRef}
                        className={`pp-dropdown-list${openUpward ? ' pp-dropdown-upward' : ''}`}
                    >
                        {items.map(item => (
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
                        ))}
                        <li
                            className="dropdown-item dropdown-close"
                            onClick={() => setOpen(false)}
                            tabIndex={0}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') setOpen(false);
                            }}
                        >
                            <span>
                                {t('common.close')}
                            </span>
                        </li>
                    </ul>
                )}
            </div>

            <FormError error={error}></FormError>
            
        </div>
    );
};

export default SelectorMulti;
