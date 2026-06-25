import { forwardRef } from 'react';
import { DictionarySelectorInterface, SelectorValue } from 'global/interface/controls.interface';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import Loading from '../Loading';
import { useTranslation } from 'react-i18next';
import FloatingSelector from '../selector/FloatingSelector';
import FloatingSelectorMulti from './FloatingSelectorMulti';
import { useDictionary } from 'global/hooks/useDictionary';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DictionarySelectorProps extends DictionarySelectorInterface<string> {
    disabledValues?: string[];
    /** i18n key segment used for element labels (default: 'NAME'). */
    elementLabelTranslationKey?: string;
    emitValueCode?: string;
    onDictionaryChange?: (dictionary: DictionaryI | null) => void;
    skipSort?: boolean;
}

// ---------------------------------------------------------------------------
// DictionarySelector
// ---------------------------------------------------------------------------

const DictionarySelector = forwardRef<HTMLDivElement, DictionarySelectorProps>((
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
        skipSort = false,
    },
    ref
) => {
    const { t } = useTranslation();

    const { loading, items, dictionary } = useDictionary(code, groupCode, {
        disabledValues,
        elementLabelTranslationKey,
        skipSort,
        onDictionaryChange,
    });

    if (loading) return <Loading />;
    if (!dictionary) return <div>{t('validation.dictionaryNotFound')}</div>;

    const commonProps = {
        id,
        label,
        fullWidth,
        disabled,
        required,
        center,
        className,
        error,
        enableSearchText,
        showLabel,
    };

    if (type === 'single') {
        const selectedItem = items.find(item => item.value === valueInput) ?? null;

        const handleSelect = (value: SelectorValue | null) => {
            if (!onSelect) return;
            const element = dictionary.elements.find(el => el.code === value);
            onSelect(value as string | null, element);
        };

        return (
            <FloatingSelector
                ref={ref}
                {...commonProps}
                items={items}
                value={selectedItem}
                onSelect={handleSelect}
            />
        );
    }

    if (type === 'multi') {
        const selectedItems = Array.isArray(valueInput)
            ? items.filter(item => valueInput.includes(item.value))
            : [];

        return (
            <FloatingSelectorMulti
                ref={ref}
                {...commonProps}
                items={items}
                values={selectedItems}
                onSelect={onSelectMulti ?? (() => {})}
                displayElementsAsChips
            />
        );
    }

    return null;
});

DictionarySelector.displayName = 'DictionarySelector';

export default DictionarySelector;
