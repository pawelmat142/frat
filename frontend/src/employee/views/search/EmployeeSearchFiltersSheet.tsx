import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { EmployeeSearchContextProps } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { DateRange, EmployeeProfileSearchFilters, Position } from "@shared/interfaces/EmployeeProfileI";
import PositionSelector from "global/components/selector/position/PositionSelector";
import { PositionService } from "global/services/PositionService";
import { DictionaryService } from "global/services/DictionaryService";

const EmployeeSearchFiltersSheet: React.FC<{ ctx: EmployeeSearchContextProps }> = ({ ctx }) => {

    const { t } = useTranslation();
    const drawerCtx = useDrawer();

    // LOCAL STATE IS REQUIRED HERE BCS ctx.filters UPDATES ONLY ON "APPLY" ACTION
    const [localFilters, setLocalFilters] = useState(ctx.filters);

    const resetFilters = () => {
        ctx.resetFilters()
        setLocalFilters(ctx.defaultFilters);
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
            ctx.setFilters(filters);
            return;
        }

        setGeoLoading(true);
        try {
            const countryCode = await PositionService.callApiFindCountryByPosition(position);
            if (countryCode) {
                const languageCode = await DictionaryService.getLanguageDictionaryCodeByCountryCode(countryCode || '');
                if (languageCode) {
                    countryCacheRef.current[key] = languageCode;
                    const filters = { ...localFilters, 
                        locationCountry: languageCode,
                        lat: position.lat,
                        lng: position.lng
                    };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }
            }
        } catch (e) {
            // Intentionally swallow errors – network issues shouldn't break filter sheet.
        } finally {
            setGeoLoading(false);
        }
    }

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
                    ctx.setFilters(filters);
                }}
            />

            <DictionarySelector
                className="w-full"
                valueInput={localFilters.locationCountry || ''}
                onSelect={item => {
                    const locationCountryValue = item ? String(item) : null;
                    const filters = { ...localFilters, locationCountry: locationCountryValue };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
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
                initializePositionByCountryCode={localFilters.locationCountry}
                name={""}
                onChange={(position) => {
                    const filters = {
                        ...localFilters,
                        lat: position ? position.lat : null,
                        lng: position ? position.lng : null
                    };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
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
                    ctx.setFilters(filters);
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
                    ctx.setFilters(filters);
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
                    ctx.setFilters(filters);
                }}
                label={t("employeeProfile.form.communicationLanguage")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                fullWidth
                required
            />

            <Button onClick={resetFilters} mode={BtnModes.ERROR} className="mt-5" fullWidth disabled={geoLoading}>
                {t("common.reset")}
            </Button>

        </div>
    );
};

export default EmployeeSearchFiltersSheet;
