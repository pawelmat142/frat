import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";
import { FormValidator } from "global/FormValidator";
import CountrySelector from "global/components/selector/CountrySelector";
import Loading from "global/components/Loading";
import { useState } from "react";
import PositionSelector from "global/components/selector/position/PositionSelector";
import { useUserContext } from "user/UserProvider";
import { GeocodedPosition, Position } from "@shared/interfaces/MapsInterfaces";
import { DEFAUT_POINT } from "./OfferFormStepOne";
import { PositionService } from "global/services/PositionService";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import { GoogleMapService } from "global/services/GoogleMapService";

const OfferFormStepTwo: React.FC = () => {

    const { t } = useTranslation();
    const ctx = useOfferForm();
    const userCtx = useUserContext();
    const required = FormValidator.required(t);

    const [geoLoading, setGeoLoading] = useState(false);


    const handleCountryChange = (newCountryCode: string | null) => {
        ctx.formCtx.setValue("STEP_TWO.locationCountry", newCountryCode || undefined);
        ctx.formCtx.setValue("STEP_TWO.geocodedPosition", undefined);
    };

    const preparePosition = (): Position => {
        return userCtx.position || DEFAUT_POINT;
    }

    const resetLocation = async () => {
        const position = await initPosition();
        if (position) {
            ctx.formCtx.setValue("STEP_TWO.geocodedPosition", position);
        } else {
            ctx.formCtx.setValue("STEP_TWO.locationCountry", undefined);
            ctx.formCtx.setValue("STEP_TWO.geocodedPosition", undefined);
        }
    }

    /**
     * Attempt to reverse geocode the provided lat/lng and update country filter automatically.
     * Uses OpenStreetMap Nominatim (public) – consider proxying via backend for production to respect rate limits.
     */
    const autofillCountryByPosition = async (position?: Position | null) => {
        if (!position) {
            return;
        }
        setGeoLoading(true);
        try {
            const countryCode = await PositionService.callApiFindCountryByPosition(position);
            if (countryCode) {
                ctx.formCtx.setValue("STEP_TWO.locationCountry", countryCode);
            }
        } catch (e) {
            // Intentionally swallow errors – network issues shouldn't break filter sheet.
        } finally {
            setGeoLoading(false);
        }
    }

    const initPosition = async (): Promise<GeocodedPosition | null> => {
        if (userCtx.position) {
            setGeoLoading(true);
            const position = await GoogleMapService.reverseGeocodeViaBackend({
                lat: userCtx.position.lat,
                lng: userCtx.position.lng,
            });
            setGeoLoading(false);
            if (position) {
                return position;
            }
        }
        return null;
    }


    return (
        <>
            <h2 className="form-subheader">
                {t("offer.form.STEP_TWO.title")}
            </h2>
            <div className="flex flex-col gap-2">

                {/* Country Selector */}
                <Controller
                    name="STEP_TWO.locationCountry"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <CountrySelector
                            className="w-full mb-2"
                            value={field.value ?? ""}
                            onSelect={(countryCode) => {
                                handleCountryChange(countryCode);
                            }}
                            label={t("employeeProfile.form.locationCountry")}
                            fullWidth
                            required
                            error={ctx.formCtx.formState.errors.STEP_TWO?.locationCountry}
                        />
                    )}
                />

                {geoLoading ? (<Loading></Loading>) : (<Controller
                    name="STEP_TWO.geocodedPosition"
                    control={ctx.formCtx.control}
                    rules={required}
                    render={({ field }) => (
                        <PositionSelector
                            label={t("offer.workLocation")}
                            name="STEP_TWO.geocodedPosition"
                            className="w-full"
                            value={field.value}
                            initialPosition={preparePosition()}
                            required
                            onChange={(p) => {
                                autofillCountryByPosition(p);
                                field.onChange(p);
                            }}
                            error={ctx.formCtx.formState.errors.STEP_TWO?.geocodedPosition}
                        />
                    )}
                />)}

                <p className={`secondary-text mb-5 small-font mt-2`}>{t("offer.form.STEP_TWO.info")}</p>

                <div>
                    <Button fullWidth mode={BtnModes.PRIMARY_TXT} onClick={resetLocation}>{t("employeeProfile.form.resetLocation")}</Button>
                </div>


            </div>
        </>
    )
}
export default OfferFormStepTwo;