import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { EmployeeSearchContextProps, EPDefaultFilters } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes, SelectorItem } from "global/interface/controls.interface";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { DateRange, EmmployeeProfileSearchSortOption, EmmployeeProfileSearchSortOptions, EmployeeProfileSearchFilters, Position, PROFILE_DEFAULT_SORT_OPTION } from "@shared/interfaces/EmployeeProfileI";
import PositionSelector from "global/components/selector/position/PositionSelector";
import { useLocation } from "react-router-dom";
import { EPUtil } from "@shared/utils/EPUtil";
import { FaSearch } from "react-icons/fa";
import FloatingSelector from "global/components/selector/FloatingSelector";

const EmployeeSearchFiltersSheet: React.FC<{ ctx: EmployeeSearchContextProps, position?: Position | null }> = ({ ctx, position }) => {

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

    const preparePosition = (): Position => {
        if (localFilters.position) {
            return {
                lat: localFilters.position.lat,
                lng: localFilters.position.lng,
                address: localFilters.position.address
            }
        }
        return position || { lat: 52.2297, lng: 21.0122 }
    }

    const sortOptionItems: SelectorItem<string>[] = Object.keys(EmmployeeProfileSearchSortOptions).map((option: string) => ({
        value: option,
        label: t('employeeProfile.form.sortOptions.' + option)
    }))

    const initialPosition = preparePosition();
    
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
                value={localFilters.position ? {
                    lat: localFilters.position.lat || 0,
                    lng: localFilters.position.lng || 0,
                    fullAddress: localFilters.position.address
                } : undefined}
                initialPosition={initialPosition}
                name={""}
                onChange={(position) => {
                    const filters = {
                        ...localFilters,
                        position: position ? {
                            lat: position.lat,
                            lng: position.lng,
                            address: position.fullAddress
                        } : null
                    };
                    setLocalFilters(filters);
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
