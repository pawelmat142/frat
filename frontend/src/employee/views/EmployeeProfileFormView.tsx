import Button from "global/components/controls/Button";
import DictionarySelector from "global/components/controls/DictionarySelector";
import Input from "global/components/controls/Input";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import React from "react";

import CommunicationLanguagesSection from "../components/CommunicationLanguagesSection";
import EmployeeLocationSection from "../components/EmployeeLocationSection";
import { EmployeeProfileForm } from "@shared/def/employee-profile.def";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileLocationOptions } from "@shared/interfaces/EmployeeProfileI";
import { toast } from "react-toastify";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import Loading from "global/components/Loading";
import { Utils } from "global/utils";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useUserContext } from "user/UserProvider";
import { useNavigate } from "react-router-dom";

const EmployeeProfileFormView: React.FC = () => {

    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const [loading, setLoading] = React.useState<boolean>(false);
    const { employeeProfile, initEmployeeProfile } = useUserContext();
    const navigate = useNavigate();
    const isDevMode = Utils.isDevMode();

    const { control, handleSubmit, watch, setValue, reset, formState } = useForm<EmployeeProfileForm>({
        defaultValues: {
            firstName: "",
            lastName: "",
            residenceCountry: "",
            skills: [],
            certificates: [],
            communicationLanguages: [""],
            locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,
            locationCountries: [],
            locationDistancePosition: undefined,
            locationDistanceRadius: NaN,
        },
    });

    React.useEffect(() => {
        if (employeeProfile) {
            let locationDistancePosition: any = undefined;
            if (employeeProfile.point && Array.isArray(employeeProfile.point.coordinates)) {
                locationDistancePosition = {
                    lat: employeeProfile.point.coordinates[1],
                    lng: employeeProfile.point.coordinates[0],
                    address: employeeProfile.address
                };
            }
            reset({
                firstName: employeeProfile.firstName || "",
                lastName: employeeProfile.lastName || "",
                residenceCountry: employeeProfile.residenceCountry || "",
                skills: employeeProfile.skills || [],
                certificates: employeeProfile.certificates || [],
                communicationLanguages: employeeProfile.communicationLanguages || [""] ,
                locationOption: employeeProfile.locationOption || EmployeeProfileLocationOptions.ALL_EUROPE,
                locationCountries: employeeProfile.locationCountries || [],
                locationDistancePosition,
                locationDistanceRadius: employeeProfile.pointRadius ?? NaN,
            });
        }
    }, [employeeProfile, reset]);

    const handleDevFill = () => {
        setValue("firstName", "Pawel");
        setValue("lastName", "Mat");
        setValue("residenceCountry", "pl");
        setValue("skills", ["ONE", "TWO"]);
        setValue("certificates", ["ONE"]);
        setValue("communicationLanguages", ["en", "pl"]);
    };

    const onSubmit = async (form: EmployeeProfileForm) => {

        if (employeeProfile) {
            await updateEmployeeProfile(form);
            return;
        }

        try {
            setLoading(true);
            const result = await EmployeeProfileService.createEmployeeProfile(form);
            initEmployeeProfile()
            toast.success(t("employeeProfile.form.submitSuccess"));
            navigate(-1)
        } catch (error) {
            console.error("Error creating employee profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateEmployeeProfile = async (form: EmployeeProfileForm) => {
        try {
            setLoading(true);
            const result = await EmployeeProfileService.updateEmployeeProfile(form);
            initEmployeeProfile()
            toast.success(t("employeeProfile.form.submitSuccess"));
            navigate(-1)
        } catch (error) {
            console.error("Error updating employee profile:", error);
        } finally {
            setLoading(false);
        }
    }

    // TODO date periods 
    // TODO
    const formValues = watch();
    console.log(formValues)

    if (loading) {
        return <Loading></Loading>
    }

    return (
        <div className="w-full px-5 py-3 relative">

            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20 max-w-xl mx-auto mb-20 border border-color">

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{t("employeeProfile.form.title")}</h2>

                    {isDevMode && (
                        <Button onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT} className="ripple mb-2">
                            DEV FILL
                        </Button>)}
                </div>

                <div className="flex flex-col gap-3">

                    <Controller
                        name="firstName"
                        control={control}
                        rules={required}
                        render={({ field }) => <Input
                            {...field}
                            label={t("employeeProfile.form.firstName")}
                            fullWidth
                            required
                            error={formState.errors.firstName}
                        />
                        }
                    />
                    <Controller
                        name="lastName"
                        control={control}
                        rules={required}
                        render={({ field }) => <Input
                            {...field}
                            label={t("employeeProfile.form.lastName")}
                            fullWidth
                            required
                            error={formState.errors.lastName}
                        />
                        }
                    />
                    <Controller
                        name="residenceCountry"
                        control={control}
                        rules={required}
                        render={({ field }) => <DictionarySelector
                            className="w-full"
                            valueInput={field.value ?? ""}
                            onSelect={item => field.onChange(item ? String(item.value) : "")}
                            label={t("employeeProfile.form.residenceCountry")}
                            code="LANGUAGES"
                            groupCode="COMMUNICATION"
                            elementLabelTranslationKey="COUNTRY_TRANSLATION_KEY"
                            fullWidth
                            required
                            error={formState.errors.residenceCountry}
                        />
                        }
                    />

                    <Controller
                        name="skills"
                        control={control}
                        rules={required}
                        render={({ field }) => <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("employeeProfile.form.skills")}
                            code="SKILLS"
                            fullWidth
                            required
                            error={formState.errors.skills}
                        />
                        }
                    />

                    <Controller
                        name="certificates"
                        control={control}
                        rules={required}
                        render={({ field }) => <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("employeeProfile.form.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                            required
                            error={formState.errors.certificates}
                        />
                        }
                    />

                    <CommunicationLanguagesSection
                        control={control}
                        setValue={setValue}
                        watch={watch}
                        formState={formState}
                    />

                    <EmployeeLocationSection
                        control={control}
                        setValue={setValue}
                        watch={watch}
                        formState={formState}
                    />

                </div>

                <div className="flex flex-col gap-5 mt-10">
                    <Button type='submit'>
                        {employeeProfile ? t('common.save') : t('common.submit')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default EmployeeProfileFormView;