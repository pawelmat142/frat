import { Controller, UseFormSetValue, UseFormWatch, Control } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TabSwitcher, { TabSwitcherOption } from "./TabSwitcher";
import DictionarySelector from "global/components/controls/DictionarySelector";
import PositionSelector from "global/components/controls/PositionSelector";
import Input from "global/components/controls/Input";
import { EmployeeProfileLocationOption, EmployeeProfileLocationOptions } from "@shared/def/employee-profile.def";
import { EmployeeProfileFormValues } from "../interface";
import React from "react";

interface Props {
    control: Control<EmployeeProfileFormValues>;
    setValue: UseFormSetValue<EmployeeProfileFormValues>;
    watch: UseFormWatch<EmployeeProfileFormValues>;
}

const EmployeeLocationSection: React.FC<Props> = ({ control, setValue, watch }) => {
    const { t } = useTranslation();
    const locationOption = watch("locationOption");
    const locationDistancePosition = watch("locationDistancePosition");

    const tabOptions: TabSwitcherOption[] = [
        {
            label: t("employeeProfile.form.locationOption.ALL_EUROPE.tab"),
            code: EmployeeProfileLocationOptions.ALL_EUROPE,
        },
        {
            label: t("employeeProfile.form.locationOption.SELECTED_COUNTRIES.tab"),
            code: EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE,
        },
        {
            label: t("employeeProfile.form.locationOption.DISTANCE.tab"),
            code: EmployeeProfileLocationOptions.DISTANCE,
        },
    ];

    return (
        <>
            <div className="flex items-center justify-between mt-5">
                <h3 className="text-lg">{t("employeeProfile.form.jobLocation")}</h3>
            </div>

            <TabSwitcher
                options={tabOptions}
                value={locationOption}
                onChange={code => setValue("locationOption", code as EmployeeProfileLocationOption)}
            />

            <div className="w-full flex mt-4">
                <div className="primary-text w-full">
                    {locationOption === EmployeeProfileLocationOptions.ALL_EUROPE && (
                        <div className="text-center mb-10">
                            {t("employeeProfile.form.locationOption.ALL_EUROPE.msg")}
                        </div>
                    )}
                    {locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE && (
                        <div className="w-full">
                            <div className="mb-10 text-center">
                                {t("employeeProfile.form.locationOption.SELECTED_COUNTRIES.msg")}
                            </div>
                            <Controller
                                name="locationCountries"
                                control={control}
                                rules={{ required: true, validate: v => !!v }}
                                render={({ field }) => (
                                    <DictionarySelector
                                        type="multi"
                                        className="w-full"
                                        valueInput={field.value ?? []}
                                        onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                                        label={t("employeeProfile.form.locationCountries")}
                                        code="LANGUAGES"
                                        elementLabelTranslationKey="COUNTRY_TRANSLATION_KEY"
                                        fullWidth
                                        required
                                    />
                                )}
                            />
                        </div>
                    )}
                    {locationOption === EmployeeProfileLocationOptions.DISTANCE && (
                        <div className="flex flex-col gap-3">
                            <div className="mb-10 text-center">
                                {t("employeeProfile.form.locationOption.DISTANCE.msg")}
                            </div>
                            <Controller
                                name="locationDistancePosition"
                                control={control}
                                rules={{ required: true, validate: v => !!v }}
                                render={({ field }) => (
                                    <PositionSelector
                                        label={t("employeeProfile.form.location")}
                                        name="locationDistance"
                                        className="w-full"
                                        value={field.value}
                                        required
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            <Controller
                                name="locationDistanceRadius"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value ?? null}
                                        label={t("employeeProfile.form.radius")}
                                        fullWidth
                                        required
                                    />
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default EmployeeLocationSection;
