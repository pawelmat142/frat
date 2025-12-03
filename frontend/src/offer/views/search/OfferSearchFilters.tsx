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

const OfferSearchFilters: React.FC = () => {

    const globalCtx = useGlobalContext();
    const languagesDictionary = globalCtx.dics.languages;
    const { t } = useTranslation();
    const [freeTextInput, setFreeTextInput] = useState('');
    const ctx = useOfferSearch();
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
            children: <OfferSearchFiltersSheet ctx={ctx} />,
            showClose: true,
        });
    }

    console.log('OfferSearchFilters')
    console.log(ctx.filters)

    const flags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.communicationLanguages || [], languagesDictionary))
        : [];

    const countryFlags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.locationCountries || [], languagesDictionary))
        : [];

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

            <div className="flex gap-x-3 flex-wrap">
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

                {(!!ctx.filters.skills?.length || !!ctx.filters.certificates?.length) && (
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
            </div>

        </div>
    );
};

export default OfferSearchFilters;
