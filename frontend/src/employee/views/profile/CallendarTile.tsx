import { DateRange } from "@shared/interfaces/WorkerI";
import MonthCallendar from "global/components/callendar/MonthCallendar";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CallendarsView from "global/components/callendar/CallendarsView";
import { useBottomSheet } from "global/providers/BottomSheetProvider";
import { DateUtil } from "@shared/utils/DateUtil";
import PseudoView from "global/components/PseudoView";

interface CallendarTileProps {
    range: DateRange | null;
}

const CallendarTile: React.FC<CallendarTileProps> = ({ range }) => {

    const { t } = useTranslation();

    const [openPseudoView, setOpenPseudoView] = useState(false);

    const dateStr = range?.start || null;

    if (!dateStr) {
        return (
            <div className="p-tile square-tile col-tile px-5">
                {t("others.availableAnytime")}
            </div>
        )
    }

    const date = DateUtil.parseLocalDateString(dateStr);
    const month = date.getMonth();
    const year = date.getFullYear();

    const bottomSheetCtx = useBottomSheet();

    const openDialog = () => {
        setOpenPseudoView(true);
    }

    return (
        <>
            <div className="p-tile square-tile month-tile ripple p-1" onClick={() => openDialog()}>

                <div className="mb-2 s-font">{t(`callendar.monthShort.${month}`)} {year}</div>

                <div className="month-tile-wrapper">
                    <MonthCallendar date={date} selectedRanges={range ? [range] : []} />
                </div>
            </div>

            <PseudoView show={openPseudoView}>
                <CallendarsView
                    title={t("employeeProfile.availability")}
                    ranges={range ? [range] : []}
                    bottomSheetCtx={bottomSheetCtx}
                    onClose={() => {
                        setOpenPseudoView(false)
                    }}
                />
            </PseudoView>
        </>
    );
}

export default CallendarTile;