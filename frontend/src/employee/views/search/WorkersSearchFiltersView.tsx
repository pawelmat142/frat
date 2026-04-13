import { useTranslation } from "react-i18next";
import Loading from "global/components/Loading";
import { WorkersSearchContextProps, WorkerDefaultFilters, useWorkersSearch } from "./WorkersSearchProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { DateRange, WorkerSearchSortOptions, WorkerSearchFilters } from "@shared/interfaces/WorkerI";
import { BtnModes, BtnSizes, SelectorItem } from "global/interface/controls.interface";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { Controller, useForm } from "react-hook-form";
import { FormValidator } from "global/FormValidator";
import Button from "global/components/controls/Button";
import DictionarySelector from "global/components/selector/DictionarySelector";
import { Ico } from "global/icon.def";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "user/UserProvider";
import { GoogleMapService } from "global/services/GoogleMapService";
import CountryAndLocationSelector, { LocationFilterValue } from "global/components/controls/CountryAndLocationSelector";
import { AppConfig } from "@shared/AppConfig";
import Header from "global/components/Header";
import { DateUtil } from "@shared/utils/DateUtil";

interface Props {
    onClose?: () => void;
}

const WorkersSearchFiltersView: React.FC<Props> = ({ onClose }) => {

    const { t } = useTranslation()
    const globalCtx = useGlobalContext()
    const userCtx = useUserContext();
    const ctx: WorkersSearchContextProps = useWorkersSearch()

    const hasAutofilledLocation = useRef(false);

    const [loadingCountry, setLoadingCountry] = useState(false);

    const f = useForm<WorkerSearchFilters>({
        defaultValues: ctx.filters
    })

    const formState = f.watch()

    useEffect(() => {
        const autofillLocationCountry = async () => {
            if (!userCtx.position) {
                return;
            }
            if (hasAutofilledLocation.current) return; // Prevent re-execution
            if (!formState.geocodedPosition && userCtx.position) {
                try {
                    setLoadingCountry(true);
                    const geoPosition = await GoogleMapService.getGeoPosition(userCtx.position);
                    const countryCode = geoPosition?.country?.toLocaleLowerCase();
                    const languages = globalCtx.dics.languages!;
                    const langAllowed = languages.elements.map((lang) => lang.code.toLocaleLowerCase()).includes(countryCode || '')
                    if (langAllowed) {
                        f.setValue('locationCountry', countryCode || '');
                    }
                    hasAutofilledLocation.current = true; // Mark as executed
                }
                catch (error) {
                    console.error('Error initializing location country:', error);
                } finally {
                    setLoadingCountry(false);
                }
            }
        }
        if (!ctx.filters.locationCountry) {
            autofillLocationCountry();
        }
        if (!ctx.filters.startDate) {
            f.setValue('startDate', DateUtil.toLocalDateString(new Date()));
        }
    }, [])

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return <Loading></Loading>
    }

    const startDateRequired = FormValidator.required(t);

    const submit = async () => {
        ctx.setFiltersWithSearchAndNavigate(formState);
    }

    const sortOptionItems: SelectorItem<string>[] = Object.keys(WorkerSearchSortOptions).map((option: string) => ({
        value: option,
        label: t('employeeProfile.form.sortOptions.' + option)
    }))

    const resetFilters = () => {
        f.reset(WorkerDefaultFilters);
        ctx.resetFilters()
    }

    const prepareDateRange = (): DateRange | null => {
        const localFilters = formState
        if (!localFilters.startDate) {
            return null
        }
        return {
            start: localFilters.startDate,
            end: localFilters.endDate
        }
    }

    const updateLocationFilter = (loc: LocationFilterValue) => {
        f.setValue('locationCountry', loc.locationCountry);
        f.setValue('geocodedPosition', loc.geocodedPosition);
        f.setValue('positionRadiusKm', loc.positionRadiusKm);
    };

    return (
        <div className="relative flex flex-col primary-bg h-full">
            <Header onBack={() => onClose?.()} title={t("employeeProfile.searchTitle")} />

            <form className='flex flex-col flex-1 form-view'
                noValidate
                onSubmit={f.handleSubmit(submit)}
            >
                <Controller
                    name="startDate"
                    control={f.control}
                    rules={startDateRequired}
                    render={({ field }) => (
                        <DateRangeInputViewSelector
                            label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label") + '*'}
                            className="w-full mt-3"
                            value={prepareDateRange()}
                            error={f.formState.errors.startDate?.message}
                            onChange={(dateRange) => {
                                const filters: WorkerSearchFilters = {
                                    ...formState,
                                    startDate: dateRange?.start || null,
                                    endDate: dateRange?.end || null
                                };
                                f.reset(filters)
                            }}
                        />
                    )}
                />

                <CountryAndLocationSelector
                    className="w-full mt-5"
                    value={{
                        locationCountry: formState.locationCountry ?? null,
                        geocodedPosition: formState.geocodedPosition ?? null,
                        positionRadiusKm: formState.positionRadiusKm,
                    }}
                    loadingInput={loadingCountry}
                    onChange={updateLocationFilter}
                    errors={{
                        locationCountry: f.formState.errors.locationCountry,
                        geocodedPosition: f.formState.errors.geocodedPosition as { message?: string } | undefined,
                    }}
                    radiusSteps={[...AppConfig.RADIUS_STEPS_KM]}
                />

                <Controller
                    name="categories"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type='multi'
                            className="w-full mt-5"
                            valueInput={field.value}
                            onSelectMulti={items => {
                                field.onChange(items);
                            }}
                            label={t("offer.filters.categories")}
                            code="WORK_CATEGORY"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="certificates"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type='multi'
                            className="w-full mt-3"
                            valueInput={field.value}
                            onSelectMulti={items => {
                                field.onChange(items);
                            }}
                            label={t("employeeProfile.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="communicationLanguages"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type='multi'
                            className="w-full mt-3"
                            valueInput={field.value}
                            onSelectMulti={items => {
                                field.onChange(items);
                            }}
                            label={t("employeeProfile.form.communicationLanguages")}
                            code="LANGUAGES"
                            groupCode="COMMUNICATION"
                            fullWidth
                        />
                    )}
                />

                {/* TODO sort option select functionality... */}
                {/* <Controller
                    name="sortBy"
                    control={f.control}
                    render={({ field }) => (
                        <FloatingSelector
                            className="w-full mt-3"
                            items={sortOptionItems}
                            value={sortOptionItems.find(i => i.value === ctx.filters.sortBy) || null}
                            onSelect={item => {
                                field.onChange(item);
                            }}
                            label={t("employeeProfile.form.sortOptions.title")}
                            fullWidth
                        ></FloatingSelector>
                    )}
                /> */}


                <div className="mt-10">
                    <Button
                        size={BtnSizes.LARGE}
                        mode={BtnModes.PRIMARY} fullWidth type="submit">
                        <Ico.SEARCH size={22}></Ico.SEARCH>
                        {t("common.search")}
                    </Button>
                    <Button onClick={resetFilters} mode={BtnModes.ERROR_TXT} className="mt-3" fullWidth>
                        {t("common.reset")}
                    </Button>
                </div>


            </form>
        </div>
    )
}


export default WorkersSearchFiltersView;