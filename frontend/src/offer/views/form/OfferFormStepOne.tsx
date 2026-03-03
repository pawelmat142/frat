import { FormValidator } from "global/FormValidator";
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";
import DictionarySelector from "global/components/selector/DictionarySelector";
import { Position } from "@shared/interfaces/MapsInterfaces";
import DateInputViewSelector from "global/components/callendar/DateInputViewSelector";
import PhoneNumberFloatingInput from "global/components/controls/PhoneNumberFloatingInput";

// TODO move to config
export const DEFAUT_POINT: Position = { lat: 52.2297, lng: 21.0122 }; // Warsaw center as default point

const OfferFormStepOne: React.FC = () => {

    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const ctx = useOfferForm();

    // TODO prefil phone number 

    return (
        <>
            <h2 className="form-subheader">
                {t("offer.form.STEP_ONE.title")}
            </h2>
            <div className="flex flex-col gap-5 md:gap-5">

                <Controller
                    name="STEP_ONE.category"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <DictionarySelector
                            className="w-full"
                            valueInput={field.value || ''}
                            onSelect={item => {
                                field.onChange(item ? String(item) : null)
                            }}
                            label={t("offer.workCategory")}
                            code="WORK_CATEGORY"
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_ONE?.category}
                        />
                    )}
                />

                <Controller
                    name="STEP_ONE.communicationLanguages"
                    control={ctx.formCtx.control}
                    render={({ field }) => <DictionarySelector
                        type="multi"
                        className="w-full"
                        valueInput={field.value}
                        onSelectMulti={items => field.onChange(items.map(i => String(i)))}
                        label={t("offer.languagesRequired")}
                        code="LANGUAGES"
                        groupCode="COMMUNICATION"
                        fullWidth
                        error={ctx.formCtx.formState.errors.STEP_ONE?.communicationLanguages}
                    />
                    }
                />

                <Controller
                    name={`STEP_ONE.startDate`}
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => <DateInputViewSelector
                        label={t("offer.dateRange")}
                        className="w-full"
                        value={field.value}
                        onChange={(date) => {
                            field.onChange(date);
                        }}
                        error={ctx.formCtx.formState.errors.STEP_ONE?.startDate?.message}
                    />
                    }
                />

                <Controller
                    name="STEP_ONE.phoneNumber"
                    control={ctx.formCtx.control}
                    rules={{
                        ...required,
                        ...FormValidator.phoneNumber(t)
                    }}
                    render={({ field }) => (
                        <PhoneNumberFloatingInput
                            {...field}
                            value={field.value || { prefix: '', phoneNumber: '' }}
                            label={t("employeeProfile.form.phoneNumber")}
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_ONE?.phoneNumber}
                        />
                    )}
                />

            </div>
        </>
    )
}
export default OfferFormStepOne;