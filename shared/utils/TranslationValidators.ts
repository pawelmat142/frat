import { TranslationI } from '../interfaces/TranslationI';
import { ObjUtil } from './ObjUtil';

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

	/** Checks if data is a non-empty object with string keys and string values (supports nested objects) */
	static validateData(translation: TranslationI): string | null {
		if (!translation.data || typeof translation.data !== 'object') {
			return 'Translation data must be an object.';
		}
		const paths = ObjUtil.getPathsFromNestedJsonKeys(translation.data);
		if (paths.length === 0) {
			return 'Translation data must not be empty.';
		}
		for (const path of paths) {
			if (typeof path !== 'string' || path.trim() === '') {
				return 'All translation keys must be non-empty strings.';
			}
			const value = ObjUtil.getValueFromNestedJsonByPath(translation.data, path);
			if (typeof value !== 'string') {
				return `Value for key '${path}' must be a string.`;
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