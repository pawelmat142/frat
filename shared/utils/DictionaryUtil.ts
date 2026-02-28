export abstract class DictionaryUtil {

    public static getTranslationKey(dictionaryCode: string, value: string): string {
        return `dictionary.${dictionaryCode}.NAME.${value}`;
    }

}

export const Dictionaries = {
    LANGUAGES: 'LANGUAGES',
    WORK_CATEGORY: 'WORK_CATEGORY',
    CERTIFICATES: 'CERTIFICATES',
} as const