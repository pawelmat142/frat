import { DropdownItem, DropdownValue } from '../../interface/controls.interface';


interface DropdownOptionsProps<T extends DropdownValue = DropdownValue> {
    items: DropdownItem<T>[];
    value: DropdownItem<T> | null;
    onSingleSelect?: (item: DropdownItem<T> | null) => void;
    onMultiSelect?: (items: DropdownItem<T>[]) => void;
    open: boolean;
    disabled?: boolean;
    type?: 'single' | 'multi';
}


const DropdownOptions = <T extends DropdownValue = DropdownValue>({
    items,
    value,
    onSingleSelect,
    onMultiSelect,
    open,
    disabled = false,
    type = 'single',
}: DropdownOptionsProps<T>) => {
    const handleSelect = (item: DropdownItem<T>) => {
        if (disabled) return;
        if (type === 'single' && onSingleSelect) {
            onSingleSelect(item);
        }
    };

    if (!open) return null;

    return (
        <ul className="pp-dropdown-list">
            {items.map(item => (
                <li
                    key={String(item.value)}
                    className={`dropdown-item${String(item.value) === String(value?.value) ? ' active' : ''}`}
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
