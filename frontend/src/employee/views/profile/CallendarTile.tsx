import { DateRange, EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import MonthCallendar from "global/components/callendar/MonthCallendar";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePopup } from "global/providers/PopupProvider";
import CallendarsView from "global/components/callendar/CallendarsView";

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

    const popup = usePopup();

    const goToCallendarsView = async () => {
        if (!range) return;

        popup.popup({
            fullScreen: true,
            children: (
                <CallendarsView
                    range={range}
                />
            )
        });

    }

    return (
        <div className="square-tile month-tile ripple p-1" onClick={goToCallendarsView}>

            <div className="mb-2">{t(`callendar.monthShort.${month}`)} {year}</div>

            <MonthCallendar date={date} selectedRange={range} />

        </div>
    );
}

export default CallendarTile;