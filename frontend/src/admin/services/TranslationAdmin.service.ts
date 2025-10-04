import { TranslationListDto } from '@shared/dto/TranslationListDto';
import { TranslationI } from '@shared/interfaces/TranslationI';
import { httpClient } from 'global/services/http';

export const TranslationAdminService = {

	getTranslation(langCode: string): Promise<TranslationI> {
		return httpClient.get<TranslationI>(`/admin/translations/${langCode}`);
	},

	getLanguagesList(): Promise<TranslationListDto[]> {
		return httpClient.get<TranslationListDto[]>(`/admin/translations/admin/list`);
	},

	putTranslation(translation: TranslationI): Promise<TranslationI> {
		return httpClient.put<TranslationI>(`/admin/translations/admin`, translation);
	},

	import(data: any): Promise<any> {
		return httpClient.post("/admin/import/translations/import", data);
	}

};