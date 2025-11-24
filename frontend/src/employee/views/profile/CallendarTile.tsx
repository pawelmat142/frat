import { DateRange, EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import MonthCallendar from "global/components/callendar/MonthCallendar";
import React from "react";
import { useTranslation } from "react-i18next";
import { usePopup } from "global/providers/PopupProvider";
import { useFullScreenDialog } from "global/providers/FullScreenDialogProvider";
import CallendarsView from "global/components/callendar/CallendarsView";
import { useBottomSheet } from "global/providers/BottomSheetProvider";

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

    const fullScreenDialogCtx = useFullScreenDialog();
    const bottomSheetCtx = useBottomSheet();


    const openDialong = () => {
        fullScreenDialogCtx.open({
            title: t("employeeProfile.availability"),
            children: <CallendarsView
                range={range!}
                bottomSheetCtx={bottomSheetCtx}
            />,
        });
    }

    return (
        <div className="square-tile month-tile ripple p-1" onClick={() => openDialong()}>

            <div className="mb-2 small-font">{t(`callendar.monthShort.${month}`)} {year}</div>

            <div className="month-tile-wrapper">
                <MonthCallendar date={date} selectedRange={range} />
            </div>

        </div>
    );
}

export default CallendarTile;