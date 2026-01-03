import React, { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileForm, EmployeeProfileLocationOption, EmployeeProfileLocationOptions } from "@shared/interfaces/EmployeeProfileI";
import CountrySelector from "global/components/selector/CountrySelector";
import FloatingCitySearch from "global/components/controls/FloatingCitySearch";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";
import TabSwitcher, { TabSwitcherOption } from "employee/components/TabSwitcher";
import DictionarySelector from "global/components/selector/DictionarySelector";
import PositionSelector from "global/components/selector/position/PositionSelector";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";

interface Props {
    formRef: UseFormReturn<EmployeeProfileForm>;
    initPosition?: () => void;
}

const EmployeeProfileStep2: React.FC<Props> = ({ formRef, initPosition }) => {
    const { control, formState, setValue, watch } = formRef;
    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const [countryCode, setCountryCode] = useState<string | null>(formRef.getValues("step2.countryCode") || null);

    const locationOption = watch("step2.locationOption");

    // residenceCountry
    const tabOptions: TabSwitcherOption[] = [
        {
            label: t(`employeeProfile.form.locationOption.${EmployeeProfileLocationOptions.POSITION}.tab`),
            code: EmployeeProfileLocationOptions.POSITION,
        },
        {
            label: t(`employeeProfile.form.locationOption.${EmployeeProfileLocationOptions.SELECTED_COUNTRIES}.tab`),
            code: EmployeeProfileLocationOptions.SELECTED_COUNTRIES,
        },
        {
            label: t(`employeeProfile.form.locationOption.${EmployeeProfileLocationOptions.ALL_EUROPE}.tab`),
            code: EmployeeProfileLocationOptions.ALL_EUROPE,
        },
    ];
    const msgClass = "secondary-text mb-5"


    const handleCountryChange = (newCountryCode: string | null) => {
        setValue("step2.countryCode", newCountryCode || undefined);
        setValue("step2.geocodedPosition", undefined);
    };

    return (
        <>
            <h2 className="form-subheader">
                {t("employeeProfile.form.step2.title")}
            </h2>

            <div className="flex flex-col gap-5 md:gap-5 mt-5">
                <TabSwitcher
                    options={tabOptions}
                    value={locationOption}
                    onChange={code => setValue("step2.locationOption", code as EmployeeProfileLocationOption)}
                />

                <div className="w-full flex mt-4">
                    <div className="primary-text w-full">
                        {locationOption === EmployeeProfileLocationOptions.ALL_EUROPE && (
                            <div className={msgClass}>
                                {t("employeeProfile.form.locationOption.ALL_EUROPE.msg")}
                            </div>
                        )}
                        {locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES && (
                            <div className="w-full">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.locationOption.SELECTED_COUNTRIES.msg")}
                                </div>
                                <Controller
                                    name="step2.locationCountries"
                                    control={control}
                                    rules={required}
                                    render={({ field }) => (
                                        <DictionarySelector
                                            type="multi"
                                            className="w-full"
                                            valueInput={field.value ?? []}
                                            onSelectMulti={items => field.onChange(items.map(i => String(i)))}
                                            label={t("employeeProfile.form.locationCountries")}
                                            code="LANGUAGES"
                                            elementLabelTranslationKey="COUNTRY_NAME"
                                            fullWidth
                                            required
                                            error={formState?.errors.step3?.locationCountries}
                                        />
                                    )}
                                />
                            </div>
                        )}
                        {locationOption === EmployeeProfileLocationOptions.POSITION && (
                            <div className="flex flex-col gap-3">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.locationOption.POSITION.msg")}
                                </div>


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
                                            label={t("employeeProfile.form.locationCountry")}
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
                                        )
                                    }}
                                />

                                <Button fullWidth mode={BtnModes.PRIMARY_TXT}
                                    onClick={() => {
                                        initPosition?.();
                                    }}
                                >{t("employeeProfile.form.resetLocation")}</Button>

                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-5 md:gap-5">



            </div>
        </>
    );
};

export default EmployeeProfileStep2;
