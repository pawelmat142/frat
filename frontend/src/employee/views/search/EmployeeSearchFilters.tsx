import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import Place from '@mui/icons-material/Place';
import DateRange from '@mui/icons-material/DateRange';
import FloatingInput from "global/components/controls/FloatingInput";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, FloatingInputModes } from "global/interface/controls.interface";
import { useEmployeeSearch } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import EmployeeSearchFiltersSheet from "./EmployeeSearchFiltersSheet";
import { Utils } from "global/utils";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useDebouncedValue } from "shared/utils/useDebouncedValue";
import { FaLanguage } from "react-icons/fa";

const EmployeeSearchFilters: React.FC = () => {

    const globalCtx = useGlobalContext();
    const languagesDictionary = globalCtx.dics.languages;
    const { t } = useTranslation();
    const [freeTextInput, setFreeTextInput] = useState('');
    const ctx = useEmployeeSearch();
    const { open } = useDrawer();

    const debouncedFreeTextInput = useDebouncedValue(freeTextInput, 500);

    useEffect(() => {
        ctx.setFilters({ ...ctx.filters, freeText: debouncedFreeTextInput });
    }, [debouncedFreeTextInput]);

    const openDrawer = () => {
        open({
            title: t("common.filters"),
            children: <EmployeeSearchFiltersSheet ctx={ctx} />,
            showClose: true,
        });
    }

    const flags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.communicationLanguages || [], languagesDictionary))
        : [];

    const countryFlagSrc = ctx.filters.locationCountry
        ? languagesDictionary?.elements.find(el => el.code === ctx.filters.locationCountry)?.values.SRC
        : null;

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
                        <DateRange fontSize="inherit" className="secondary-text" />
                        <span className="xs-font">
                            {Utils.formatFromTo(t, { start: ctx.filters.startDate, end: ctx.filters.endDate })}
                        </span>
                    </div>)}

                {(!!(ctx.filters.lat && ctx.filters.lng) || !!countryFlagSrc) && (
                    <div className="ml-2 mt-1 flex items-center gap-1">
                        <Place fontSize="inherit" className="secondary-text" />
                        <img className="filters-flag-chip pl-1" src={countryFlagSrc} alt={"flag"} />
                        {!!(ctx.filters.lat && ctx.filters.lng) && (
                            <span className="xs-font">{Utils.formatPosition({ lat: ctx.filters.lat, lng: ctx.filters.lng })}</span>
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
