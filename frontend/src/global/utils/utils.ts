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

    public static prepareDisplayShortDate = (t: any, date: Date): string => {
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // If the date is within the last 6 days, show day of week
        if (diffDays <= 6 && diffDays >= 0) {
            const dayOfWeek = date.getDay();
            return t(`callendar.dayOfWeekThreeLetter.${dayOfWeek}`);
        }

        // Otherwise, show day number + month short
        const dayOfMonth = date.getDate();
        const month = date.getMonth();
        return `${dayOfMonth} ${t(`callendar.monthShort.${month}`)}`;
    }
}