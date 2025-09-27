import { TranslationI } from "@shared/interfaces/TranslationI";
import { httpClient } from "global/services/http";

export const TranslationService = {

    getTranslation(langCode: string): Promise<TranslationI> {
        return httpClient.get<TranslationI>(`/translations/${langCode}`);
    }
}