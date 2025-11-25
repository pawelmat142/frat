import FloatingInput from "global/components/controls/FloatingInput";
import { FormValidator } from "global/FormValidator";
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";
import Selector from "global/components/selector/Selector";
import { Currencies, Currency } from "@shared/interfaces/OfferI";
import { SelectorItem } from "global/interface/controls.interface";
import { useEffect } from "react";
import FloatingSelector from "global/components/selector/FloatingSelector";

const OfferFormStepThree: React.FC = () => {

    const { t } = useTranslation();
    const required = FormValidator.required(t);
    // Custom validator: at least one of monthlySalaryStart or hourlySalaryStart must be filled
    const atLeastOneSalaryRequired = {
        validate: (_: any, formValues: any) => {
            const monthly = formValues?.STEP_THREE?.monthlySalaryStart;
            const hourly = formValues?.STEP_THREE?.hourlySalaryStart;
            if ((monthly == null || monthly === "") && (hourly == null || hourly === "")) {
                return t("offer.validation.atLeastOneSalaryRequired");
            }
            return true;
        }
    };


    const ctx = useOfferForm();

    const currencyItems: SelectorItem<string>[] = Object.keys(Currencies).map(curency => ({
        value: curency,
        label: curency
    }))

    useEffect(() => {
        if (!ctx.form.STEP_THREE?.currency) {
            ctx.formCtx.setValue("STEP_THREE.currency", Currencies.EUR);
        }
    }, [])

    const getCurrencyValue = (fieldValue?: Currency | null) => {
        if (!fieldValue) return null;
        const result = currencyItems.find(item => item.value === fieldValue) || null;
        console.log("getCurrencyValue:", fieldValue, "->", result);
        return result;
    }


    return (
        <>
            <h2 className="form-subheader">
                {t("offer.form.STEP_THREE.title")}
            </h2>
            <div className="flex flex-col gap-2">

                <Controller
                    name="STEP_THREE.monthlySalaryStart"
                    control={ctx.formCtx.control}
                    rules={atLeastOneSalaryRequired}
                    render={({ field }) => (
                        <FloatingInput
                            type="number"
                            {...field}
                            value={field.value ?? null}
                            label={t("offer.monthlySalaryStart")}
                            fullWidth
                            error={ctx.formCtx.formState.errors.STEP_THREE?.monthlySalaryStart}
                        />
                    )}
                />

                <Controller
                    name="STEP_THREE.monthlySalaryEnd"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <FloatingInput
                            className="mb-5"
                            type="number"
                            {...field}
                            value={field.value ?? null}
                            label={t("offer.monthlySalaryEnd")}
                            fullWidth
                            error={ctx.formCtx.formState.errors.STEP_THREE?.monthlySalaryEnd}
                        />
                    )}
                />

                <Controller
                    name="STEP_THREE.hourlySalaryStart"
                    control={ctx.formCtx.control}
                    rules={atLeastOneSalaryRequired}
                    render={({ field }) => (
                        <FloatingInput
                            type="number"
                            {...field}
                            value={field.value ?? null}
                            label={t("offer.hourlySalaryStart")}
                            fullWidth
                            error={ctx.formCtx.formState.errors.STEP_THREE?.hourlySalaryStart}
                        />
                    )}
                />

                <Controller
                    name="STEP_THREE.hourlySalaryEnd"
                    control={ctx.formCtx.control}
                    render={({ field }) => (
                        <FloatingInput
                            type="number"
                            className="mb-5"
                            {...field}
                            value={field.value ?? null}
                            label={t("offer.hourlySalaryEnd")}
                            fullWidth
                            error={ctx.formCtx.formState.errors.STEP_THREE?.hourlySalaryEnd}
                        />
                    )}
                />

                <Controller
                    name="STEP_THREE.currency"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingSelector
                            className="mb-5"
                            {...field}
                            value={getCurrencyValue(field.value)}
                            label={t("offer.currency")}
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_THREE?.currency}
                            items={currencyItems}
                            onSelect={(value) => field.onChange(value)}
                        />
                    )}
                />

            </div>
        </>
    )
}
export default OfferFormStepThree;