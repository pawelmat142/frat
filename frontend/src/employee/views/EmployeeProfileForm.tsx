import Buton from "global/components/controls/Buton";
import DictionarySelector from "global/components/controls/DictionarySelector";
import Input from "global/components/controls/Input";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import CommunicationLanguagesSection from "../components/CommunicationLanguagesSection";

interface EmployeeProfileFormValues {
    firstName: string;
    lastName: string;
    communicationLanguages: string[];
    residenceCountry: string;
}

const EmployeeProfileForm: React.FC = () => {

    const { t } = useTranslation();

    const { control, handleSubmit, watch, setValue } = useForm<EmployeeProfileFormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            communicationLanguages: [""],
            residenceCountry: ""
        },
    });

    const onSubmit = (data: any) => console.log(data);

    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const communicationLanguages = watch("communicationLanguages");

    // console.log(firstName);
    // console.log(lastName);
    console.log(communicationLanguages);

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

                    <CommunicationLanguagesSection
                        control={control}
                        setValue={setValue}
                        watch={watch}
                    />

                    <div className="flex items-center justify-between mb-4 mt-5">
                        <h3 className="text-lg">{t("employeeProfile.form.address")}</h3>
                    </div>

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
                                fullWidth
                                required
                            />
                        )}
                    />

                </div>

                <div className="flex flex-col gap-5 mt-10">
                    <Buton type='submit'>{t('common.submit')}</Buton>
                </div>
            </form>
        </div>
    );
}

export default EmployeeProfileForm;