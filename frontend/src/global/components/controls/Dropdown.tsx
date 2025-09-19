
import React, { useState } from 'react';
import { DropdownInterface } from '../../interface/controls.interface';
import ControlLabel from './ControlLabel';

const ArrowIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <span className={`dropdown-arrow${open ? ' open' : ''}`}
    aria-hidden="true"
  >
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    const [open, setOpen] = useState(false);
    const myClass = `pp-control pp-dropdown${fullWidth ? ' w-full' : ' w-fit'}${disabled ? ' opacity-50 pointer-events-none cursor-not-allowed' : ''}`;

    if (type === 'multi' && !onMultiSelect) {
        throw new Error("onMultiSelect prop is required for multi-select dropdowns");
    }
    if (type === 'single' && !onSingleSelect) {
        throw new Error("onSingleSelect prop is required for single-select dropdowns");
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const selectedItem = items.find(item => String(item.value) === selectedValue) || null;
        if (onSingleSelect) onSingleSelect(selectedItem);
    };

    const handleFocus = () => setOpen(true);
    const handleBlur = () => setOpen(false);

    return (
        <div className={`${className || ''}${center ? ' mx-auto' : ''}`} style={{ position: 'relative' }}>
            <ControlLabel id={id} label={label} required={required} />
            <div style={{ position: 'relative' }}>
                <select
                    id={id}
                    className={myClass}
                    value={value as string | number}
                    onChange={handleChange}
                    disabled={disabled}
                    required={required}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                >
                    <option value="" disabled>{label ? `Select ${label}` : 'Select'}</option>
                    {items.map(item => (
                        <option key={String(item.value)} value={String(item.value)}>
                            {item.label}
                        </option>
                    ))}
                </select>
                <ArrowIcon open={open} />
            </div>
        </div>
    );
};

export default Dropdown;
