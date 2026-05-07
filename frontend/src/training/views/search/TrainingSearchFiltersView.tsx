import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { TrainingSearchFilters } from "@shared/interfaces/TrainingI";
import { defaultTrainingFilters, useTrainingSearch } from "./TrainingSearchProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useUserContext } from "user/UserProvider";
import { GoogleMapService } from "global/services/GoogleMapService";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Header from "global/components/Header";
import DictionarySelector from "global/components/selector/DictionarySelector";
import CountrySelector from "global/components/selector/CountrySelector";

interface Props {
    onClose?: () => void;
}

const TrainingSearchFiltersView: React.FC<Props> = ({ onClose }) => {

    const { t } = useTranslation();
    const ctx = useTrainingSearch();
    const globalCtx = useGlobalContext();
    const userCtx = useUserContext();

    const [loadingLocation, setLoadingLocation] = useState(false);

    const f = useForm<TrainingSearchFilters>({ defaultValues: ctx.filters });
    const formState = f.watch();

    // Autofill country from device position on first open
    useEffect(() => {
        const autofill = async () => {
            if (!userCtx.position || formState.locationCountry) return;
            try {
                setLoadingLocation(true);
                const geo = await GoogleMapService.getGeoPosition(userCtx.position);
                const code = geo?.countryCode?.toUpperCase();
                if (code) f.setValue('locationCountry', code);
            } catch {
                // silently ignore
            } finally {
                setLoadingLocation(false);
            }
        };
        if (!ctx.filters.locationCountry) {
            autofill();
        }
    }, []);

    const submit = () => ctx.setFiltersWithSearchAndNavigate(formState);
    const reset = () => {
        f.reset(defaultTrainingFilters);
        ctx.resetFilters();
    };

    return (
        <div className="form-view relative flex flex-col primary-bg h-full">
            <Header onBack={() => onClose?.()} title={t("training.filtersTitle")} />

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

                {/* Certificate */}
                <Controller
                    name="certificateCode"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            id="certificateCode"
                            label={t("training.certificate")}
                            code="CERTIFICATES"
                            type="single"
                            valueInput={field.value}
                            onSelect={(val) => field.onChange(val)}
                            fullWidth
                        />
                    )}
                />

                {/* Country */}
                <Controller
                    name="locationCountry"
                    control={f.control}
                    render={({ field }) => (
                        <CountrySelector
                            id="locationCountry"
                            label={t("training.country")}
                            value={field.value}
                            onSelect={(val) => field.onChange(val)}
                            fullWidth
                        />
                    )}
                />

                {/* Languages */}
                <Controller
                    name="languages"
                    control={f.control}
                    render={({ field }) => (
                        <DictionarySelector
                            id="languages"
                            label={t("training.languages")}
                            code="LANGUAGES"
                            type="multi"
                            valueInput={field.value}
                            onSelect={(val) => field.onChange(val)}
                            fullWidth
                        />
                    )}
                />
            </div>

            <div className="px-4 pb-6 flex flex-col gap-2">
                <Button fullWidth size={BtnSizes.LARGE} onClick={submit}>{t("common.search")}</Button>
                <Button fullWidth size={BtnSizes.LARGE} mode={BtnModes.SECONDARY} onClick={reset}>{t("common.resetFilters")}</Button>
            </div>
        </div>
    );
};

export default TrainingSearchFiltersView;
