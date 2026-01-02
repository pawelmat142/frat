import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileForm } from "@shared/interfaces/EmployeeProfileI";
import DictionarySelector from "global/components/selector/DictionarySelector";
import FloatingCitySearch from "global/components/controls/FloatingCitySearch";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";

interface Props {
    formRef: UseFormReturn<EmployeeProfileForm>;
}

const EmployeeProfileStep2: React.FC<Props> = ({ formRef }) => {
    const { control, formState, watch, setValue } = formRef;
    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const requiredArray = FormValidator.requiredArray(t);

    const countryCode = watch("step2.countryCode");

    const handleCountryChange = (newCountryCode: string | null) => {
        setValue("step2.countryCode", newCountryCode || undefined);
        setValue("step2.geocodedPosition", undefined);
    };

    return (
        <>
            <h2 className="form-subheader">
                {t("employeeProfile.form.step2.title")}
            </h2>

            <div className="flex flex-col gap-5 md:gap-5">
                {/* Country Selector */}
                <Controller
                    name="step2.countryCode"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <DictionarySelector
                            className="w-full"
                            valueInput={field.value ?? ""}
                            onSelect={(item, el) => {
                                const countryCode = el?.values.COUNTRY_CODE
                                handleCountryChange(countryCode ?? null)
                            }}
                            label={t("employeeProfile.form.residenceCountry")}
                            code="LANGUAGES"
                            elementLabelTranslationKey="COUNTRY_NAME"
                            fullWidth
                            required
                            error={formState.errors.step2?.countryCode}
                        />
                    )}
                />

                {/* City Search */}
                <Controller
                    name="step2.geocodedPosition"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingCitySearch
                            id="city"
                            label={t("employeeProfile.form.city")}
                            value={field.value}
                            onChange={(position: GeocodedPosition | null) => field.onChange(position)}
                            countryCode={countryCode}
                            fullWidth
                            required
                            error={formState.errors.step2?.geocodedPosition}
                        />
                    )}
                />

                {/* <Controller TODO Other step
                    name="step2.skills"
                    control={control}
                    rules={requiredArray}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i)))}
                            label={t("employeeProfile.form.skills")}
                            code="SKILLS"
                            fullWidth
                            required
                            error={formState.errors.step2?.skills}
                        />
                    )}
                />

                <Controller
                    name="step2.certificates"
                    control={control}
                    rules={requiredArray}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i)))}
                            label={t("employeeProfile.form.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                            required
                            error={formState.errors.step2?.certificates}
                        />
                    )}
                />  */}
            </div>
        </>
    );
};

export default EmployeeProfileStep2;
