import { DropdownItem, DropdownValue } from '../../interface/controls.interface';


type DropdownOptionsProps<T extends DropdownValue = DropdownValue> =
    | {
        items: DropdownItem<T>[];
        value: DropdownItem<T> | null;
        onSingleSelect: (item: DropdownItem<T> | null) => void;
        onMultiSelect?: never;
        open: boolean;
        disabled?: boolean;
        type?: 'single';
    }
    | {
        items: DropdownItem<T>[];
        value: DropdownItem<T>[];
        onSingleSelect?: never;
        onMultiSelect: (items: DropdownItem<T>[]) => void;
        open: boolean;
        disabled?: boolean;
        type: 'multi';
    };


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
        if (type === 'multi' && onMultiSelect) {
            // For multi-select, toggle the item in the selection
            if (!value || !Array.isArray(value)) return;
            const exists = value.some((v: DropdownItem<T>) => String(v.value) === String(item.value));
            let newValues: DropdownItem<T>[];
            if (exists) {
                newValues = value.filter((v: DropdownItem<T>) => String(v.value) !== String(item.value));
            } else {
                newValues = [...value, item];
            }
            onMultiSelect(newValues);
        }
    };

    if (!open) return null;

    const isActive = (item: DropdownItem<T>) => {
        if (type === 'multi' && Array.isArray(value)) {
            return value.some((v: DropdownItem<T>) => String(v.value) === String(item.value));
        }
        return String(item.value) === String((value as DropdownItem<T> | null)?.value);
    };

    return (
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
                    {type === 'multi' && (
                        <input
                            type="checkbox"
                            checked={isActive(item)}
                            readOnly
                            tabIndex={-1}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    {item.label}
                </li>
            ))}
        </ul>
    );
};

export default DropdownOptions;
