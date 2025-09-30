import { TranslationListDto } from '@shared/dto/TranslationListDto';
import { httpClient } from 'global/services/http';

export const TranslationAdminService = {

	getLanguagesList(): Promise<TranslationListDto[]> {
		return httpClient.get<TranslationListDto[]>(`/translations/admin/list`);
	},

};