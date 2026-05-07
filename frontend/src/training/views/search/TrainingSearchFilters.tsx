import React from "react";
import { useTrainingSearch } from "./TrainingSearchProvider";
import { useTranslation } from "react-i18next";
import { Ico } from "global/icon.def";

const TrainingSearchFilters: React.FC = () => {

    const ctx = useTrainingSearch();
    const { t } = useTranslation();

    if (!ctx.filtersApplied) return null;

    return (
        <div className="filters-container primary-bg">
            <div className="flex gap-x-3 flex-wrap items-center pb-1">
                {ctx.filters.certificateCode && (
                    <div className="chip-container ml-2">
                        <Ico.CATEGORIES className="secondary-text" />
                        <div className="search-chip primary">{ctx.filters.certificateCode}</div>
                    </div>
                )}
                {ctx.filters.locationCountry && (
                    <div className="chip-container ml-2">
                        <Ico.MARKER className="secondary-text" />
                        <div className="search-chip primary">{ctx.filters.locationCountry}</div>
                    </div>
                )}
                {ctx.filters.radiusKm != null && (
                    <div className="chip-container ml-2">
                        <Ico.COMPASS className="secondary-text" />
                        <div className="search-chip primary">{ctx.filters.radiusKm} km</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingSearchFilters;
