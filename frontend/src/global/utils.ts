import removeAccents from 'remove-accents';
import { SelectorItem } from './interface/controls.interface';
import { DictionaryI } from '@shared/interfaces/DictionaryI';

export abstract class Utils {
    public static isDevMode(): boolean {
        const isNodeDev = process.env.NODE_ENV === 'development';
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        return isNodeDev || isLocalhost;
    }

    // Util: remove diacritics (accents) from string using remove-accents library
    public static normalize = (str: string) => removeAccents(str).toLowerCase();

    public static dictionaryToSelectorItems<T extends string | number>(dictionary: DictionaryI, elementLabelTranslationKey: string = 'NAME', disabledValues: string[] = []): SelectorItem<T>[] {
        return dictionary.elements.map(element => {
            const translationKey = `dictionary.${dictionary.code}.${elementLabelTranslationKey}.${element.code}`;

            // TODO move to sheet
            // const translatedLabel = t(translationKey);
            // const capitalizedLabel = translatedLabel.charAt(0).toUpperCase() + translatedLabel.slice(1);
            return {
                label: translationKey,
                value: element.code as T,
                src: element.values.SRC,
                disabled: disabledValues.includes(String(element.code)),
            };
        })
    }
}