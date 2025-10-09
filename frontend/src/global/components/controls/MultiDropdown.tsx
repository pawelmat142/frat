import React, { useState, useRef, useEffect } from 'react';
import { DropdownItem, DropdownValue, MultiDropdownProps } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';
import DropdownOptions from './DropdownOptions';
import ArrowIcon from './ArrowIcon';
import { on } from 'events';



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

    const handleMultiSelect = (items: DropdownItem<T>[]) => {
        onSelect(items);
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
                <DropdownOptions
                    items={items}
                    value={values ?? []}
                    onMultiSelect={handleMultiSelect}
                    open={open}
                    disabled={disabled}
                    type="multi"
                />
            </div>
        </div>
    );
};

export default MultiDropdown;
