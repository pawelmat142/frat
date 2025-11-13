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
import { BtnModes } from "global/interface/controls.interface";
import DateRangeInput from "global/components/controls/DateRangeInput";

const EmployeeSearchView: React.FC = () => {

    // TODO szukanie po samym start
    // TODO domyslne sortowanie po dacie rozpoczecia
    // TODO opcje sortowania na widoku
    // TODO implementacja sortowanie w backendzie
    // TODO http://localhost:3000/admin-panel/employee-profiles - dodać kolumny z datami /opcjami dostępności
    // TODO prezentacja employee profile - card? + daty
    // TODO prezentacja zakresów dat
    const { t } = useTranslation();
    const { me } = useAuthContext()

    const itemsPerPage = 5;

    const { control, handleSubmit, watch, setValue, reset, formState } = useForm<EmployeeProfileSearchForm>({
        defaultValues: {
            freeText: '',
            skills: [],
            certificates: [],
            communicationLanguages: [],
            locationCountry: null,
            skip: 0,
            limit: itemsPerPage,
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
    }, [freeTextInput]);

    const [loading, setLoading] = useState(false);
    const [locationCountryCode, setLocationCountryCode] = useState<string | null>(null);
    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null);
    const [employeeProfiles, setEmployeeProfiles] = useState<EmployeeProfileI[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [count, setCount] = useState(0);
    const totalPages = Math.ceil(count / itemsPerPage);

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

    const formValues = watch();

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
        freeTextInput,
        formValues.dateRange,
    ]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            setValue('skip', (newPage - 1) * itemsPerPage);
            doSearch();
        }
    };

    // Główna funkcja search z obsługą abortowania poprzednich requestów

    const doSearch = async () => {
        const formValues = watch()
        console.log(formValues)
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;
        try {
            setLoading(true);
            const result = await EmployeeProfileService.searchEmployeeProfiles(formValues)
            setEmployeeProfiles(result.profiles);
            setCount(result.count);
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

                    <div className="flex gap-4 items-center">
                        <Controller
                            name="dateRange"
                            control={control}
                            render={({ field }) => (
                                <DateRangeInput
                                    label="TODO date range"
                                    name="dateRange"
                                    className="w-full"
                                    value={field.value}
                                    onChange={(r) => {
                                        field.onChange(r)}}
                                    error={formState?.errors.dateRange?.message}
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

                {loading ? (<div>
                    <Loading></Loading>
                </div>) : (
                    <div className="flex-[2] flex justify-center items-center gap-4 mt-5 mb-10">
                        <Button
                            mode={BtnModes.PRIMARY_TXT}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="secondary-text whitespace-nowrap">
                            Page {currentPage} of {totalPages} ({count} items)
                        </span>
                        <Button
                            mode={BtnModes.PRIMARY_TXT}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
                <div></div>
            </div>

        </div>
    )
}

export default EmployeeSearchView;