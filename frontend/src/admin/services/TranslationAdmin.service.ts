import { TranslationListDto } from '@shared/dto/TranslationListDto';
import { TranslationI, TranslationItemDto } from '@shared/interfaces/TranslationI';
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

	getTranslationItem(path: string): Promise<TranslationItemDto> {
		return httpClient.get<TranslationItemDto>(`/admin/translations/item/${path}`);
	},

	patchTranslationItem(item: TranslationItemDto): Promise<void> {
		return httpClient.patch<void>(`/admin/translations/item`, item);
	},

	import(data: any): Promise<any> {
		return httpClient.post("/admin/import/translations/import", data);
	}

};