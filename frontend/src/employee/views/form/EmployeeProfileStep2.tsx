import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileForm } from "@shared/interfaces/EmployeeProfileI";
import CountrySelector from "global/components/selector/CountrySelector";
import FloatingCitySearch from "global/components/controls/FloatingCitySearch";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";

interface Props {
    formRef: UseFormReturn<EmployeeProfileForm>;
}

const EmployeeProfileStep2: React.FC<Props> = ({ formRef }) => {
    const { control, formState, setValue } = formRef;
    const { t } = useTranslation();
    const required = FormValidator.required(t);

    const [countryCode, setCountryCode] = React.useState<string | null>(formRef.getValues("step2.countryCode") || null);

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
                        <CountrySelector
                            className="w-full"
                            value={field.value ?? ""}
                            onSelect={(countryCode) => {
                                setCountryCode(countryCode);
                                handleCountryChange(countryCode);
                            }}
                            label={t("employeeProfile.form.residenceCountry")}
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
                    render={({ field }) => {
                        return (
                        <FloatingCitySearch
                            id="city"
                            label={t("employeeProfile.form.city")}
                            value={field.value}
                            onChange={(position: GeocodedPosition | null) => field.onChange(position)}
                            countryCode={countryCode ?? ''}
                            fullWidth
                            required
                            error={formState.errors.step2?.geocodedPosition}
                        />
                    )}}
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
