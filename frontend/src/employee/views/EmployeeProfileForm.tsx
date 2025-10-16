import Buton from "global/components/controls/Buton";
import DictionarySelector from "global/components/controls/DictionarySelector";
import Input from "global/components/controls/Input";

import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import React from "react";

import CommunicationLanguagesSection from "../components/CommunicationLanguagesSection";
import TabSwitcher, { TabSwitcherOption } from "../components/TabSwitcher";
import { EmployeeProfileLocationOption, EmployeeProfileLocationOptions } from "@shared/def/employee-profile.def";

interface EmployeeProfileFormValues {
    firstName: string;
    lastName: string;
    communicationLanguages: string[];
    residenceCountry: string;

    locationOption: EmployeeProfileLocationOption;
    locationCountries: string[];
}


const EmployeeProfileForm: React.FC = () => {

    const { t } = useTranslation();

    const { control, handleSubmit, watch, setValue } = useForm<EmployeeProfileFormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            communicationLanguages: [""],
            residenceCountry: "",
            locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,

            locationCountries: [""]
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

                    <div className="flex items-center justify-between mt-5">
                        <h3 className="text-lg">{t("employeeProfile.form.jobLocation")}</h3>
                    </div>

                    {/* Tab Switcher */}
                    <TabSwitcher
                        options={tabOptions}
                        value={locationOption}
                        onChange={code => setValue("locationOption", code as EmployeeProfileLocationOption)}
                    />

                    {/* Tab message depending on selected option */}
                    <div className="w-full flex mt-4">
                        <div className="primary-text w-full">
                            {locationOption === EmployeeProfileLocationOptions.ALL_EUROPE && (
                                <div className="text-center">
                                    {t("employeeProfile.form.locationOption.ALL_EUROPE.msg")}
                                </div>
                            )}
                            {locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES_EUROPE && (
                                <div className="w-full">
                                    <div className="mb-5 text-center">
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
                                <div>
                                    <div className="mb-5 text-center">
                                        {t("employeeProfile.form.locationOption.DISTANCE.msg")}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>


                <div className="flex flex-col gap-5 mt-10">
                    <Buton type='submit'>{t('common.submit')}</Buton>
                </div>
            </form>
        </div>
    );
}

export default EmployeeProfileForm;