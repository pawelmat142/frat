import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import FloatingInput from "global/components/controls/FloatingInput";
import IconButton from "global/components/controls/IconButon";
import { BtnModes, FloatingInputModes } from "global/interface/controls.interface";
import { useDrawer } from "global/providers/DrawerProvider";
import { Utils } from "global/utils";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useOfferSearch } from "./OfferSearchProvider";
import OfferSearchFiltersSheet from "./OfferSearchFiltersSheet";
import { FaTags, FaLanguage, FaMapMarkerAlt } from "react-icons/fa";
import { Currencies } from "@shared/interfaces/OfferI";
import { useDebouncedValue } from "shared/utils/useDebouncedValue";

const OfferSearchFilters: React.FC = () => {

    const globalCtx = useGlobalContext();
    const languagesDictionary = globalCtx.dics.languages;
    const { t } = useTranslation();
    const [freeTextInput, setFreeTextInput] = useState('');
    const ctx = useOfferSearch();
    const { open } = useDrawer();

    const debouncedFreeTextInput = useDebouncedValue(freeTextInput, 500);

    // Debounce effect: update RHF value after 500ms
    useEffect(() => {
        ctx.setFilters({ ...ctx.filters, freeText: debouncedFreeTextInput });
    }, [debouncedFreeTextInput]);

    const openDrawer = () => {
        open({
            title: t("common.filters"),
            children: <OfferSearchFiltersSheet ctx={ctx} />,
            showClose: true,
        });
    }

    const flags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.communicationLanguages || [], languagesDictionary))
        : [];

    const countryFlags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.locationCountries || [], languagesDictionary))
        : [];

    const getSalaryFilterText = () => {
        const currency = ctx.filters.currency === Currencies.EUR 
            ? '€' 
            : ctx.filters.currency === Currencies.USD 
            ? '$' 
            : 'zł';

        let result = ''
        if (ctx.filters.hourlySalaryStart) {
            result += `>${ctx.filters.hourlySalaryStart} ${currency}/h`;
            if (ctx.filters.monthlySalaryStart) {
                result += ' or ';
            }
        }
        if (ctx.filters.monthlySalaryStart) {
            result += `>${ctx.filters.monthlySalaryStart} ${currency}/month`; 
        }
        return result;
    }

    const salaryFilterText = getSalaryFilterText();

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

            <div className="flex gap-x-3 flex-wrap items-center">
                {(!!ctx.filters.categories?.length) && (
                    <div className="chip-container ml-2 mt-1">
                        <FaTags className="secondary-text" />
                        {(ctx.filters.categories || []).map(category => (
                            <div key={category} className="search-chip primary">
                                {category}
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

                {!!countryFlags?.length && (
                    <div className="chip-container mt-1 ml-2">
                        <FaMapMarkerAlt className="secondary-text" />
                        {(countryFlags).map((src, index) => (
                            <img key={index} className="filters-flag-chip pl-1" src={src} alt={"flag-" + index} />
                        ))}
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

                {(!!salaryFilterText && (
                    <div className="ml-2 small-font">{salaryFilterText}</div>
                ))}
            </div>


        </div>
    );
};

export default OfferSearchFilters;
