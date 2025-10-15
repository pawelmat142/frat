import Buton from "global/components/controls/Buton";
import DictionarySelector from "global/components/controls/DictionarySelector";
import Input from "global/components/controls/Input";
import { useForm, Controller } from "react-hook-form";
import { BtnModes, BtnSizes, SelectorItem } from "global/interface/controls.interface";
import { useTranslation } from "react-i18next";

interface EmployeeProfileFormValues {
    firstName: string;
    lastName: string;
    communicationLanguage: SelectorItem<string> | null;
    residenceCountry: string;
}

const EmployeeProfileForm: React.FC = () => {

    const { t } = useTranslation();

    const { control, handleSubmit, watch } = useForm<EmployeeProfileFormValues>({
        defaultValues: {
            firstName: "",
            lastName: "",
            communicationLanguage: null,
            residenceCountry: ""
        },
    });

    const onSubmit = (data: any) => console.log(data);

    const firstName = watch("firstName");
    const lastName = watch("lastName");
    const communicationLanguage = watch("communicationLanguage");

    // console.log(firstName);
    // console.log(lastName);
    console.log(communicationLanguage);

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
                        name="communicationLanguage"
                        control={control}
                        render={({ field }) => (
                            <DictionarySelector
                                valueInput={field.value?.value ?? ""}
                                onSelect={item => field.onChange(item)}
                                label={t("employeeProfile.form.communicationLanguage")}
                                code="LANGUAGES"
                                fullWidth
                                required
                            />
                        )}
                    />
                    <Buton
                        mode={BtnModes.SECONDARY_TXT}
                        size={BtnSizes.SMALL}
                        className="ml-auto"
                        onClick={() => {
                            // TODO add communication language
                        }}
                    >
                        {t("employeeProfile.form.addLanguage")}
                    </Buton>

                </div>

                <div className="flex flex-col gap-5 mt-10">
                    <Buton type='submit'>{t('common.submit')}</Buton>
                </div>
            </form>
        </div>
    );
}

export default EmployeeProfileForm;