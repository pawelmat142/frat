import { DateRange } from "@shared/interfaces/WorkerProfileI";
import MonthCallendar from "global/components/callendar/MonthCallendar";
import React from "react";
import { useTranslation } from "react-i18next";
import { useFullScreenDialog } from "global/providers/FullScreenDialogProvider";
import CallendarsView from "global/components/callendar/CallendarsView";
import { useBottomSheet } from "global/providers/BottomSheetProvider";

interface CallendarTileProps {
    range: DateRange | null;
}

const CallendarTile: React.FC<CallendarTileProps> = ({ range }) => {

    const { t } = useTranslation();

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

    const fullScreenDialogCtx = useFullScreenDialog();
    const bottomSheetCtx = useBottomSheet();


    const openDialog = () => {
        fullScreenDialogCtx.open({
            title: t("employeeProfile.availability"),
            children: <CallendarsView
                range={range!}
                bottomSheetCtx={bottomSheetCtx}
            />,
        });
    }

    return (
        <div className="square-tile month-tile ripple p-1" onClick={() => openDialog()}>

            <div className="mb-2 small-font">{t(`callendar.monthShort.${month}`)} {year}</div>

            <div className="month-tile-wrapper">
                <MonthCallendar date={date} selectedRange={range} />
            </div>

        </div>
    );
}

export default CallendarTile;