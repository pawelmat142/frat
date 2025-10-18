export abstract class FormValidator {

    public static required = (t: any) => {
        return { required: t('validation.form.required') };
    }
}