import { DateRange } from "@shared/interfaces/EmployeeProfileI";

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
            validate: (value: DateRange | undefined) => {
                if (!value || !value.start || !value.end) {
                    return t('validation.form.required');
                }
                return true;
            }
        };
    }
}