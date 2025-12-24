import { FormValidator } from "global/FormValidator";
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";
import DictionarySelector from "global/components/selector/DictionarySelector";
import PositionSelector from "global/components/selector/position/PositionSelector";
import DateRangeInput from "global/components/callendar/DateRangeInputViewSelector";
import { useRef } from "react";
import { Position } from "@shared/interfaces/EmployeeProfileI";
import { useState } from "react";
import { PositionService } from "global/services/PositionService";
import { DictionaryService } from "global/services/DictionaryService";
import Loading from "global/components/Loading";
import FloatingInput from "global/components/controls/FloatingInput";
import { useUserContext } from "user/UserProvider";

const OfferFormStepOne: React.FC = () => {

    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const dateRangeStartRequired = FormValidator.dateRangeStartRequired(t);
    const positiveInteger = FormValidator.positiveInterger(t);
    const ctx = useOfferForm();
    const userCtx = useUserContext();
    const countryCacheRef = useRef<Record<string, string>>({});
    const [geoLoading, setGeoLoading] = useState(false);

    const form = ctx.formCtx.getValues().STEP_ONE;

    const preparePosition = (): Position => {
        return userCtx.position || { lat: 52.2297, lng: 21.0122 };//domyslnie warszawa
    }

    /**
     * Attempt to reverse geocode the provided lat/lng and update country filter automatically.
     * Uses OpenStreetMap Nominatim (public) – consider proxying via backend for production to respect rate limits.
     */
    const autofillCountryByPosition = async (position?: Position | null) => {
        if (!position) {
            return;
        }
        const key = `${position.lat.toFixed(3)},${position.lng.toFixed(3)}`; // coarse key to improve cache hits
        if (countryCacheRef.current[key]) {

            const country = countryCacheRef.current[key];
            ctx.formCtx.setValue("STEP_ONE.locationCountry", country);
            return;
        }
        setGeoLoading(true);
        try {
            const countryCode = await PositionService.callApiFindCountryByPosition(position);
            if (countryCode) {
                const languageCode = await DictionaryService.getLanguageDictionaryCodeByCountryCode(countryCode || '');
                if (languageCode) {
                    countryCacheRef.current[key] = languageCode;
                    ctx.formCtx.setValue("STEP_ONE.locationCountry", languageCode);
                }
            }
        } catch (e) {
            // Intentionally swallow errors – network issues shouldn't break filter sheet.
        } finally {
            setGeoLoading(false);
        }
    }

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
                    name="STEP_ONE.locationCountry"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <DictionarySelector
                            className="w-full"
                            valueInput={field.value || ''}
                            onSelect={item => field.onChange(item ? String(item) : null)}
                            label={t("offer.workCountry")}
                            code="LANGUAGES"
                            groupCode="COMMUNICATION"
                            elementLabelTranslationKey="COUNTRY_NAME"
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_ONE?.locationCountry}
                        />
                    )}
                />

                {geoLoading ? (<Loading></Loading>) : (
                    <Controller
                        name="STEP_ONE.position"
                        control={ctx.formCtx.control}
                        render={({ field }) => (
                            <PositionSelector
                                label={t("offer.workLocation")}
                                name="STEP_ONE.position"
                                className="w-full"
                                value={field.value}
                                initialPosition={ preparePosition() }
                                required
                                onChange={(p) => {
                                    autofillCountryByPosition(p);
                                    field.onChange(p);
                                }}
                                error={ctx.formCtx.formState.errors.STEP_ONE?.position}
                            />
                        )}
                    />
                )}

                <Controller
                    name="STEP_ONE.dateRange"
                    control={ctx.formCtx.control}
                    rules={dateRangeStartRequired}
                    render={({ field }) => (
                        <DateRangeInput
                            label={t("offer.dateRange")}
                            name="STEP_ONE.dateRange"
                            className="w-full"
                            value={field.value}
                            required
                            onChange={(p) => {
                                field.onChange(p);
                            }}
                            error={ctx.formCtx.formState.errors.STEP_ONE?.dateRange?.message}
                        />
                    )}
                />

                <Controller
                    name="STEP_ONE.availableSlots"
                    control={ctx.formCtx.control}
                    rules={positiveInteger}
                    render={({ field }) => (
                        <FloatingInput
                            type="number"
                            label={t("offer.availableSlots")}
                            name="STEP_ONE.availableSlots"
                            className="w-full"
                            value={field.value || null}
                            required
                            onChange={(p) => {
                                field.onChange(p);
                            }}
                            error={ctx.formCtx.formState.errors.STEP_ONE?.availableSlots}
                        />
                    )}
                />

            </div>
        </>
    )
}
export default OfferFormStepOne;