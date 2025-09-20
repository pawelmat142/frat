import axios from 'axios';
import { DictionaryI } from '@shared/DictionaryI';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const DictionaryAdminService = {

    // TODO dorobić popup exception, redirect exception,
	async putDictionary(dictionary: DictionaryI): Promise<DictionaryI> {
		const res = await axios.put(`${API_URL}/dictionaries`, dictionary);
		return res.data;
	},
};