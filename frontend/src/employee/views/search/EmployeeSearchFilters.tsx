import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import Place from '@mui/icons-material/Place';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FloatingInput from "global/components/controls/FloatingInput";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, FloatingInputModes } from "global/interface/controls.interface";
import { useEmployeeSearch } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import EmployeeSearchFiltersSheet from "./EmployeeSearchFiltersSheet";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useDebouncedValue } from "shared/utils/useDebouncedValue";
import { FaLanguage } from "react-icons/fa";
import { Utils } from "global/utils/utils";
import { DateRange } from "@shared/interfaces/EmployeeProfileI";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { useUserContext } from "user/UserProvider";

const EmployeeSearchFilters: React.FC = () => {

    const globalCtx = useGlobalContext();
    const languagesDictionary = globalCtx.dics.languages;
    const { t } = useTranslation();
    const [freeTextInput, setFreeTextInput] = useState('');
    const ctx = useEmployeeSearch();
    const userCtx = useUserContext();
    const { open } = useDrawer();

    const debouncedFreeTextInput = useDebouncedValue(freeTextInput, 500);

    useEffect(() => {
        ctx.setFilters({ ...ctx.filters, freeText: debouncedFreeTextInput });
    }, [debouncedFreeTextInput]);

    const openDrawer = () => {
        open({
            title: t("common.filters"),
            children: <EmployeeSearchFiltersSheet ctx={ctx} position={userCtx.position} />,
            showClose: true,
        });
    }

    const flags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.communicationLanguages || [], languagesDictionary))
        : [];

    const countryFlagSrc = ctx.filters.locationCountry
        ? languagesDictionary?.elements.find(el => el.code === ctx.filters.locationCountry)?.values.SRC
        : null;


    const formatFromTo = (range?: DateRange | null): string | null => {
        if (!range?.start) return null;

        const startMonth = t(`callendar.monthShort.${range.start.getMonth()}`);
        const startDayNumber = range.start.getDate();
        let result = `${t("common.from")} ${startDayNumber} ${startMonth}`;
        if (range.end) {
            const endMonth = t(`callendar.monthShort.${range.end.getMonth()}`);
            const endDayNumber = range.end.getDate();
            result += ` ${t("common.to")} ${endDayNumber} ${endMonth}`;
        }
        return result;
    }

    return (
        <div className="filters-container">
            <div className="flex justify-between gap-5 w-full">
                <FloatingInput
                    mode={FloatingInputModes.THIN}
                    name="freeText"
                    value={freeTextInput}
                    onChange={e => {
                        setFreeTextInput(e.target.value);
                    }}
                    label={t("employeeProfile.form.freeText")}
                    fullWidth
                    icon={<Search />}
                />

                <div className="flex items-center">
                    <IconButton mode={BtnModes.PRIMARY} icon={<FilterList />} aria-label="Filters" onClick={openDrawer} />
                </div>
            </div>

            <div className="flex gap-x-3 flex-wrap items-center">
                {!!ctx.filters.startDate && (
                    <div className="ml-2 mt-1 flex items-center gap-1">
                        <DateRangeIcon fontSize="inherit" className="secondary-text" />
                        <span className="xs-font">
                            {formatFromTo({ start: ctx.filters.startDate, end: ctx.filters.endDate })}
                        </span>
                    </div>)}

                {(!!(ctx.filters.lat && ctx.filters.lng) || !!countryFlagSrc) && (
                    <div className="ml-2 mt-1 flex items-center gap-1">
                        <Place fontSize="inherit" className="secondary-text" />
                        {!!(ctx.filters.lat && ctx.filters.lng) && (
                            <span className="xs-font">{PositionUtil.formatPosition({ lat: ctx.filters.lat, lng: ctx.filters.lng })}</span>
                        )}
                    </div>
                )}
                {(!!ctx.filters.skills?.length) && (
                    <div className="chip-container ml-2 mt-1">
                        {(ctx.filters.skills || []).map(skill => (
                            <div key={skill} className="search-chip tertiary">
                                {skill}
                            </div>
                        ))}
                    </div>
                )}

                {(!!ctx.filters.certificates?.length) && (
                    <div className="chip-container ml-2 mt-1">
                        {(ctx.filters.certificates || []).map(cert => (
                            <div key={cert} className="search-chip secondary">
                                {cert}
                            </div>
                        ))}
                    </div>
                )}
                {!!flags?.length && (
                    <div className="chip-container mt-1 ml-2">
                        <FaLanguage className="secondary-text" />
                        {(flags).map((src, index) => (
                            <img key={index} className="filters-flag-chip pl-1" src={src} alt={"flag-" + index} />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default EmployeeSearchFilters;
