import { useState, useEffect, useCallback, forwardRef } from 'react';
import { DictionarySelectorInterface, SelectorItem, SelectorValue } from 'global/interface/controls.interface';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { DictionaryService } from 'global/services/DictionaryService';
import Loading from '../Loading';
import { useTranslation } from 'react-i18next';
import FloatingSelector from '../selector/FloatingSelector';
import FloatingSelectorMulti from './FloatingSelectorMulti';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DictionarySelectorProps extends DictionarySelectorInterface<string> {
    disabledValues?: string[];
    /** i18n key suffix used for element labels (default: 'NAME'). */
    elementLabelTranslationKey?: string;
    emitValueCode?: string;
    onDictionaryChange?: (dictionary: DictionaryI | null) => void;
    skipSort?: boolean;
}

// ---------------------------------------------------------------------------
// useDictionary – data-fetching hook (separated from rendering concern)
// ---------------------------------------------------------------------------

interface UseDictionaryResult {
    loading: boolean;
    items: SelectorItem<string>[];
    dictionary: DictionaryI | null;
}

function useDictionary(
    code: string,
    groupCode: string | undefined,
    options: {
        disabledValues: string[];
        elementLabelTranslationKey: string;
        skipSort: boolean;
        onDictionaryChange?: (dictionary: DictionaryI | null) => void;
    }
): UseDictionaryResult {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await DictionaryService.getDictionary(code);
                if (!cancelled) {
                    setDictionary(res);
                    options.onDictionaryChange?.(res);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    // Notify parent when groupCode changes (dictionary stays the same).
    useEffect(() => {
        options.onDictionaryChange?.(dictionary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupCode]);

    const elements = useCallback((): DictionaryI['elements'] => {
        if (!dictionary) return [];
        if (!groupCode) return dictionary.elements;
        const group = dictionary.groups.find(g => g.code === groupCode);
        if (!group) return dictionary.elements;
        return dictionary.elements.filter(el => group.elementCodes.includes(el.code));
    }, [dictionary, groupCode]);

    const items: SelectorItem<string>[] = (() => {
        const filtered = elements();
        const sorted = options.skipSort
            ? filtered
            : [...filtered].sort((a, b) => a.code.localeCompare(b.code));

        return sorted.map(element => {
            const key = `dictionary.${dictionary?.code}.${options.elementLabelTranslationKey}.${element.code}`;
            const raw = t(key);
            return {
                label: raw.charAt(0).toUpperCase() + raw.slice(1),
                value: String(element.code),
                src: element.values.SRC,
                disabled: options.disabledValues.includes(String(element.code)),
                exclusionCode: element.values.EXCLUSION_CODE ?? undefined,
            };
        });
    })();

    return { loading, items, dictionary };
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
