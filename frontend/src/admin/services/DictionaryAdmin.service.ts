import { DictionaryI } from '@shared/DictionaryI';
import { httpClient } from 'global/services/http';

export const DictionaryAdminService = {

	async getDictionary(code: string): Promise<DictionaryI> {
		return httpClient.get<DictionaryI>(`/dictionaries/${code}`);
	},

	async putDictionary(dictionary: DictionaryI): Promise<DictionaryI> {
		return httpClient.put<DictionaryI>(`/dictionaries`, dictionary);
	},

	async deleteDictionary(code: string): Promise<void> {
		return httpClient.delete<void>(`/dictionaries/${code}`);
	},
};