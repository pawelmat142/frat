import FloatingInput from "global/components/controls/FloatingInput";
import { FormValidator } from "global/FormValidator";
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";

const OfferFormStepTwo: React.FC = () => {

    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const ctx = useOfferForm();

    return (
        <>
            <h2 className="form-subheader">
                {t("offer.form.STEP_TWO.title")}
            </h2>
            <div className="flex flex-col gap-7 md:gap-5">
                <Controller
                    name="STEP_ONE.locationCountry"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            label={t("offer.form.locationCountry")}
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_ONE?.locationCountry}
                        />
                    )}
                />
            </div>
        </>
    )
}
export default OfferFormStepTwo;