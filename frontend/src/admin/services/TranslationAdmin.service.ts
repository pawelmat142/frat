import { TranslationListDto } from '@shared/dto/TranslationListDto';
import { TranslationI } from '@shared/interfaces/TranslationI';
import { httpClient } from 'global/services/http';

export const TranslationAdminService = {

	getTranslation(langCode: string): Promise<TranslationI> {
		return httpClient.get<TranslationI>(`/translations/${langCode}`);
	},

	getLanguagesList(): Promise<TranslationListDto[]> {
		return httpClient.get<TranslationListDto[]>(`/translations/admin/list`);
	},

	putTranslation(translation: TranslationI): Promise<TranslationI> {
		return httpClient.put<TranslationI>(`/translations/admin`, translation);
	}

};