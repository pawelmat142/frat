import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";
import DictionarySelector from "global/components/selector/DictionarySelector";

const OfferFormStepTwo: React.FC = () => {

    const { t } = useTranslation();
    const ctx = useOfferForm();

    return (
        <>
            <h2 className="form-subheader">
                {t("offer.form.STEP_TWO.title")}
            </h2>
            <div className="flex flex-col gap-2">

                <Controller
                    name="STEP_TWO.skillsRequired"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("offer.skillsRequired")}
                            code="SKILLS"
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_TWO?.skillsRequired}
                        />
                    )}
                />

                <Controller
                    name="STEP_TWO.skillsNiceToHave"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full mb-5"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("offer.skillsNiceToHave")}
                            code="SKILLS"
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_TWO?.skillsNiceToHave}
                        />
                    )}
                />

                <Controller
                    name="STEP_TWO.certificatesRequired"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("offer.certificatesRequired")}
                            code="CERTIFICATES"
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_TWO?.certificatesRequired}
                        />
                    )}
                />

                <Controller
                    name="STEP_TWO.certificatesNiceToHave"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full mb-5"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("offer.certificatesNiceToHave")}
                            code="CERTIFICATES"
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_TWO?.certificatesNiceToHave}
                        />
                    )}
                />

                <Controller
                    name="STEP_TWO.languagesRequired"
                    control={ctx.formCtx.control}
                    render={({ field }) => <DictionarySelector
                        type="multi"
                        className="w-full"
                        valueInput={field.value}
                        onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                        label={t("offer.languagesRequired")}
                        code="LANGUAGES"
                        groupCode="COMMUNICATION"
                        fullWidth
                        error={ctx.formCtx.formState.errors.STEP_TWO?.languagesRequired}
                    />
                    }
                />

                <Controller
                    name="STEP_TWO.languagesNiceToHave"
                    control={ctx.formCtx.control}
                    render={({ field }) => <DictionarySelector
                        type="multi"
                        className="w-full mb-5"
                        valueInput={field.value}
                        onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                        label={t("offer.languagesNiceToHave")}
                        code="LANGUAGES"
                        groupCode="COMMUNICATION"
                        fullWidth
                        error={ctx.formCtx.formState.errors.STEP_TWO?.languagesNiceToHave}
                    />
                    }
                />

            </div>
        </>
    )
}
export default OfferFormStepTwo;