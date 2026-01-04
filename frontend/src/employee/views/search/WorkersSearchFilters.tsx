import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import FilterList from '@mui/icons-material/FilterList';
import DateRangeIcon from '@mui/icons-material/DateRange';
import IconButton from "global/components/controls/IconButon";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { FaGlobe } from "react-icons/fa";
import { Utils } from "global/utils/utils";
import { DateRange } from "@shared/interfaces/WorkerProfileI";
import { Place } from "@mui/icons-material";
import Flags from "global/components/Flags";
import { useNavigate } from "react-router-dom";
import { Path } from "../../../path";
import { useWorkersSearch } from "./WorkersSearchProvider";
import { DateUtil } from "@shared/utils/DateUtil";

const WorkersSearchFilters: React.FC = () => {

    const globalCtx = useGlobalContext();
    const languagesDictionary = globalCtx.dics.languages;
    const { t } = useTranslation();
    const ctx = useWorkersSearch();
    const navigate = useNavigate();

    const flags = languagesDictionary
        ? Array.from(Utils.prepareFlagSrcs(ctx.filters.communicationLanguages || [], languagesDictionary))
        : [];

    const locationCountryDictionaryCode = languagesDictionary?.elements.find(e => e.values.COUNTRY_CODE === ctx.filters.locationCountry)?.code;

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

    const setupHeaderMenu = () => {
        globalCtx.setHeaderMenu(<IconButton icon={<FilterList onClick={() => {
            navigate(Path.WORKERS_FILTERS_SEARCH)
        }} />} />);
    }
    useEffect(() => {
        setupHeaderMenu();
    }, [])

    return (
        <div className="filters-container">
            <div className="flex gap-3 w-full px-2 pb-1 flex-wrap">

                {!!ctx.filters.startDate && (
                    <div className="flex items-center gap-1">
                        <DateRangeIcon fontSize="inherit" className="secondary-text" />
                        <span className="xs-font">
                            {formatFromTo({ 
                                start: ctx.filters.startDate,
                                end: ctx.filters.endDate })}
                        </span>
                    </div>)}

                {(!!ctx.filters.locationCountry) && (
                    <div className="flex items-center gap-1">
                        <Place fontSize="inherit" className="secondary-text" />
                        {!!ctx.filters.locationCountry && (<Flags languages={[locationCountryDictionaryCode!]} size={12} />)}
                        {!!(ctx.filters.freeText) && (
                            <span className="xs-font">{ctx.filters.freeText}</span>
                        )}
                    </div>
                )}

                {!!ctx.filters.communicationLanguages?.length && (
                    <div className="chip-container">
                        <FaGlobe className="secondary-text" />
                        <Flags languages={ctx.filters.communicationLanguages!} size={12} />
                    </div>
                )}
                <div className="flex items-center">
                    {(!!ctx.filters.experience?.length) && (
                        <div className="chip-container">
                            {(ctx.filters.experience || []).map(ex => (
                                <div key={ex} className="search-chip tertiary">
                                    {ex}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center">
                    {(!!ctx.filters.certificates?.length) && (
                        <div className="chip-container">
                            {(ctx.filters.certificates || []).map(cert => (
                                <div key={cert} className="search-chip secondary">
                                    {cert}
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>

        </div>
    );
};

export default WorkersSearchFilters;
