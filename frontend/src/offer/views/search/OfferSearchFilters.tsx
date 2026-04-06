import React from "react";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useOfferSearch } from "./OfferSearchProvider";
import { Utils } from "global/utils/utils";
import { Ico } from "global/icon.def";

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
        <div className="filters-container primary-bg">
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

            </div>


        </div>
    );
};

export default OfferSearchFilters;
