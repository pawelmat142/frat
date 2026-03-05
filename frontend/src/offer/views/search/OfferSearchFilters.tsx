import React, { useEffect } from "react";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useOfferSearch } from "./OfferSearchProvider";
import { Currencies } from "@shared/interfaces/OfferI";
import { Utils } from "global/utils/utils";
import { Ico } from "global/icon.def";
import { Path } from "../../../path";
import { useNavigate } from "react-router-dom";
import IconButton from "global/components/controls/IconButon";
import { FilterList } from "@mui/icons-material";

const OfferSearchFilters: React.FC = () => {

    const globalCtx = useGlobalContext();
    const languagesDictionary = globalCtx.dics.languages;
    const navigate = useNavigate();
    const ctx = useOfferSearch();

    const setupHeaderMenu = () => {
        globalCtx.setHeaderMenu(<IconButton icon={<FilterList onClick={() => {
            navigate(Path.OFFERS_FILTERS_SEARCH)
        }} />} />);
    }

    useEffect(() => {
        setupHeaderMenu();
    }, [])

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
        <div className="filters-container">
            <div className="flex gap-x-3 flex-wrap items-center pb-1">
                {(!!ctx.filters.categories?.length) && (
                    <div className="chip-container ml-2">
                        <Ico.CATEGORIES className="secondary-text" />
                        {(ctx.filters.categories || []).map(category => (
                            <div key={category} className="search-chip primary">
                                {category}
                            </div>
                        ))}
                    </div>
                )}

                {!!flags?.length && (
                    <div className="chip-container ml-2">
                        <Ico.LANGUAGE className="secondary-text" />
                        {(flags).map((src, index) => (
                            <img key={index} className="filters-flag-chip pl-1" src={src} alt={"flag-" + index} />
                        ))}
                    </div>
                )}

                {!!countryFlags?.length && (
                    <div className="chip-container ml-2">
                        <Ico.MARKER className="secondary-text" />
                        {(countryFlags).map((src, index) => (
                            <img key={index} className="filters-flag-chip pl-1" src={src} alt={"flag-" + index} />
                        ))}
                    </div>
                )}

                {(!!ctx.filters.skills?.length) && (
                    <div className="chip-container ml-2">
                        {(ctx.filters.skills || []).map(skill => (
                            <div key={skill} className="search-chip tertiary">
                                {skill}
                            </div>
                        ))}

                    </div>
                )}

                {(!!ctx.filters.certificates?.length) && (
                    <div className="chip-container ml-2">
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
