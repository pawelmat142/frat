import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectorItem } from 'global/interface/controls.interface';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { DictionaryService } from 'global/services/DictionaryService';

export interface UseDictionaryOptions {
    /** Values to mark as disabled in the returned items. */
    disabledValues?: string[];
    /** i18n key segment used for labels, e.g. 'NAME' → `dictionary.CODE.NAME.ELEMENT`. Default: 'NAME'. */
    elementLabelTranslationKey?: string;
    /** Skip alphabetical sort of elements. Default: false. */
    skipSort?: boolean;
    /** Called after the dictionary loads, and again whenever groupCode changes. */
    onDictionaryChange?: (dictionary: DictionaryI | null) => void;
}

export interface UseDictionaryResult {
    loading: boolean;
    /** Ready-to-use selector items (translated, capitalised, sorted). */
    items: SelectorItem<string>[];
    /** Raw dictionary, useful when the caller needs access to groups/elements directly. */
    dictionary: DictionaryI | null;
}

/**
 * Fetches a dictionary by code, optionally filters by groupCode, and returns
 * typed SelectorItems with translated labels ready for use in any selector.
 *
 * Handles: cancellation on unmount, groupCode-change notifications, sorting,
 * disabled values, and exclusion codes.
 */
export function useDictionary(
    code: string,
    groupCode?: string,
    options: UseDictionaryOptions = {}
): UseDictionaryResult {
    const {
        disabledValues = [],
        elementLabelTranslationKey = 'NAME',
        skipSort = false,
        onDictionaryChange,
    } = options;

    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

    // Keep a stable ref to the callback so effects don't re-run when the
    // parent recreates the function reference on every render.
    const onChangeRef = useRef(onDictionaryChange);
    useEffect(() => { onChangeRef.current = onDictionaryChange; });

    // Fetch when code changes. Cancels in-flight request on cleanup.
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const res = await DictionaryService.getDictionary(code);
                if (!cancelled) {
                    setDictionary(res);
                    onChangeRef.current?.(res);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [code]);

    // Notify parent when groupCode changes without re-fetching.
    const dictionaryRef = useRef(dictionary);
    useEffect(() => { dictionaryRef.current = dictionary; }, [dictionary]);

    useEffect(() => {
        onChangeRef.current?.(dictionaryRef.current);
    }, [groupCode]);

    const getElements = useCallback((): DictionaryI['elements'] => {
        if (!dictionary) return [];
        if (!groupCode) return dictionary.elements;
        const group = dictionary.groups.find(g => g.code === groupCode);
        return group
            ? dictionary.elements.filter(el => group.elementCodes.includes(el.code))
            : dictionary.elements;
    }, [dictionary, groupCode]);

    const items: SelectorItem<string>[] = (() => {
        const filtered = getElements();
        const sorted = skipSort
            ? filtered
            : [...filtered].sort((a, b) => a.code.localeCompare(b.code));

        return sorted.map(el => {
            const key = `dictionary.${dictionary?.code}.${elementLabelTranslationKey}.${el.code}`;
            const raw = t(key);
            return {
                label: raw.charAt(0).toUpperCase() + raw.slice(1),
                value: String(el.code),
                src: el.values.SRC,
                disabled: disabledValues.includes(String(el.code)),
                exclusionCode: el.values.EXCLUSION_CODE ?? undefined,
            };
        });
    })();

    return { loading, items, dictionary };
}
