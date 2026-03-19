import { useTranslation } from "react-i18next";
import Loading from "global/components/Loading";
import { WorkersSearchContextProps, WorkerDefaultFilters, useWorkersSearch } from "./WorkersSearchProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { DateRange, WorkerSearchSortOptions, WorkerSearchFilters } from "@shared/interfaces/WorkerProfileI";
import { BtnModes, BtnSizes, SelectorItem } from "global/interface/controls.interface";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { Controller, useForm } from "react-hook-form";
import { FormValidator } from "global/FormValidator";
import Button from "global/components/controls/Button";
import CountrySelector from "global/components/selector/CountrySelector";
import DictionarySelector from "global/components/selector/DictionarySelector";
import { Ico } from "global/icon.def";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "user/UserProvider";
import { GoogleMapService } from "global/services/GoogleMapService";
import { toast } from "react-toastify";
import FloatingPlaceSearch from "global/components/controls/FloatingPlaceSearch";
import FloatingStepSlider from "global/components/controls/FloatingStepSlider";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";
import { AppConfig } from "@shared/AppConfig";

const WorkersSearchFiltersView: React.FC = () => {

    const { t } = useTranslation()
    const globalCtx = useGlobalContext()
    const userCtx = useUserContext();
    const ctx: WorkersSearchContextProps = useWorkersSearch()

    const [loadingLocation, setLoadingLocation] = useState(false);

    const hasAutofilledLocation = useRef(false);

    const f = useForm<WorkerSearchFilters>({
        defaultValues: ctx.filters
    })

    const formState = f.watch()

    useEffect(() => {
        const autofillLocationCountry = async () => {
            if (hasAutofilledLocation.current) return; // Prevent re-execution
            if (!formState.geocodedPosition && userCtx.position) {
                try {
                    setLoadingLocation(true);
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
                    setLoadingLocation(false);
                }
            }
        }
        autofillLocationCountry();
    }, [userCtx.position])

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return <Loading></Loading>
    }

    const startDateRequired = FormValidator.required(t);
    const required = FormValidator.required(t);

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

    const updatePosition = async (position: { lat: number; lng: number }) => {
        const geoPosition = await updateFormPosition(position);
        if (geoPosition?.country?.toLocaleLowerCase() !== formState.locationCountry?.toLocaleLowerCase()) {
            f.setValue('locationCountry', null);
        }
    };

    const updateFormPosition = async (position: { lat: number; lng: number }): Promise<GeocodedPosition | null> => {
        try {
            setLoadingLocation(true);
            const geoPosition = await GoogleMapService.getGeoPosition(position);
            setGeoPosition(geoPosition);
            return geoPosition;
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error(t('employeeProfile.error.getGeocodedLocation'));
            return null;
        } finally {
            setLoadingLocation(false);
        }
    }

    const setGeoPosition = async (position?: GeocodedPosition | null) => {
        f.setValue('geocodedPosition', position);
        if (!position) {
            f.setValue('positionRadiusKm', undefined);
        } else {
            f.setValue('positionRadiusKm', AppConfig.RADIUS_STEPS_KM[0]);
        }
    }

    return (
        <div className="form-view relative flex flex-col">
            <form className='flex flex-col flex-1'
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

                <Controller
                    name="locationCountry"
                    control={f.control}
                    rules={required}
                    render={({ field }) => (
                        <CountrySelector
                            {...field}
                            fullWidth
                            value={field.value ?? undefined}
                            label={t("employeeProfile.form.locationCountry") + '*'}
                            className="w-full mt-3"
                            error={f.formState.errors.locationCountry}
                            onSelect={item => {
                                f.setValue('locationCountry', item);
                                setGeoPosition(null);
                            }}
                        />
                    )}
                />

                {loadingLocation ? (<Loading></Loading>) : (
                    <Controller
                        name="geocodedPosition"
                        control={f.control}
                        render={({ field }) => (
                            <FloatingPlaceSearch
                                {...field}
                                fullWidth
                                displayValue={field.value?.fullAddress || ''}
                                label={t("employeeProfile.form.city")}
                                className="w-full mt-3"
                                error={f.formState.errors.geocodedPosition}
                                onSelect={item => {
                                    updatePosition({ lat: item.lat, lng: item.lng });
                                }}
                                onClear={() => {
                                    setGeoPosition(null);
                                }}
                            ></FloatingPlaceSearch>
                        )}
                    />
                )}

                {!!formState.geocodedPosition && (
                    <Controller
                        name="positionRadiusKm"
                        control={f.control}
                        render={({ field }) => (
                            <FloatingStepSlider
                                label={t('employeeProfile.form.radius')}
                                steps={[...AppConfig.RADIUS_STEPS_KM]}
                                value={field.value}
                                onChange={field.onChange}
                                unit="km"
                                fullWidth
                                className="w-full mt-3 px-2 mb-5"
                            />
                        )}
                    />
                )}

                <Controller
                    name="categories"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            type='multi'
                            className="w-full mt-3"
                            valueInput={field.value}
                            onSelectMulti={items => {
                                field.onChange(items);
                            }}
                            label={t("offer.filters.categories")}
                            code="WORK_CATEGORY"
                            fullWidth
                            required
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
                            label={t("employeeProfile.form.certificates")}
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