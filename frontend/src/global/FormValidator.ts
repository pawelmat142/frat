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
}