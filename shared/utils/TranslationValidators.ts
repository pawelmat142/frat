import { TranslationI } from '../interfaces/TranslationI';

export abstract class TranslationValidators {
	/** Checks if langCode is a non-empty string and matches ISO 639-1 format */
	static validateLangCode(translation: TranslationI): string | null {
		if (!translation.langCode || typeof translation.langCode !== 'string') {
			return 'Language code is required.';
		}
		if (!/^[a-z]{2}$/i.test(translation.langCode)) {
			return 'Language code must be a valid ISO 639-1 code (2 letters).';
		}
		return null;
	}

	/** Checks if version is a positive integer */
	static validateVersion(translation: TranslationI): string | null {
		if (typeof translation.version !== 'number' || translation.version < 1 || !Number.isInteger(translation.version)) {
			return 'Version must be a positive integer.';
		}
		return null;
	}

	/** Checks if data is a non-empty object with string keys and string values */
	static validateData(translation: TranslationI): string | null {
		if (!translation.data || typeof translation.data !== 'object') {
			return 'Translation data must be an object.';
		}
		const keys = Object.keys(translation.data);
		if (keys.length === 0) {
			return 'Translation data must not be empty.';
		}
		for (const key of keys) {
			if (typeof key !== 'string' || key.trim() === '') {
				return 'All translation keys must be non-empty strings.';
			}
			if (typeof translation.data[key] !== 'string') {
				return `Value for key '${key}' must be a string.`;
			}
		}
		return null;
	}

	/** Checks for duplicate keys in data (should not happen in JS, but for safety) */
	static validateDuplicateKeys(translation: TranslationI): string | null {
		const keys = Object.keys(translation.data || {});
		const uniqueKeys = new Set(keys);
		if (uniqueKeys.size !== keys.length) {
			return 'Duplicate keys found in translation data.';
		}
		return null;
	}

	/** Checks for forbidden characters in keys (e.g., spaces, special chars) */
	static validateKeyFormat(translation: TranslationI): string | null {
		for (const key of Object.keys(translation.data || {})) {
			if (!/^[a-zA-Z0-9_.-]+$/.test(key)) {
				return `Key '${key}' contains forbidden characters. Allowed: a-z, A-Z, 0-9, _, ., -`;
			}
		}
		return null;
	}
}