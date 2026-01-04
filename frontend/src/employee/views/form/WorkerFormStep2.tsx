import React, { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { WorkerForm, WorkerLocationOption, WorkerLocationOptions } from "@shared/interfaces/WorkerProfileI";
import CountrySelector from "global/components/selector/CountrySelector";
import FloatingCitySearch from "global/components/controls/FloatingCitySearch";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";
import TabSwitcher, { TabSwitcherOption } from "employee/components/TabSwitcher";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
    initPosition?: () => void;
}


const WorkerFormStep2: React.FC<Props> = ({ formRef, initPosition }) => {
    const { control, formState, setValue, watch } = formRef;
    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const [countryCode, setCountryCode] = useState<string | null>(formRef.getValues("step2.countryCode") || null);

    const locationOption = watch("step2.locationOption");

    const tabOptions: TabSwitcherOption[] = [
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.POSITION}.tab`),
            code: WorkerLocationOptions.POSITION,
        },
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.SELECTED_COUNTRIES}.tab`),
            code: WorkerLocationOptions.SELECTED_COUNTRIES,
        },
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.ALL_EUROPE}.tab`),
            code: WorkerLocationOptions.ALL_EUROPE,
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
                    onChange={code => setValue("step2.locationOption", code as WorkerLocationOption)}
                />

                <div className="w-full flex mt-4">
                    <div className="primary-text w-full">
                        {locationOption === WorkerLocationOptions.ALL_EUROPE && (
                            <div className={msgClass}>
                                {t("employeeProfile.form.locationOption.ALL_EUROPE.msg")}
                            </div>
                        )}
                        {locationOption === WorkerLocationOptions.SELECTED_COUNTRIES && (
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
                                            error={formState?.errors.step2?.locationCountries}
                                        />
                                    )}
                                />
                            </div>
                        )}
                        {locationOption === WorkerLocationOptions.POSITION && (
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

export default WorkerFormStep2;
