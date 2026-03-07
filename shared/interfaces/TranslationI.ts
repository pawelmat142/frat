export interface TranslationI {

    langCode: string;

    version: number;

    data: TranslationData;
}

export interface TranslationItemDto {
    path: string;
    translation: TranslationDataWithPaths // lang code -> translation
}

export type TranslationData = { [ key: string ]: any };
export type TranslationDataWithPaths = { [ key: string ]: string };