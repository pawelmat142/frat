export interface TranslationI {

    langCode: string;

    version: number;

    data: { [key: string]: string };
}