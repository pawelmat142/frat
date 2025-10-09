
import React, { useState, useRef, useEffect } from 'react';
import { DropdownInterface, DropdownItem, DropdownValue } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
import ArrowIcon from './ArrowIcon';

const Dropdown = <T extends DropdownValue = DropdownValue>({
    items,
    value,
    onSelect: onSingleSelect,
    id,
    label,
    fullWidth = false,
    disabled = false,
    required = false,
    center = false,
    className = ''
}: DropdownInterface<T>) => {

    if (!onSingleSelect) {
        throw new Error("onSingleSelect prop is required for single-select dropdowns");
    }

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const myClass = `pp-control pp-dropdown${fullWidth ? ' w-full' : ' w-fit'}${disabled ? ' opacity-50 pointer-events-none cursor-not-allowed' : ''}`;

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
        if (item?.value === value?.value) {
            onSingleSelect(null);
        } else {
            onSingleSelect(item);
        }
        setOpen(false);
    };

    const isActive = (item: DropdownItem<T>) => {
        return String(item.value) === String(value?.value);
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
                onClick={() => !disabled && setOpen((prev) => !prev)}
                onKeyDown={e => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') setOpen((prev) => !prev);
                    if (e.key === 'Escape') setOpen(false);
                }}
            >
                <span className="dropdown-selected">
                    {value?.label || <span className="secondary-text">select...</span>}
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
                                {item.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Dropdown;
