
import { useState, useRef, useEffect } from 'react';
import { SelectorValue, DictionarySelectorInterface, SelectorItem } from 'global/interface/controls.interface';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { DictionaryService } from 'global/services/DictionaryService';
import Loading from '../Loading';
import Selector from './Selector';

const DictionarySelector = <T extends SelectorValue = SelectorValue>({
    onSelect,
    id,
    label,
    fullWidth = false,
    disabled = false,
    required = false,
    center = false,
    className = '',
    code,
    groupCode,
    type = 'single',
    value,
    onSelectMulti
}: DictionarySelectorInterface<T>) => {

    if (type === 'single' && Array.isArray(value)) {
        throw new Error("For single select, value must not be an array");
    }
    if (type === 'multi' && !Array.isArray(value)) {
        throw new Error("For multi select, value must be an array");
    }

    // TODO remove?
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

    useEffect(() => {
        const initDictionary = async () => {
            setLoading(true);
            console.log('init')
            const res = await DictionaryService.getDictionary(code, groupCode);
            setDictionary(res);
            setLoading(false);
        }
        initDictionary();
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (!dictionary) {
        return <div>Dictionary not found</div>;
    }

    const handleSelect = (item: SelectorItem<string> | null): void => {
        if (onSelect) {
            onSelect(item as SelectorItem<T> | null);
        }
    }

    const items: SelectorItem<string>[] = dictionary.elements.map(element => ({
        label: element.code,
        value: String(element.code)
    }));

    if (type === 'single') {
        if (Array.isArray(value)) {
            throw new Error("For single select, value must not be an array");
        }
        const selectedItem: SelectorItem<string> | null = items.find(item => item.value === value?.value) || null;

        return <Selector<string>
            items={items}
            id={id}
            label={label}
            fullWidth={fullWidth}
            disabled={disabled}
            required={required}
            center={center}
            className={className}
            value={selectedItem}
            onSelect={handleSelect}
        />;

    }

    return null;


    // const handleSelect = (item: SelectorItem<T>) => {
    //     if (disabled) return;
    //     if (item?.value === value?.value) {
    //         onSingleSelect(null);
    //     } else {
    //         onSingleSelect(item);
    //     }
    //     setOpen(false);
    // };


};

export default DictionarySelector;
