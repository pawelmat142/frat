import { BottomSheetContextType } from "global/providers/BottomSheetProvider";
import React from "react";
import CallendarDurationSlider from "./CallendarDurationSlider";
import { useTranslation } from "react-i18next";
import { Icons } from "global/icon.def";

interface Props {
    onSubmit: (value: number) => void;
    initial?: number;
    bottomSheetCtx: BottomSheetContextType
}

const CallendarViewDurationSelector: React.FC<Props> = ({ onSubmit, initial = 1, bottomSheetCtx }) => {
    const { t } = useTranslation();

    const openSelector = () => {
        bottomSheetCtx.open({
            title: t("callendar.duration.title"),
            showClose: true,
            children: <CallendarDurationSlider
                initial={initial}
                onSubmit={onSubmit}
                bottomSheetCtx={bottomSheetCtx} />
        })
    }

    return (
        <Icons.CALLENDAR onClick={openSelector} />
    );
}

export default CallendarViewDurationSelector;