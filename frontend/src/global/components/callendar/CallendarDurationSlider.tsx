import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { BottomSheetContextType } from "global/providers/BottomSheetProvider";

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(parseInt(e.target.value, 10));
    }

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
            <div className="flex flex-col gap-5 h-full my-auto">
                <label className="text-sm font-medium">
                    {t("callendar.duration.selectLabel")}
                </label>
                <div className="px-5">
                        {/** Dynamic gradient via CSS variable --slider-progress */}
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={1}
                            value={value}
                            onChange={handleChange}
                            className="w-full duration-slider"
                            style={{ ['--slider-progress' as any]: `${((value - min) / (max - min)) * 100}%` }}
                        />

                </div>
                <div className="text-center text-lg font-semibold">
                    {prepareMonthsLabel(value)}
                </div>
            </div>
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
