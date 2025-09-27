import { httpClient } from "global/services/http";

export const DictionaryImportService = {
	async exportJson(code: string) {
		// Use fetch to get the file and extract filename from headers
		const response = await httpClient.getFile(`/dictionaries/export/${code}`);
		// AxiosResponse: { data: Blob, headers: Record<string, string> }
		const disposition = response.headers['content-disposition'];
		let filename = `dictionary_${code}.json`;
		if (disposition) {
			const match = disposition.match(/filename="?([^";]+)"?/);
			if (match && match[1]) {
				filename = match[1];
			}
		}
		const blob = response.data;
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
};