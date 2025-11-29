import removeAccents from 'remove-accents';
import { SelectorItem } from './interface/controls.interface';
import { DictionaryI } from '@shared/interfaces/DictionaryI';
import { DateRange, Position } from '@shared/interfaces/EmployeeProfileI';

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

    public static formatDate = (t: any, date?: Date | null, placeholder?: string): string => {
        if (!date) return placeholder || '';
        const dayFull = t(`callendar.dayOfWeekFull.${date.getDay()}`);
        const dayNumber = date.getDate();
        const monthFull = t(`callendar.monthShort.${date.getMonth()}`);
        return `${dayFull}, ${dayNumber} ${monthFull}`;
    }

    public static formatDateRange = (t: any, range?: DateRange | null, placeholder?: string): string => {
        if (!range?.start) return placeholder || '';

        const startMonth = t(`callendar.monthShort.${range.start.getMonth()}`);
        const startDayNumber = range.start.getDate();
        let result = `${startDayNumber} ${startMonth}`;
        if (range.end) {
            const endMonth = t(`callendar.monthShort.${range.end.getMonth()}`);
            const endDayNumber = range.end.getDate();
            result += ` - ${endDayNumber} ${endMonth} ${range.end.getFullYear()}`;
        } else {
            result += ` ${range.start.getFullYear()}`;
        }
        return result;
    }

    public static formatFromTo(t: any, range?: DateRange | null): string | null {
        if (!range?.start) return null;

        const startMonth = t(`callendar.monthShort.${range.start.getMonth()}`);
        const startDayNumber = range.start.getDate();
        let result = `${t("common.from")} ${startDayNumber} ${startMonth}`;
        if (range.end) {
            const endMonth = t(`callendar.monthShort.${range.end.getMonth()}`);
            const endDayNumber = range.end.getDate();
            result += ` ${t("common.to")} ${endDayNumber} ${endMonth}`;
        }
        return result;
    }

    public static formatPosition = (position: Position): string => {
        return `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
    }

    public static capitalizeFirstLetter = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static prepareLanguageNames = (t: any, codes: string[], languagesDictionary: DictionaryI): string => {
        return codes.map(code => {
            return languagesDictionary.elements.find(el => el.code === code)?.values.NAME;
        }).filter(name => name !== undefined)
            .map(name => t(name))
            .join(', ');

    }
}