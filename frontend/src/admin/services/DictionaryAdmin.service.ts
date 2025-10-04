import { DictionaryI, DictionaryListItem } from '@shared/DictionaryI';
import { httpClient } from 'global/services/http';

export const DictionaryAdminService = {

	getDictionary(code: string): Promise<DictionaryI> {
		return httpClient.get<DictionaryI>(`/admin/dictionaries/${code}`);
	},

	putDictionary(dictionary: DictionaryI): Promise<DictionaryI> {
		return httpClient.put<DictionaryI>(`/admin/dictionaries`, dictionary);
	},

	deleteDictionary(code: string): Promise<void> {
		return httpClient.delete<void>(`/admin/dictionaries/${code}`);
	},

	getDictionariesList(): Promise<DictionaryListItem[]> {
		return httpClient.get<DictionaryListItem[]>("/admin/dictionaries/list");
	},

	import(data: any): Promise<any> {
		return httpClient.post("/admin/import/dictionaries/import", data)
	}

};