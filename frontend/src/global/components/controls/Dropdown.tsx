
import React, { useState, useRef, useEffect } from 'react';
import { DropdownInterface, DropdownItem } from '../../interface/controls.interface';
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

const Dropdown: React.FC<DropdownInterface> = ({
    type = 'single',
    items,
    value,
    onSingleSelect,
    onMultiSelect,
    id,
    label,
    fullWidth = false,
    disabled = false,
    required = false,
    center = false,
    className = ''
}) => {

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
            })
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);



    const handleSingleSelect = (item: DropdownItem | null) => {
        if (type === 'single' && onSingleSelect) {
            if (item?.value === value?.value) {
                onSingleSelect(null);
            } else {
                onSingleSelect(item);
            }
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
                <DropdownOptions
                    items={items}
                    value={value}
                    onSingleSelect={handleSingleSelect}
                    onMultiSelect={onMultiSelect}
                    open={open}
                    disabled={disabled}
                    type={type}
                />
            </div>
        </div>
    );
};

export default Dropdown;
