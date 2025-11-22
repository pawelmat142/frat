import { DateRange, EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import MonthCallendar from "global/components/callendar/MonthCallendar";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePopup } from "global/providers/PopupProvider";
import CallendarsView from "global/components/callendar/CallendarsView";

interface CallendarTileProps {
    profile: EmployeeProfileI
}

const CallendarTile: React.FC<CallendarTileProps> = ({ profile }) => {

    const { t } = useTranslation();

    const range = DateRangeUtil.getFirstRange(profile);
    const date = range?.start || null;

    if (!date) {
        return (
            <div className="square-tile col-tile px-5">
                {t("others.availableAnytime")}
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

            <div className="mb-2 small-font">{t(`callendar.monthShort.${month}`)} {year}</div>

            <div className="month-tile-wrapper">
                <MonthCallendar date={date} selectedRange={range} />
            </div>

        </div>
    );
}

export default CallendarTile;