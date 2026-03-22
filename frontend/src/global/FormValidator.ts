import { DateRange } from "@shared/interfaces/WorkerI";

export abstract class FormValidator {

    public static required = (t: any) => {
        return { required: t('validation.form.required') };
    }

    public static requiredArray = (t: any) => {
        return {
            validate: (value: any) => {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    return t('validation.form.required');
                }
                return true;
            }
        };
    }
    
    public static dateRangeRequired = (t: any) => {
        return {
            validate: (value?: DateRange | null) => {
                if (!value || !value.start || !value.end) {
                    return t('validation.form.dateRangeRequired');
                }
                return true;
            }
        };
    }
    
    public static dateRangeStartRequired = (t: any) => {
        return {
            validate: (value?: DateRange | null) => {
                if (!value?.start) {
                    return t('validation.form.dateRangeStartRequired');
                }
                return true;
            }
        };
    }

    public static positiveInterger = (t: any) => {
        return {
            validate: (value: any) => {
                if (value == null || value === '') return true; 
                const intValue = Number(value);
                if (!Number.isInteger(intValue) || intValue <= 0) {
                    return t('validation.form.positiveInteger');
                }
                return true;
            }
        };
    }

    public static phoneNumber = (t: any) => {
        return {
            validate: (value: { prefix: string; number: string } | null | undefined) => {
                if (!value || !value.number) {
                    return t('validation.form.phoneNumberRequired');
                }
                const digitsOnly = value.number.replace(/\D/g, '');
                if (digitsOnly.length < 6) {
                    return t('validation.form.phoneNumberTooShort');
                }
                if (digitsOnly.length > 15) {
                    return t('validation.form.phoneNumberTooLong');
                }
                // Check if phoneNumber contains only digits
                if (!/^\d+$/.test(value.number)) {
                    return t('validation.form.phoneNumberInvalid');
                }
                return true;
            }
        };
    }
}