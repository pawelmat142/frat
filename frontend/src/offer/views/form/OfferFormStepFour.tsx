import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";
import { Controller } from "react-hook-form";
import FloatingInput from "global/components/controls/FloatingInput";
import FloatingTextarea from "global/components/controls/FloatingTextarea";

const OfferFormStepFour: React.FC = () => {

    const { t } = useTranslation();
    const ctx = useOfferForm();

    return (
        <>
            <h2 className="form-subheader">
                {t("offer.form.STEP_FOUR.title")}
            </h2>
            <div className="flex flex-col gap-7 md:gap-5">

                <Controller
                    name="STEP_FOUR.displayName"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <FloatingInput
                            label={t("offer.displayName")}
                            name="STEP_FOUR.displayName"
                            className="w-full"
                            value={field.value || ''}
                            required
                            onChange={(p) => {
                                field.onChange(p);
                            }}
                            error={ctx.formCtx.formState.errors.STEP_FOUR?.displayName}
                        />
                    )}
                />

                <Controller
                    name="STEP_FOUR.description"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <FloatingTextarea
                            label={t("offer.description")}
                            name="STEP_FOUR.description"
                            className="w-full"
                            value={field.value || ''}
                            required
                            onChange={(p) => {
                                field.onChange(p);
                            }}
                            error={ctx.formCtx.formState.errors.STEP_FOUR?.displayName}
                        />
                    )}
                />
            </div>
        </>
    )
}
export default OfferFormStepFour;