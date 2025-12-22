import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EmployeeSearchContextProps, EPDefaultFilters } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes, SelectorItem } from "global/interface/controls.interface";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { DateRange, EmmployeeProfileSearchSortOption, EmmployeeProfileSearchSortOptions, EmployeeProfileSearchFilters, Position, PROFILE_DEFAULT_SORT_OPTION } from "@shared/interfaces/EmployeeProfileI";
import PositionSelector from "global/components/selector/position/PositionSelector";
import { PositionService } from "global/services/PositionService";
import { DictionaryService } from "global/services/DictionaryService";
import { useLocation } from "react-router-dom";
import { EPUtil } from "employee/EPUtil";
import { FaSearch } from "react-icons/fa";
import FloatingSelector from "global/components/selector/FloatingSelector";

const EmployeeSearchFiltersSheet: React.FC<{ ctx: EmployeeSearchContextProps }> = ({ ctx }) => {

    const { t } = useTranslation();
    const drawerCtx = useDrawer();
    const location = useLocation();

    const [localFilters, setLocalFilters] = useState(ctx.filters);

    useEffect(() => {
        const currentFilters = EPUtil.parseFiltersFromSearch(location.search, EPDefaultFilters)
        setLocalFilters(currentFilters);
    }, [])

    const resetFilters = () => {
        ctx.resetFilters()
        drawerCtx.close();
    }

    const search = () => {
        ctx.setFilters(localFilters);
        drawerCtx.close();
    }

    const prepareDateRange = (): DateRange | null => {
        if (!localFilters.startDate) {
            return null
        }
        return {
            start: localFilters.startDate,
            end: localFilters.endDate
        }
    }

    const preparePosition = (): Position | null => {
        if (localFilters.lat && localFilters.lng) {
            return {
                lat: localFilters.lat,
                lng: localFilters.lng,
            }
        }
        return null;
    }

    // Simple in-memory cache for reverse geocoded country codes to reduce API calls
    const countryCacheRef = useRef<Record<string, string>>({});
    const [geoLoading, setGeoLoading] = useState(false);

    /**
     * Attempt to reverse geocode the provided lat/lng and update country filter automatically.
     * Uses OpenStreetMap Nominatim (public) – consider proxying via backend for production to respect rate limits.
     */
    const autofillCountryByPosition = async (position?: Position | null) => {
        if (!position) {
            return;
        }

        const key = `${position.lat.toFixed(3)},${position.lng.toFixed(3)}`; // coarse key to improve cache hits
        if (countryCacheRef.current[key]) {
            const filters = { ...localFilters, locationCountry: countryCacheRef.current[key] };
            setLocalFilters(filters);
            return;
        }

        setGeoLoading(true);
        try {
            const countryCode = await PositionService.callApiFindCountryByPosition(position);
            if (countryCode) {
                const languageCode = await DictionaryService.getLanguageDictionaryCodeByCountryCode(countryCode || '');
                if (languageCode) {
                    countryCacheRef.current[key] = languageCode;
                    const filters = {
                        ...localFilters,
                        locationCountry: languageCode,
                        lat: position.lat,
                        lng: position.lng
                    };
                    setLocalFilters(filters);
                }
            }
        } catch (e) {
            // Intentionally swallow errors – network issues shouldn't break filter sheet.
        } finally {
            setGeoLoading(false);
        }
    }

    const sortOptionItems: SelectorItem<string>[] = Object.keys(EmmployeeProfileSearchSortOptions).map((option: string) => ({
        value: option,
        label: t('employeeProfile.form.sortOptions.' + option)
    }))
    
    return (
        <div className="flex flex-col px-3 pt-5 gap-1">

            <DateRangeInputViewSelector
                label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label")}
                className="w-full"
                value={prepareDateRange()}
                onChange={(dateRange) => {
                    const filters: EmployeeProfileSearchFilters = {
                        ...localFilters,
                        startDate: dateRange?.start || null,
                        endDate: dateRange?.end || null
                    };
                    setLocalFilters(filters);
                }}
            />

            <DictionarySelector
                className="w-full"
                valueInput={localFilters.locationCountry || ''}
                onSelect={item => {
                    const locationCountryValue = item ? String(item) : null;
                    const filters = { ...localFilters, locationCountry: locationCountryValue };
                    setLocalFilters(filters);
                }}
                label={t("employeeProfile.form.locationCountry")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                elementLabelTranslationKey="COUNTRY_NAME"
                fullWidth
            />

            <PositionSelector
                label={t("employeeProfile.form.locationPoint")}
                className="w-full"
                value={preparePosition()}
                name={""}
                onChange={(position) => {
                    const filters = {
                        ...localFilters,
                        lat: position ? position.lat : null,
                        lng: position ? position.lng : null
                    };
                    setLocalFilters(filters);
                    // Fire and forget reverse geocode (no await to keep UI responsive)
                    autofillCountryByPosition(position);
                }}
            ></PositionSelector>

            <DictionarySelector
                type="multi"
                className="w-full"
                valueInput={localFilters.skills}
                onSelectMulti={items => {
                    const filters = { ...localFilters, skills: items.map(i => String(i)) };
                    setLocalFilters(filters);
                }}
                label={t("employeeProfile.form.skills")}
                code="SKILLS"
                fullWidth
            />

            <DictionarySelector
                type="multi"
                className="w-full"
                valueInput={localFilters.certificates}
                onSelectMulti={items => {
                    const filters = { ...localFilters, certificates: items.map(i => String(i)) };
                    setLocalFilters(filters);
                }}
                label={t("employeeProfile.form.certificates")}
                code="CERTIFICATES"
                fullWidth
            />

            <DictionarySelector
                type='multi'
                className="w-full"
                valueInput={localFilters.communicationLanguages}
                onSelectMulti={items => {
                    const filters = { ...localFilters, communicationLanguages: items.map(i => String(i)) };
                    setLocalFilters(filters);
                }}
                label={t("employeeProfile.form.communicationLanguage")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                fullWidth
                required
            />

            <FloatingSelector
                className="w-full mt-10"
                items={sortOptionItems}
                value={sortOptionItems.find(i => i.value === localFilters.sortBy) || null}
                onSelect={item => {
                    const value = item ? String(item) : PROFILE_DEFAULT_SORT_OPTION;
                    const filters = { ...localFilters, sortBy: value as EmmployeeProfileSearchSortOption };
                    setLocalFilters(filters);
                }}
                label={t("employeeProfile.form.sortOptions.title")}
                fullWidth
            ></FloatingSelector>

            <div className="mt-10">
                <Button onClick={search} mode={BtnModes.PRIMARY} fullWidth>
                    <FaSearch size={22}></FaSearch>
                    {t("common.search")}
                </Button>
                <Button onClick={resetFilters} mode={BtnModes.ERROR_TXT} className="mt-3" fullWidth>
                    {t("common.reset")}
                </Button>
            </div>


        </div>
    );
};

export default EmployeeSearchFiltersSheet;
