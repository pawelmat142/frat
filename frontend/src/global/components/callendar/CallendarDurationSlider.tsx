import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { BottomSheetContextType } from "global/providers/BottomSheetProvider";
import FloatingStepSlider from "global/components/controls/FloatingStepSlider";

interface Props {
    initial?: number;
    min?: number;
    max?: number;
    onSubmit: (value: number) => void;
    bottomSheetCtx: BottomSheetContextType
}

const CallendarDurationSlider: React.FC<Props> = ({ initial = 1, min = 1, max = 24, onSubmit, bottomSheetCtx }) => {
    const { t } = useTranslation();
    const [value, setValue] = useState<number>(initial);

    const confirm = () => {
        onSubmit(value);
        bottomSheetCtx.close(true);
    }
    
    const reset = () => {
        bottomSheetCtx.close(true);
        setValue(initial);
    }

    const prepareMonthsLabel = (months: number): string => {
        if (months === 1) return `${months} ${t("callendar.duration.month")}`;
        if ([2, 3, 4].includes(months)) return `${months} ${t("callendar.duration.months2")}`;
        return `${months} ${t("callendar.duration.months")}`;
    }

    return (
        <div className="duration-slider-wrapper flex flex-col gap-4 px-5 py-3 h-full">
            <FloatingStepSlider
                label={t("callendar.duration.selectLabel")}
                min={min}
                max={max}
                value={value}
                onChange={setValue}
                displayValue={prepareMonthsLabel}
                fullWidth
            />
            <div className="flex gap-3 mt-auto">
                <Button
                    onClick={() => { reset(); }}
                    size={BtnSizes.MEDIUM}
                    mode={BtnModes.ERROR_TXT}
                    fullWidth={true}
                >
                    {t("common.reset")}
                </Button>
                <Button
                    onClick={confirm}
                    size={BtnSizes.MEDIUM}
                    mode={BtnModes.PRIMARY}
                    fullWidth={true}
                >
                    {t("common.confirm")}
                </Button>
            </div>
        </div>
    );
}

export default CallendarDurationSlider;
