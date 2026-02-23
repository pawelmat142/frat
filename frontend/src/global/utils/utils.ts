import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { SelectorItem } from 'global/interface/controls.interface';

export abstract class Utils {
    public static isDevMode(): boolean {
        const isNodeDev = process.env.NODE_ENV === 'development';
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        return isNodeDev || isLocalhost;
    }

    public static dictionaryToSelectorItems<T extends string | number>(dictionary: DictionaryI, elementLabelTranslationKey: string = 'NAME', disabledValues: string[] = []): SelectorItem<T>[] {
        return dictionary.elements.map(element => {
            const translationKey = `dictionary.${dictionary.code}.${elementLabelTranslationKey}.${element.code}`;
            return {
                label: translationKey,
                value: element.code as T,
                src: element.values.SRC,
                disabled: disabledValues.includes(String(element.code)),
            };
        })
    }

    public static prepareFlagSrcs = (languages: string[], languagesDictionary: DictionaryI): Set<string> => {
        const srcs = new Set<string>();
        languages.forEach(lang => {
            const flagSrc = languagesDictionary?.elements.find(el => el.code === lang)?.values.SRC;
            if (flagSrc) {
                srcs.add(flagSrc);
            }
        });
        return srcs;
    }

    public static prepareLanguageNames = (t: any, codes: string[], languagesDictionary: DictionaryI): string => {
        return codes.map(code => {
            return languagesDictionary.elements.find(el => el.code === code)?.values.NAME;
        }).filter(name => name !== undefined)
            .map(name => t(name))
            .join(', ');

    }

}