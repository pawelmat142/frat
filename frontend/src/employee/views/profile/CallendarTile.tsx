import { DateRange, EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { on } from "events";
import MonthCallendar from "global/components/callendar/MonthCallendar";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface CallendarTileProps {
    profile: EmployeeProfileI
}

const CallendarTile: React.FC<CallendarTileProps> = ({ profile }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const getFirstRange = (): DateRange | null => {
        const rangeI = profile.availabilityDateRanges?.[0];
        if (!rangeI) {
            return null;
        }
        return DateRangeUtil.toDateRange(rangeI);
    }

    const range = getFirstRange();
    const date = range?.start || null;

    if (!date) {
        return (
            <div className="square-tile col-tile">
                {/* TODO translation */}
                Available anytime
            </div>
        )
    }

    const month = date.getMonth();
    const year = date.getFullYear();

    const goToCallendarsView = () => {
    }

    return (
        <div className="square-tile month-tile ripple p-1" onClick={goToCallendarsView}>

            <div className="mb-2">{t(`callendar.monthShort.${month}`)} {year}</div>

            <MonthCallendar date={date} selectedRange={range} />

        </div>
    );
}

export default CallendarTile;