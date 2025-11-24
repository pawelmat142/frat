import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { EmployeeSearchContextProps } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import PositionSelector from "global/components/selector/position/PositionSelector";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { DateRange, EmployeeProfileSearchFilters, Position } from "@shared/interfaces/EmployeeProfileI";

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

    // TODO szukanie po dokladnej lokalizacji

    console.log('localFilters', localFilters);

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
                    const locationCountryValue = item ? String(item.value) : null;
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
                onChange={(point) => {
                    const filters = {
                        ...localFilters,
                        lat: point ? point.lat : null,
                        lng: point ? point.lng : null
                    };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
            ></PositionSelector>

            <DictionarySelector
                type="multi"
                className="w-full"
                valueInput={localFilters.skills}
                onSelectMulti={items => {
                    const filters = { ...localFilters, skills: items.map(i => String(i.value)) };
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
                    const filters = { ...localFilters, certificates: items.map(i => String(i.value)) };
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
                    const filters = { ...localFilters, communicationLanguages: items.map(i => String(i.value)) };
                    setLocalFilters(filters);
                    ctx.setFilters(filters);
                }}
                label={t("employeeProfile.form.communicationLanguage")}
                code="LANGUAGES"
                groupCode="COMMUNICATION"
                fullWidth
                required
            />

            <Button onClick={resetFilters} mode={BtnModes.ERROR} className="mt-5" fullWidth>
                {t("common.reset")}
            </Button>

        </div>
    );
};

export default EmployeeSearchFiltersSheet;
