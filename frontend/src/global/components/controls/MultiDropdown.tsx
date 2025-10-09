import React, { useState, useRef, useEffect } from 'react';
import { DropdownItem, DropdownValue, MultiDropdownProps } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
import ArrowIcon from './ArrowIcon';
import { useTranslation } from 'react-i18next';

const MultiDropdown = <T extends DropdownValue = DropdownValue>({
    items,
    values,
    onSelect,
    id,
    label,
    fullWidth = false,
    disabled = false,
    required = false,
    center = false,
    className = ''
}: MultiDropdownProps<T>) => {

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const myClass = `pp-control pp-dropdown${fullWidth ? ' w-full' : ' w-fit'}${disabled ? ' opacity-50 pointer-events-none cursor-not-allowed' : ''}`;

    const { t } = useTranslation()
    
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

    const handleSelect = (item: DropdownItem<T>) => {
        if (disabled) return;
        const currentValues = values ?? [];
        const exists = currentValues.some((v: DropdownItem<T>) => String(v.value) === String(item.value));
        let newValues: DropdownItem<T>[];
        if (exists) {
            newValues = currentValues.filter((v: DropdownItem<T>) => String(v.value) !== String(item.value));
        } else {
            newValues = [...currentValues, item];
        }
        onSelect(newValues);
    };

    const isActive = (item: DropdownItem<T>) => {
        return (values ?? []).some((v: DropdownItem<T>) => String(v.value) === String(item.value));
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
                    <ul className="pp-dropdown-list">
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
                                <input
                                    type="checkbox"
                                    checked={isActive(item)}
                                    readOnly
                                    tabIndex={-1}
                                    style={{ marginRight: 8 }}
                                />
                                {item.label}
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
                            {t('common.close')}
                        </li>
                    </ul>
                )}
            </div>
        </div>
    );
};

export default MultiDropdown;
