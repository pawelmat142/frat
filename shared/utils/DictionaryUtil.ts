import { AppConfig } from "@shared/AppConfig";
import { DictionaryColumnTypes, DictionaryElement, DictionaryI } from "../interfaces/DictionaryI";
import { DateUtil } from "./DateUtil";

export abstract class DictionaryUtil {

    public static getTranslationKeyWithCol(dictionaryCode: string, columnCode: string, value: string): string {
        return `dictionary.${dictionaryCode}.${columnCode}.${value}`;

    }

    public static getTranslationKey(dictionaryCode: string, value: string): string {
        return DictionaryUtil.getTranslationKeyWithCol(dictionaryCode, "NAME", value);
    }

    public static getElementByCountryCode(dictionary: DictionaryI, countryCode: string): DictionaryElement | undefined {
        return dictionary.elements.find(el => el.values.COUNTRY_CODE === countryCode);
    }

    public static displayElementValue = (value: any, columnType: string, t: any, isTranslatable: boolean = false) => {
        if (isTranslatable && value) {
            return t(value, { lang: AppConfig.DEFAULT_LANG_CODE });
        }

        if (columnType === DictionaryColumnTypes.DATE) {
            return DateUtil.displayDate(value);
        }

        if (columnType === DictionaryColumnTypes.BOOLEAN) {
            return value ? 'true' : 'false';
        }

        return value !== undefined && value !== '' ? String(value) : '-';
    };

}