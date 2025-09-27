import { DictionaryI } from '@shared/DictionaryI';
import { httpClient } from 'global/services/http';

export const DictionaryAdminService = {

	getDictionary(code: string): Promise<DictionaryI> {
		return httpClient.get<DictionaryI>(`/dictionaries/${code}`);
	},

	putDictionary(dictionary: DictionaryI): Promise<DictionaryI> {
		return httpClient.put<DictionaryI>(`/dictionaries`, dictionary);
	},

	deleteDictionary(code: string): Promise<void> {
		return httpClient.delete<void>(`/dictionaries/${code}`);
	},
};