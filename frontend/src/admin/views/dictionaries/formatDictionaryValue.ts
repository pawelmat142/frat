import { TFunction } from 'i18next';
import { DictionaryColumnTypes } from '@shared/interfaces/DictionaryI';
import { DateUtil } from '@shared/utils/DateUtil';
import { AppConfig } from '@shared/AppConfig';

interface Params {
    value: any;
    columnType: string;
    isTranslatable?: boolean;
    t: TFunction;
}

export const formatDictionaryValue = ({
    value,
    columnType,
    isTranslatable = false,
    t,
}: Params): string => {
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
