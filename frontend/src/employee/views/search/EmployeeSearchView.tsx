import { useAuthContext } from "auth/AuthProvider";
import Button from "global/components/controls/Button";
import DictionarySelector from "global/components/controls/DictionarySelector";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Search from '@mui/icons-material/Search'
import Input from "global/components/controls/Input";
import PositionSelector from "global/components/controls/PositionSelector";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import { EmployeeProfileI, EmployeeProfileSearchForm } from "@shared/interfaces/EmployeeProfileI";
import EmployeeProfileTile from "employee/components/EmployeeProfileTile";
import { DictionaryService } from "global/services/DictionaryService";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import Loading from "global/components/Loading";

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
    });

    // Debounced freeText state
    const [freeTextInput, setFreeTextInput] = useState('');
    // For aborting previous search requests
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce effect: update RHF value after 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            setValue('freeText', freeTextInput, { shouldValidate: true });
        }, 500);
        return () => clearTimeout(handler);
    }, [freeTextInput, setValue]);

    const [loading, setLoading] = useState(false);
    const [locationCountryCode, setLocationCountryCode] = useState<string | null>(null);
    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null);
    const [employeeProfiles, setEmployeeProfiles] = useState<EmployeeProfileI[]>([]);
    const formValues = watch();
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const initDictionary = async () => {
            setLoading(true);
            const dictionary = await DictionaryService.getDictionary('LANGUAGES');
            setLanguagesDictionary(dictionary);
            setLoading(false);
        }
        initDictionary();
    }, []);

    useEffect(() => {
        // If only freeText changed, debounce; else, search natychmiast
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        // If freeText changed, debounce search
        debounceTimer.current = setTimeout(() => {
            doSearch();
        }, 500);

        // If any other field than freeText changed, search natychmiast
        // (But since freeText is debounced, this covers all cases)
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [
        formValues.skills,
        formValues.certificates,
        formValues.communicationLanguages,
        formValues.locationCountry,
        formValues.locationPosition,
        freeTextInput
    ]);

    // Główna funkcja search z obsługą abortowania poprzednich requestów
    const doSearch = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        try {
            setLoading(true);
            const result = await EmployeeProfileService.searchEmployeeProfiles(
                { ...formValues, freeText: freeTextInput },
            );
            setEmployeeProfiles(result);
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // Request anulowany, nie loguj
            } else {
                console.error("Error creating employee profile:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full px-5 py-3 relative">

            <div className="max-w-4xl mx-auto">
                <form
                    onSubmit={e => { e.preventDefault(); }}
                    noValidate
                    className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20  mb-20 border border-color">

                    {/* section header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">{t("employeeProfile.search.label")}</h2>
                    </div>

                    <Controller
                        name="freeText"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                value={freeTextInput}
                                onChange={e => setFreeTextInput(e.target.value)}
                                label={t("employeeProfile.form.freeText")}
                                fullWidth
                                error={formState.errors.freeText}
                            />
                        )}
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

                <div className="results">
                    {!!languagesDictionary && employeeProfiles.map(profile => (
                        <EmployeeProfileTile key={profile.employeeProfileId} employeeProfile={profile} languagesDictionary={languagesDictionary} />
                    ))}
                </div>

                {loading && (<div>
                    <Loading></Loading>
                </div>)}
                <div></div>
            </div>

        </div>
    )
}

export default EmployeeSearchView;