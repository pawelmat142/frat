import { DictionaryI } from "@shared/DictionaryI";

export abstract class DictionaryValidators {

    public static validateCode(code: string): string | null {
        const codeRegex = /^[A-Za-z_]+$/;
        if (!codeRegex.test(code)) {
            return `Invalid code format: ${code}. Only letters and underscores are allowed.`;
        }
        return null;
    }

    public static validateElementCodes(dictionary: DictionaryI): string | null {
        for (let element of dictionary.elements) {
            const codeError = this.validateCode(element.code);
            if (codeError) {
                return codeError;
            }
        }
        return null;
    }

    public static validateColumnCodes(dictionary: DictionaryI): string | null {
        for (let column of dictionary.columns) {
            const codeError = this.validateCode(column.code);
            if (codeError) {
                return codeError;
            }
        }
        return null;
    }

    public static validateGroupCodes(dictionary: DictionaryI): string | null {
        for (let group of dictionary.groups) {
            const codeError = this.validateCode(group.code);
            if (codeError) {
                return codeError;
            }
        }
        return null;
    }

    public static validateColumnCodeDuplicates(dictionary: DictionaryI): string | null {
        const codes = dictionary.columns.map(col => col.code);
        const uniqueCodes = new Set(codes);
        if (uniqueCodes.size !== codes.length) {
            return `Duplicate column codes found.`;
        }
        return null;
    }

    public static validateElementCodeDuplicates(dictionary: DictionaryI): string | null {
        const codes = dictionary.elements.map(el => el.code);
        const uniqueCodes = new Set(codes);
        if (uniqueCodes.size !== codes.length) {
            return "Duplicate element codes found.";
        }
        return null;
    }

    public static validateGroupCodeDuplicates(dictionary: DictionaryI): string | null {
        const codes = dictionary.groups.map(gr => gr.code);
        const uniqueCodes = new Set(codes);
        if (uniqueCodes.size !== codes.length) {
            return "Duplicate group codes found.";
        }
        return null;
    }

    public static validateRequiredColumnsInElements(dictionary: DictionaryI): string | null {
        const requiredColumns = dictionary.columns.filter(col => col.required).map(col => col.code);
        const missingColumns = requiredColumns.filter(col => !dictionary.elements.some(el => col in el.values));
        if (missingColumns.length > 0) {
            return `Missing required columns in elements: ${missingColumns.join(", ")}`;
        }
        return null;
    }
}