import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import Place from '@mui/icons-material/Place';
import FloatingInput from "global/components/controls/FloatingInput";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, FloatingInputModes } from "global/interface/controls.interface";
import { useEmployeeSearch } from "./EmployeeSearchProvider";
import { useDrawer } from "global/providers/DrawerProvider";
import EmployeeSearchFiltersSheet from "./EmployeeSearchFiltersSheet";
import { DictionaryI } from "@shared/interfaces/DictionaryI";
import { Utils } from "global/utils";

const EmployeeSearchFilters: React.FC<{ languagesDictionary?: DictionaryI | null }> = ({
    languagesDictionary
}) => {

    const { t } = useTranslation();
    const [freeTextInput, setFreeTextInput] = useState('');
    const ctx = useEmployeeSearch();
    const { open } = useDrawer();

    // Debounce effect: update RHF value after 500ms
    useEffect(() => {
        const handler = setTimeout(() => {
            ctx.setFilters({ ...ctx.filters, freeText: freeTextInput });
        }, 500);
        return () => clearTimeout(handler);
    }, [freeTextInput]);

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

    if (ctx.filters.locationCountry) {
        const countryFlagSrc = languagesDictionary?.elements.find(el => el.code === ctx.filters.locationCountry)?.values.SRC;
        if (countryFlagSrc) {
            flags.unshift(countryFlagSrc);
        }
    }

    return (
        <div className="filters-container mb-5">
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

            {!!(ctx.filters.lat && ctx.filters.lng) && (
                <div className="ml-2 mt-1 flex items-center gap-1">
                    <Place fontSize="inherit" className="primary-color" />
                    <span className="xs-font">{Utils.formatPosition({ lat: ctx.filters.lat, lng: ctx.filters.lng })}</span>
                </div>
            )}

            {!!ctx.filters.startDate && (
                <div className="xs-font ml-2 mt-1">
                    {Utils.formatFromTo(t, { start: ctx.filters.startDate, end: ctx.filters.endDate })}
                </div>)}

            {(!!ctx.filters.skills?.length || !!ctx.filters.certificates?.length) && (
                <div className="chip-container ml-2 mt-1">
                    {(ctx.filters.skills || []).map(skill => (
                        <div key={skill} className="search-chip primary">
                            {skill}
                        </div>
                    ))}

                    {!!ctx.filters.skills?.length && !!ctx.filters.certificates?.length && (
                        <div className="chip-separator"></div>
                    )}

                    {(ctx.filters.certificates || []).map(cert => (
                        <div key={cert} className="search-chip secondary">
                            {cert}
                        </div>
                    ))}
                </div>
            )}

            {!!flags?.length && (
                <div className="chip-container mt-1 ml-2">
                    {(flags).map((src, index) => (
                        <img key={index} className="filters-flag-chip pl-1" src={src} alt={"flag-" + index} />
                    ))}
                </div>
            )}

        </div>
    );
};

export default EmployeeSearchFilters;
