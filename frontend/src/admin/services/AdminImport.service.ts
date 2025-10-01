import { httpClient } from "global/services/http";

export const AdminImportService = {

	exportDictionaryJson(code: string) {
		const url = `/import/dictionaries/export/${code}`
		let defaultFilename = `dictionary_${code}.json`;
		this.exportJson(url, defaultFilename);
	},

	exportTranslationJson(langCode: string) {
		const url = `/import/translations/export/${langCode}`
		let defaultFilename = `translation_${langCode}.json`;
		this.exportJson(url, defaultFilename);
	},

	async exportJson(url: string, defaultFilename: string) {
		const response = await httpClient.getFile(url);
		let filename = defaultFilename
		const disposition = response.headers['content-disposition'];
		if (disposition) {
			const match = disposition.match(/filename="?([^";]+)"?/);
			if (match && match[1]) {
				filename = match[1];
			}
		}
		const blob = response.data;
		const href = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = href;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(href);
		}, 0);
	}
};