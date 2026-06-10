
import { useState, useEffect, forwardRef } from 'react';
import { DictionarySelectorInterface, SelectorItem, SelectorValue } from 'global/interface/controls.interface';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { DictionaryService } from 'global/services/DictionaryService';
import Loading from '../Loading';
import { useTranslation } from 'react-i18next';
import FloatingSelector from '../selector/FloatingSelector';
import FloatingSelectorMulti from './FloatingSelectorMulti';

interface DictionarySelectorProps extends DictionarySelectorInterface<string> {
    disabledValues?: string[];
    elementLabelTranslationKey?: string
    showLabel?: boolean
    emitValueCode?: string;
    onDictionaryChange?: (dictionary: DictionaryI | null) => void;
    enableSearchText?: boolean;
    skipSort?: boolean;
}
const DictionarySelector = forwardRef((
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
        elementLabelTranslationKey = 'NAME',
        error,
        enableSearchText = false,
        showLabel,
        onDictionaryChange,
        skipSort = false
    }: DictionarySelectorProps,
    ref: React.Ref<any>
) => {

    if (valueInput) {
        if (type === 'single' && Array.isArray(valueInput)) {
            throw new Error("For single select, value must not be an array");
        }
        if (type === 'multi' && !Array.isArray(valueInput)) {
            throw new Error("For multi select, value must be an array");
        }
    }

    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

    const { t } = useTranslation();

    useEffect(() => {
        const initDictionary = async () => {
            setLoading(true);
            const res = await DictionaryService.getDictionary(code);
            setDictionary(res);
            onDictionaryChange?.(res);
            setLoading(false);
        }
        initDictionary();
    }, [code, onDictionaryChange]);

    // Filter elements by groupCode if provided
    const getFilteredElements = (dict: DictionaryI | null): DictionaryI['elements'] => {

        if (!dict) return [];
        
        if (!groupCode) {
            return dict.elements;
        }

        const group = dict.groups.find(g => g.code === groupCode);
        if (!group) {
            return dict.elements;
        }

        return dict.elements.filter(el => group.elementCodes.includes(el.code));
    };

    // Emit dictionary change when groupCode changes
    useEffect(() => {
        onDictionaryChange?.(dictionary);
    }, [groupCode, onDictionaryChange, dictionary]);

    if (loading) {
        return <Loading />;
    }

    if (!dictionary) {
        return <div>{t('validation.dictionaryNotFound')}</div>;
    }

    const handleSelect = (item: string | null): void => {
        if (onSelect) {
            const element = dictionary.elements.find(el => el.code === item);
            onSelect(item, element);
        }
    }

    const filteredElements = getFilteredElements(dictionary);

    const sortedElements = skipSort ? filteredElements : filteredElements.sort((a, b) => a.code.localeCompare(b.code));

    const items: SelectorItem<string>[] = sortedElements
        .map(element => {
            const translationKey = `dictionary.${dictionary.code}.${elementLabelTranslationKey}.${element.code}`;
            const translatedLabel = t(translationKey);
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
        return <FloatingSelector
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
            onSelect={handleSelect as (item: SelectorValue | null) => void}
            error={error}
            enableSearchText={enableSearchText}
            showLabel={showLabel}
        />;
    }

    if (type === 'multi') {
        // valueInput is array of selected values
        const selectedItems: SelectorItem<string>[] = Array.isArray(valueInput)
            ? items.filter(item => valueInput.includes(item.value))
            : [];
        const handleSelectMulti = onSelectMulti ?? (() => {});
        return <FloatingSelectorMulti
            items={items}
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
            displayElementsAsChips={true}
            enableSearchText={enableSearchText}
            showLabel={showLabel}
        />;
    }

    return null;

});

export default DictionarySelector;
