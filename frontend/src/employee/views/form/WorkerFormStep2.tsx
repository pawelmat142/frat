import React, { useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { WorkerForm, WorkerLocationOption, WorkerLocationOptions } from "@shared/interfaces/WorkerI";
import CountrySelector from "global/components/selector/CountrySelector";
import { Position } from "@shared/interfaces/MapsInterfaces";
import TabSwitcher, { TabSwitcherOption } from "employee/components/TabSwitcher";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import PositionSelector from "global/components/selector/position/PositionSelector";
import { useUserContext } from "user/UserProvider";
import { DEFAUT_POSITION } from "offer/views/form/OfferFormStepOne";
import Loading from "global/components/Loading";
import { PositionService } from "global/services/PositionService";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
    initPosition?: () => void;
}


const WorkerFormStep2: React.FC<Props> = ({ formRef, initPosition }) => {
    const { control, formState, setValue, watch } = formRef;
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const required = FormValidator.required(t);
    const [geoLoading, setGeoLoading] = useState(false);

    const locationOption = watch("step2.locationOption");

    const preparePosition = (): Position => {
        return userCtx.position || DEFAUT_POSITION;
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
                setValue("step2.countryCode", countryCode);
            }
        } catch (e) {
            // Intentionally swallow errors – network issues shouldn't break filter sheet.
        } finally {
            setGeoLoading(false);
        }
    }

    const state = watch()

    const tabOptions: TabSwitcherOption[] = [
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.POSITION}.tab`),
            code: WorkerLocationOptions.POSITION,
        },
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.SELECTED_COUNTRIES}.tab`),
            code: WorkerLocationOptions.SELECTED_COUNTRIES,
        },
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.ALL_EUROPE}.tab`),
            code: WorkerLocationOptions.ALL_EUROPE,
        },
    ];
    const msgClass = "secondary-text mb-5"


    const handleCountryChange = (newCountryCode: string | null) => {
        setValue("step2.countryCode", newCountryCode || undefined);
        setValue("step2.geocodedPosition", undefined);
    };

    const resetLocation = () => {
        if (initPosition) {
            initPosition();
        } else {
            setValue("step2.countryCode", undefined);
            setValue("step2.geocodedPosition", undefined);
        }
    }

    return (
        <>
            <h2 className="form-subheader">{t("employeeProfile.form.step2.title")}</h2>

            {/* Country Selector */}
            <Controller
                name="step2.countryCode"
                control={control}
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
                        error={formState.errors.step2?.countryCode}
                    />
                )}
            />

            {geoLoading ? (<Loading></Loading>) : (<Controller
                name="step2.geocodedPosition"
                control={control}
                render={({ field }) => (
                    <PositionSelector
                        label={t("offer.workLocation")}
                        name="step2.geocodedPosition"
                        className="w-full"
                        value={field.value}
                        initialPosition={preparePosition()}
                        required
                        onChange={(p) => {
                            autofillCountryByPosition(p);
                            field.onChange(p);
                        }}
                        error={formState.errors.step2?.geocodedPosition}
                    />
                )}
            />)}

            <p className={`${msgClass} s-font mt-2 mb-0`}>{t("employeeProfile.form.step2.info")}</p>

            <div>
                <Button fullWidth mode={BtnModes.PRIMARY_TXT} onClick={resetLocation}>{t("employeeProfile.form.resetLocation")}</Button>
            </div>


            <h2 className="form-subheader mt-10">{t("employeeProfile.form.step2.chooseOptions")}</h2>

            <div className="flex flex-col gap-5 md:gap-5 mt-5">
                <TabSwitcher
                    options={tabOptions}
                    value={locationOption}
                    onChange={code => setValue("step2.locationOption", code as WorkerLocationOption)}
                />

                <div className="w-full flex">
                    <div className="primary-text w-full">
                        {locationOption === WorkerLocationOptions.ALL_EUROPE && (
                            <div className={msgClass}>
                                {t("employeeProfile.form.locationOption.ALL_EUROPE.msg")}
                            </div>
                        )}
                        {locationOption === WorkerLocationOptions.SELECTED_COUNTRIES && (
                            <div className="w-full">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.locationOption.SELECTED_COUNTRIES.msg")}
                                </div>
                                <Controller
                                    name="step2.locationCountries"
                                    control={control}
                                    rules={required}
                                    render={({ field }) => (
                                        <DictionarySelector
                                            type="multi"
                                            className="w-full"
                                            valueInput={field.value ?? []}
                                            onSelectMulti={items => field.onChange(items.map(i => String(i)))}
                                            label={t("employeeProfile.form.locationCountries")}
                                            code="LANGUAGES"
                                            elementLabelTranslationKey="COUNTRY_NAME"
                                            fullWidth
                                            required
                                            error={formState?.errors.step2?.locationCountries}
                                        />
                                    )}
                                />
                            </div>
                        )}
                        {locationOption === WorkerLocationOptions.POSITION && (
                            <div className="flex flex-col gap-3">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.locationOption.POSITION.msg")}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-5 md:gap-5">



            </div>
        </>
    );
};

export default WorkerFormStep2;
