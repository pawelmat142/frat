import React from 'react';
import { DropdownInterface } from '../../interface/controls.interface';

interface DropdownOptionsProps {
    items: DropdownInterface['items'];
    value: DropdownInterface['value'];
    onSingleSelect?: DropdownInterface['onSingleSelect'];
    onMultiSelect?: DropdownInterface['onMultiSelect'];
    open: boolean;
    disabled?: boolean;
    type?: DropdownInterface['type'];
}

const DropdownOptions: React.FC<DropdownOptionsProps> = ({
    items,
    value,
    onSingleSelect,
    onMultiSelect,
    open,
    disabled = false,
    type = 'single',
}) => {
    const handleSelect = (item: typeof items[0]) => {
        if (disabled) return;
        if (type === 'single' && onSingleSelect) {
            onSingleSelect(item);
        }
    };

    if (!open) return null;

    return (
        <ul
            className="pp-dropdown-list"
        >
            {items.map(item => (
                <li
                    key={String(item.value)}
                    className={`dropdown-item${String(item.value) === String(value) ? ' active' : ''}`}
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
    );
};

export default DropdownOptions;
