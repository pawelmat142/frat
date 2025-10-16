import Button from "global/components/controls/Button";
import DictionarySelector from "global/components/controls/DictionarySelector";
import Input from "global/components/controls/Input";

import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import React from "react";

import CommunicationLanguagesSection from "../components/CommunicationLanguagesSection";
import EmployeeLocationSection from "../components/EmployeeLocationSection";
import { TabSwitcherOption } from "../components/TabSwitcher";
import { EmployeeProfileLocationOptions } from "@shared/def/employee-profile.def";
import { EmployeeProfileFormValues } from "../interface";

// TODO form validation msgs
const EmployeeProfileForm: React.FC = () => {

    const { t } = useTranslation();

    const { control, handleSubmit, watch, setValue } = useForm<EmployeeProfileFormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            communicationLanguages: [""],
            residenceCountry: "",
            locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,

            locationCountries: [""],
            locationDistancePosition: undefined,
            locationDistanceRadius: NaN,
        },
    });

    const onSubmit = (data: any) => console.log(data);

    const formValues = watch();
    console.log(formValues)

    // Tab state, sync with locationOption
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
    const locationOption = watch("locationOption");

    return (
        <div className="w-full px-5 py-3 relative">

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20 max-w-xl mx-auto mb-20 border border-color">

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{t("employeeProfile.form.title")}</h2>
                </div>

                <div className="flex flex-col gap-3">

                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => <Input {...field} label={t("employeeProfile.form.firstName")} fullWidth required />}
                    />
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => <Input {...field} label={t("employeeProfile.form.lastName")} fullWidth required />}
                    />
                    <Controller
                        name="residenceCountry"
                        control={control}
                        rules={{ required: true, validate: v => !!v }}
                        render={({ field }) => (
                            <DictionarySelector
                                className="w-full"
                                valueInput={field.value ?? ""}
                                onSelect={item => field.onChange(item ? String(item.value) : "")}
                                label={t("employeeProfile.form.residenceCountry")}
                                code="LANGUAGES"
                                groupCode="COMMUNICATION"
                                elementLabelTranslationKey="COUNTRY_TRANSLATION_KEY"
                                fullWidth
                                required
                            />
                        )}
                    />

                    <CommunicationLanguagesSection
                        control={control}
                        setValue={setValue}
                        watch={watch}
                    />

                    <EmployeeLocationSection control={control} setValue={setValue} watch={watch} />

                </div>


                <div className="flex flex-col gap-5 mt-10">
                    <Button type='submit'>{t('common.submit')}</Button>
                </div>
            </form>
        </div>
    );
}

export default EmployeeProfileForm;