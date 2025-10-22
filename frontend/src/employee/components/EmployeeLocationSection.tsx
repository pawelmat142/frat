import { Controller, UseFormSetValue, UseFormWatch, Control, FormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TabSwitcher, { TabSwitcherOption } from "./TabSwitcher";
import DictionarySelector from "global/components/controls/DictionarySelector";
import PositionSelector from "global/components/controls/PositionSelector";
import Input from "global/components/controls/Input";
import { EmployeeProfileForm } from "@shared/def/employee-profile.def";
import React from "react";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileLocationOptions, EmployeeProfileLocationOption } from "@shared/interfaces/EmployeeProfileI";

interface Props {
    control: Control<EmployeeProfileForm>;
    setValue: UseFormSetValue<EmployeeProfileForm>;
    watch: UseFormWatch<EmployeeProfileForm>;
    formState?: FormState<EmployeeProfileForm>;
}

const EmployeeLocationSection: React.FC<Props> = ({ control, setValue, watch, formState }) => {
    const locationOption = watch("locationOption");

    const { t } = useTranslation();

    const required = FormValidator.required(t);

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
                                rules={required}
                                render={({ field }) => (
                                    <DictionarySelector
                                        type="multi"
                                        className="w-full"
                                        valueInput={field.value ?? []}
                                        onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                                        label={t("employeeProfile.form.locationCountries")}
                                        code="LANGUAGES"
                                        elementLabelTranslationKey="COUNTRY_NAME"
                                        fullWidth
                                        required
                                        error={formState?.errors.locationCountries}
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
                                rules={required}
                                render={({ field }) => (
                                    <PositionSelector
                                        label={t("employeeProfile.form.location")}
                                        name="locationDistance"
                                        className="w-full"
                                        value={field.value}
                                        required
                                        onChange={field.onChange}
                                        error={formState?.errors.locationDistancePosition}
                                    />
                                )}
                            />
                            <Controller
                                name="locationDistanceRadius"
                                rules={required}
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value ?? null}
                                        label={t("employeeProfile.form.radius")}
                                        fullWidth
                                        required
                                        error={formState?.errors.locationDistanceRadius}
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
