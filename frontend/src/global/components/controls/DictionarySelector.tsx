
import { useState, useEffect, forwardRef } from 'react';
import { SelectorValue, DictionarySelectorInterface, SelectorItem } from 'global/interface/controls.interface';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { DictionaryService } from 'global/services/DictionaryService';
import Loading from '../Loading';
import Selector from './Selector';
import SelectorMulti from './SelectorMulti';
import { useTranslation } from 'react-i18next';

interface DictionarySelectorProps<T extends SelectorValue = SelectorValue> extends DictionarySelectorInterface<T> {
    disabledValues?: string[];
    elementLabelTranslationKey?: string
}
// TODO wpisywanie zawerza liste wyboru
const DictionarySelector = forwardRef(<T extends SelectorValue = SelectorValue>(
    {
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
        valueInput,
        onSelectMulti,
        disabledValues = [],
        elementLabelTranslationKey = 'TRANSLATION_KEY',
        error
    }: DictionarySelectorProps<T>,
    ref: React.Ref<any>
) => {

    if (type === 'single' && Array.isArray(valueInput)) {
        throw new Error("For single select, value must not be an array");
    }
    if (type === 'multi' && !Array.isArray(valueInput)) {
        throw new Error("For multi select, value must be an array");
    }

    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

    const { t } = useTranslation();

    useEffect(() => {
        const initDictionary = async () => {
            setLoading(true);
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
        return <div>{t('validation.dictionaryNotFound')}</div>;
    }

    const handleSelect = (item: SelectorItem<SelectorValue> | null): void => {
        if (onSelect) {
            onSelect(item as SelectorItem<T> | null);
        }
    }

    const items: SelectorItem<string & { disabled?: boolean }>[] = dictionary.elements.map(element => {
        const translatedLabel = t(element.values[elementLabelTranslationKey]);
        const capitalizedLabel = translatedLabel.charAt(0).toUpperCase() + translatedLabel.slice(1);
        return {
            label: capitalizedLabel,
            value: String(element.code),
            src: element.values.SRC,
            disabled: disabledValues.includes(String(element.code)),
        };
    });

    if (type === 'single') {
        const selectedItem: SelectorItem<string> | null = items.find(item => item.value === valueInput) || null;
        return <Selector
            ref={ref}
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
            error={error}
        />;
    }

    if (type === 'multi') {
        // valueInput is array of selected values
        const selectedItems: SelectorItem<T>[] = Array.isArray(valueInput)
            ? items.filter(item => valueInput.includes(item.value)) as SelectorItem<T>[]
            : [];
        const handleSelectMulti = onSelectMulti ?? (() => {});
        return <SelectorMulti
            items={items as SelectorItem<T>[]}
            values={selectedItems}
            onSelect={handleSelectMulti}
            id={id}
            label={label}
            fullWidth={fullWidth}
            disabled={disabled}
            required={required}
            center={center}
            className={className}
            error={error}
        />;
    }

    return null;

});

DictionarySelector.displayName = 'DictionarySelector';

export default DictionarySelector;
