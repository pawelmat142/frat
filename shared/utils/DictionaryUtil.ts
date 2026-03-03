import { DictionaryElement, DictionaryI } from "@shared/interfaces/DictionaryI";

export abstract class DictionaryUtil {

    public static getTranslationKey(dictionaryCode: string, value: string): string {
        return `dictionary.${dictionaryCode}.NAME.${value}`;
    }

    public static getElementByCountryCode(dictionary: DictionaryI, countryCode: string): DictionaryElement | undefined {
        return dictionary.elements.find(el => el.values.COUNTRY_CODE === countryCode);
    }

}

export const Dictionaries = {
    LANGUAGES: 'LANGUAGES',
    WORK_CATEGORY: 'WORK_CATEGORY',
    CERTIFICATES: 'CERTIFICATES',
} as const