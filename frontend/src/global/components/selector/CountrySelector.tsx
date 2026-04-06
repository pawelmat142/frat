import { useState, useEffect, forwardRef } from 'react';
import { SelectorItem, SelectorValue } from 'global/interface/controls.interface';
import { DictionaryElement, DictionaryI } from '@shared/interfaces/DictionaryI';
import { DictionaryService } from 'global/services/DictionaryService';
import { useTranslation } from 'react-i18next';
import FloatingSelector from './FloatingSelector';
import { DictionaryUtil } from '@shared/utils/DictionaryUtil';
import SkeletonControl from '../controls/SkeletonControl';

interface CountrySelectorProps {
    /** Currently selected country code (e.g., 'pl', 'de', 'gb') */
    value?: string;
    /** Callback when country is selected, emits COUNTRY_CODE and full dictionary element */
    onSelect?: (countryCode: string | null, dictionaryElement?: DictionaryElement) => void;
    id?: string;
    label?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    required?: boolean;
    center?: boolean;
    className?: string;
    error?: { message?: string } | null;
    enableSearchText?: boolean;
    showLabel?: boolean;
    /** Optional group code to filter dictionary elements */
    groupCode?: string;
}

/**
 * Country selector component that uses LANGUAGES dictionary
 * but displays COUNTRY_NAME and emits COUNTRY_CODE
 */
const CountrySelector = forwardRef((
    {
        value,
        onSelect,
        id,
        label,
        fullWidth = false,
        disabled = false,
        required = false,
        center = false,
        className = '',
        error,
        enableSearchText = true,
        showLabel,
        groupCode,
    }: CountrySelectorProps,
    ref: React.Ref<any>
) => {
    const [loading, setLoading] = useState(false);
    const [dictionary, setDictionary] = useState<DictionaryI | null>(null);

    const { t } = useTranslation();

    useEffect(() => {
        const initDictionary = async () => {
            setLoading(true);
            const res = await DictionaryService.getDictionary('LANGUAGES', groupCode);
            setDictionary(res);
            setLoading(false);
        };
        initDictionary();
    }, [groupCode]);

    if (loading) {
        return <SkeletonControl fullWidth={fullWidth} className={className} />;
    }

    if (!dictionary) {
        return <div>{t('validation.dictionaryNotFound')}</div>;
    }

    const handleSelect = (countryCode: string | null): void => {
        if (onSelect) {
            const element = DictionaryUtil.getElementByCountryCode(dictionary, countryCode || "");
            onSelect(countryCode, element);
        }
    };

    // Map dictionary elements to selector items using COUNTRY_CODE as value and COUNTRY_NAME as label
    const items: SelectorItem<string>[] = dictionary.elements.map(element => {
        const countryCode = element.values.COUNTRY_CODE;
        const translationKey = `dictionary.${dictionary.code}.COUNTRY_NAME.${element.code}`;
        const translatedLabel = t(translationKey);
        const capitalizedLabel = translatedLabel.charAt(0).toUpperCase() + translatedLabel.slice(1);

        return {
            label: capitalizedLabel,
            value: String(countryCode),
            src: element.values.SRC,
        };
    });

    const selectedItem: SelectorItem<string> | null = items.find(item => item.value === value) || null;

    return (
        <FloatingSelector
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
        />
    );
});

export default CountrySelector;
