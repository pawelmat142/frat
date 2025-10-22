export interface TranslationI {

    langCode: string;

    version: number;

    data: TranslationData;
}

export type TranslationData = { [ key: string ]: any };
export type TranslationDataWithPaths = { [ key: string ]: string };