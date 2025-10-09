
import React, { useState, useRef, useEffect } from 'react';
import { DropdownInterface, DropdownItem, DropdownValue } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
import DropdownOptions from './DropdownOptions';

const ArrowIcon: React.FC<{ open: boolean }> = ({ open }) => (
    <span className={`dropdown-arrow${open ? ' open' : ''}`}
        aria-hidden="true"
    >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </span>
);

const Dropdown = <T extends DropdownValue = DropdownValue>({
    type = 'single',
    items,
    value,
    values,
    onSingleSelect,
    onMultiSelect,
    id,
    label,
    fullWidth = false,
    disabled = false,
    required = false,
    center = false,
    className = ''
}: DropdownInterface<T>) => {

    if (type === 'multi' && !onMultiSelect) {
        throw new Error("onMultiSelect prop is required for multi-select dropdowns");
    }
    if (type === 'single' && !onSingleSelect) {
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
    }, [open, type]);



    const handleSingleSelect = (item: DropdownItem<T> | null) => {
        if (type === 'single' && onSingleSelect) {
            if (item?.value === value?.value) {
                onSingleSelect(null);
            } else {
                onSingleSelect(item);
            }
            setOpen(false);
        }
    };

    const handleMultiSelect = (items: DropdownItem<T>[]) => {
        if (type === 'multi' && onMultiSelect) {
            onMultiSelect(items);
        }
    };

// TODO aktywny element nie ma klasy active
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
                    // Only toggle open/close on click for single-select
                    if (type === 'single') setOpen((prev) => !prev);
                    if (type === 'multi' && !open) setOpen(true); // open on first click, but don't close on item click
                }}
                onKeyDown={e => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        if (type === 'single') setOpen((prev) => !prev);
                        if (type === 'multi' && !open) setOpen(true);
                    }
                    if (e.key === 'Escape') setOpen(false);
                }}
            >
                <span className="dropdown-selected">
                    {type === 'multi' && Array.isArray(values) && values.length > 0
                        ? values.map(v => v.label).join(', ')
                        : value?.label || <span className="secondary-text">select...</span>}
                </span>
                <ArrowIcon open={open} />
                {type === 'multi' ? (
                    <DropdownOptions
                        items={items}
                        value={values ?? []}
                        onMultiSelect={handleMultiSelect}
                        open={open}
                        disabled={disabled}
                        type="multi"
                    />
                ) : (
                    <DropdownOptions
                        items={items}
                        value={value ?? null}
                        onSingleSelect={handleSingleSelect}
                        open={open}
                        disabled={disabled}
                        type="single"
                    />
                )}
            </div>
        </div>
    );
};

export default Dropdown;
