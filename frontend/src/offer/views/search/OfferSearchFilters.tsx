import React from "react";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useOfferSearch } from "./OfferSearchProvider";
import { Utils } from "global/utils/utils";
import { Ico } from "global/icon.def";
import CategoriesChips from "global/components/chips/CategoriesChips";

const OfferSearchFilters: React.FC = () => {

    const globalCtx = useGlobalContext();
    const languagesDictionary = globalCtx.dics.languages;
    const ctx = useOfferSearch();

    const flags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.communicationLanguages || [], languagesDictionary))
        : [];

    const countryFlags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.locationCountries || [], languagesDictionary))
        : [];

    return (
        <div className="filters-container primary-bg view-margin">
            <div className="flex gap-x-2 flex-wrap items-center pb-1">
                {(!!ctx.filters.categories?.length) && (
                    <div className="chip-container">
                        <Ico.CATEGORIES className="secondary-text" />

                        <CategoriesChips categories={ctx.filters.categories} smaller color="primary" />
                    </div>
                )}

                {!!flags?.length && (
                    <div className="chip-container">
                        <Ico.LANGUAGE className="secondary-text" />
                        {(flags).map((src, index) => (
                            <img key={index} className="filters-flag-chip pl-1" src={src} alt={"flag-" + index} />
                        ))}
                    </div>
                )}

                {!!countryFlags?.length && (
                    <div className="chip-container">
                        <Ico.MARKER className="secondary-text" />
                        {(countryFlags).map((src, index) => (
                            <img key={index} className="filters-flag-chip pl-1" src={src} alt={"flag-" + index} />
                        ))}
                    </div>
                )}

            </div>


        </div>
    );
};

export default OfferSearchFilters;
