import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DateRangeIcon from '@mui/icons-material/DateRange';
import { useGlobalContext } from "global/providers/GlobalProvider";
import { FaGlobe } from "react-icons/fa";
import { Utils } from "global/utils/utils";
import { DateRange } from "@shared/interfaces/WorkerI";
import { LocationCity, Place } from "@mui/icons-material";
import Flags from "global/components/Flags";
import { useNavigate } from "react-router-dom";
import { useWorkersSearch } from "./WorkersSearchProvider";
import { DateUtil } from "@shared/utils/DateUtil";
import { Dictionaries, DictionaryUtil } from "@shared/utils/DictionaryUtil";

const WorkersSearchFilters: React.FC = () => {

    const globalCtx = useGlobalContext();
    const languagesDictionary = globalCtx.dics.languages;
    const { t } = useTranslation();
    const ctx = useWorkersSearch();
    const navigate = useNavigate();

    const flags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.communicationLanguages || [], languagesDictionary))
        : [];

    const locationCountryDictionaryCode = DictionaryUtil.getElementByCountryCode(languagesDictionary!, ctx.filters.locationCountry || "")?.code;

    const formatFromTo = (range?: DateRange | null): string | null => {
        if (!range?.start) return null;

        const startMonth = t(`callendar.monthShort.${DateUtil.getMonth(range.start)}`);
        const startDayNumber = DateUtil.getDay(range.start);
        let result = `${t("common.from")} ${startDayNumber} ${startMonth}`;
        if (range.end) {
            const endMonth = t(`callendar.monthShort.${DateUtil.getMonth(range.end)}`);
            const endDayNumber = DateUtil.getDay(range.end);
            result += ` ${t("common.to")} ${endDayNumber} ${endMonth}`;
        }
        return result;
    }

    return (
        <div className="filters-container primary-bg">
            <div className="flex gap-3 w-full px-2 pb-1 flex-wrap">

                {!!ctx.filters.startDate && (
                    <div className="flex items-center gap-1">
                        <DateRangeIcon fontSize="inherit" className="secondary-text" />
                        <span className="xs-font">
                            {formatFromTo({
                                start: ctx.filters.startDate,
                                end: ctx.filters.endDate
                            })}
                        </span>
                    </div>)}

                {(!!ctx.filters.locationCountry) && (
                    <div className="flex items-center gap-1">
                        <Place fontSize="inherit" className="secondary-text" />
                        {!!ctx.filters.locationCountry && (<Flags languages={[locationCountryDictionaryCode!]} size={12} />)}
                    </div>
                )}

                {!!ctx.filters.geocodedPosition?.city && (
                    <div className="flex items-center gap-1">
                        <LocationCity fontSize="inherit" className="secondary-text" />
                        <span className="xs-font">{ctx.filters.geocodedPosition.city}</span>
                        {!!ctx.filters.positionRadiusKm && (
                            <div className="flex items-center gap-1">
                                <span className="xs-font">+{ctx.filters.positionRadiusKm} [km]</span>
                            </div>
                        )}
                    </div>
                )}

                {(!!ctx.filters.categories?.length) && (
                    <div className="flex items-center">
                        <div className="chip-container">
                            {(ctx.filters.categories || []).map(category => (
                                <div key={category} className="search-chip tertiary">
                                    {t(DictionaryUtil.getTranslationKey(Dictionaries.WORK_CATEGORY, category))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(!!ctx.filters.certificates?.length) && (
                    <div className="flex items-center">
                        <div className="chip-container">
                            {(ctx.filters.certificates || []).map(cert => (
                                <div key={cert} className="search-chip secondary">
                                    {t(DictionaryUtil.getTranslationKey(Dictionaries.CERTIFICATES, cert))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!!ctx.filters.communicationLanguages?.length && (
                    <div className="chip-container">
                        <FaGlobe className="secondary-text" />
                        <Flags languages={ctx.filters.communicationLanguages!} size={12} />
                    </div>
                )}
            </div>

        </div>
    );
};

export default WorkersSearchFilters;
