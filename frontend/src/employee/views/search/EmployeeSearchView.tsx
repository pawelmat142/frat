import { useAuthContext } from "auth/AuthProvider";
import Button from "global/components/controls/Button";
import DictionarySelector from "global/components/controls/DictionarySelector";
import { FormValidator } from "global/FormValidator";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Search from '@mui/icons-material/Search'
import Input from "global/components/controls/Input";
import PositionSelector from "global/components/controls/PositionSelector";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import { EmployeeProfileSearchForm } from "@shared/interfaces/EmployeeProfileI";

const EmployeeSearchView: React.FC = () => {

    const { t } = useTranslation();
    const { me } = useAuthContext()
    const { control, handleSubmit, watch, setValue, reset, formState } = useForm<EmployeeProfileSearchForm>({
        defaultValues: {
            freeText: '',
            skills: [],
            certificates: [],
            communicationLanguages: [],
            locationCountry: null
        }
    })

    const [loading, setLoading] = useState(false);
    const [locationCountryCode, setLocationCountryCode] = useState<string | null>(null);

    const onSubmit = async (form: EmployeeProfileSearchForm) => {
        try {
            // TODO
            setLoading(true);
            console.log(form)
            const result = await EmployeeProfileService.searchEmployeeProfiles(form)
            console.log(result)
        } catch (error) {
            console.error("Error creating employee profile:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full px-5 py-3 relative">
            <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20 max-w-4xl mx-auto mb-20 border border-color">

                {/* section header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{t("employeeProfile.search.label")}</h2>
                </div>

                <Controller
                    name="freeText"
                    control={control}
                    render={({ field }) => <Input
                        {...field}
                        value={field.value ?? ''}
                        label={t("employeeProfile.form.freeText")}
                        fullWidth
                        error={formState.errors.freeText}
                    />
                    }
                />

                {/* free text search */}
                <h3 className="text-lg">Filtry</h3>

                {/* filters */}
                <div className="flex gap-4 items-center">
                    <Controller
                        name="skills"
                        control={control}
                        render={({ field }) => <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("employeeProfile.form.skills")}
                            code="SKILLS"
                            fullWidth
                            error={formState.errors.skills}
                        />
                        }
                    />

                    <Controller
                        name="certificates"
                        control={control}
                        render={({ field }) => <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("employeeProfile.form.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                            error={formState.errors.certificates}
                        />
                        }
                    />

                    <Controller
                        name="communicationLanguages"
                        control={control}
                        render={({ field }) => <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("employeeProfile.form.communicationLanguages")}
                            code="LANGUAGES"
                            groupCode="COMMUNICATION"
                            fullWidth
                            error={formState.errors.communicationLanguages}
                        />
                        }
                    />

                </div>

                <div className="flex gap-4 items-center">
                    <Controller
                        name="locationCountry"
                        control={control}
                        render={({ field }) => <DictionarySelector
                            className="w-full"
                            valueInput={field.value ?? ''}
                            onSelect={(item, element) => {
                                const countryCode = element ? String(element?.values.COUNTRY_CODE) : null;
                                setLocationCountryCode(countryCode);
                                field.onChange(item ? String(item.value) : "")
                            }}
                            label={t("employeeProfile.form.locationCountry")}
                            code="LANGUAGES"
                            groupCode="COMMUNICATION"
                            elementLabelTranslationKey="COUNTRY_NAME"
                            fullWidth
                            error={formState.errors.locationCountry}
                        />
                        }
                    />

                    <Controller
                        name="locationPosition"
                        control={control}
                        render={({ field }) => (
                            <PositionSelector
                                label={t("employeeProfile.form.location")}
                                name="locationPosition"
                                className="w-full"
                                value={field.value}
                                disabled={!locationCountryCode}
                                onChange={field.onChange}
                                error={formState?.errors.locationPosition}
                                initializePositionByCountryCode={locationCountryCode || undefined}
                            />
                        )}
                    />
                </div>

                <Button type="submit" className="min-w-40 pr-5 mt-5 mx-auto">
                    <Search />
                    Szukaj
                </Button>

            </form>
        </div>
    )
}

export default EmployeeSearchView;