import { DictionaryElement, DictionaryI, DictionaryListItem } from '@shared/interfaces/DictionaryI';
import { httpClient } from 'global/services/http';
import { TranslationService } from 'global/services/Translation.service';

export const DictionaryAdminService = {

	async getDictionary(code: string): Promise<DictionaryI> {
		const dictionary = await httpClient.get<DictionaryI>(`/admin/dictionaries/${code}`);
		return dictionary;
	},

	async putDictionary(dictionary: DictionaryI): Promise<DictionaryI> {
		const result = await httpClient.put<DictionaryI>(`/admin/dictionaries`, dictionary);
		return result;
	},

	async putElement(element: DictionaryElement, dictionaryCode: string): Promise<DictionaryI> {
		const result = await httpClient.put<DictionaryI>(`/admin/dictionaries/${dictionaryCode}`, element);
		return result;
	},

	deleteDictionary(code: string): Promise<void> {
		return httpClient.delete<void>(`/admin/dictionaries/${code}`);
	},

	getDictionariesList(): Promise<DictionaryListItem[]> {
		return httpClient.get<DictionaryListItem[]>("/admin/dictionaries/list");
	},

	import(data: any): Promise<any> {
		return httpClient.post("/admin/import/dictionaries/import", data)
	},

	// remove?
	translateTranslateableColumns(dictionary: DictionaryI, translate: any): void {
		dictionary.columns
			.filter(c => c.translatable)
			.map(c => c.code)
			.forEach(columnCode => {
				dictionary.elements.forEach(element => {
					const translationKey = element.values[columnCode];
					const translatedValue = translate(translationKey);
					element.values[columnCode] = translatedValue;
				})
			})
	},

};