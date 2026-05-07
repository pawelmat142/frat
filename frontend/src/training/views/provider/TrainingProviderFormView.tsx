import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ProviderFormData, TrainingProviderProfileI } from "@shared/interfaces/TrainingI";
import { TrainingService } from "training/services/TrainingService";
import { Path } from "../../../path";
import { useGlobalContext } from "global/providers/GlobalProvider";
import Header from "global/components/Header";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { BtnSizes } from "global/interface/controls.interface";
import FloatingInput from "global/components/controls/FloatingInput";
import FloatingTextarea from "global/components/controls/FloatingTextarea";
import { FormValidator } from "global/FormValidator";
import CountryAndLocationSelector, { LocationFilterValue } from "global/components/controls/CountryAndLocationSelector";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { useUserContext } from "user/UserProvider";
import PhoneNumberFloatingInput from "global/components/controls/PhoneNumberFloatingInput";

// TODO required validation for geo position not working
const TrainingProviderFormView: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const globalCtx = useGlobalContext();
    const userCtx = useUserContext();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const trainingProvider = userCtx.meCtx?.trainingProvider;

    const f = useForm<ProviderFormData>({
        defaultValues: {
            companyName: '',
            description: '',
            website: '',
            contactEmail: '',
            phoneNumber: { prefix: "+00", number: "" },
            locationCountry: '',
            geocodedPosition: null,
        }
    });

    const required = FormValidator.required(t);
    f.register("geocodedPosition", required);
    f.register("locationCountry", required);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                if (!trainingProvider) {
                    setIsEditMode(false);
                    return;
                }
                setIsEditMode(true);
                f.reset({
                    companyName: trainingProvider.companyName,
                    description: trainingProvider.description ?? '',
                    website: trainingProvider.website ?? '',
                    contactEmail: trainingProvider.contactEmail ?? '',
                    locationCountry: trainingProvider.locationCountry,
                    geocodedPosition: trainingProvider.point ? PositionUtil.fromGeoPoint(trainingProvider.point) : null,
                    phoneNumber: trainingProvider.phoneNumber ? {
                        prefix: trainingProvider.phoneNumber.prefix,
                        number: trainingProvider.phoneNumber.number
                    } : { prefix: "+00", number: "" }
                });
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const onSubmit = async (data: ProviderFormData) => {
        try {
            setSaving(true);
            if (isEditMode) {
                const result = await TrainingService.updateProviderProfile(data);
                userCtx.updateMeCtx({ ...userCtx.meCtx!, trainingProvider: result });
                toast.success(t("training.provider.updateSuccess"));
            } else {
                const result = await TrainingService.createProviderProfile(data);
                userCtx.updateMeCtx({ ...userCtx.meCtx!, trainingProvider: result });
                toast.success(t("training.provider.createSuccess"));
            }
            navigate(Path.MY_TRAININGS);
        } catch {
            toast.error(t("training.provider.saveError"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

    console.log(f.formState.errors.geocodedPosition);

    return (
        <>
            <Header
                title={isEditMode ? t("training.provider.editTitle") : t("training.provider.createTitle")}
            />
            <div className="form-view flex flex-col primary-bg">

                <form onSubmit={f.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4 flex-1">

                    <Controller
                        name="companyName"
                        control={f.control}
                        rules={required}
                        render={({ field, fieldState }) => (
                            <FloatingInput
                                id="companyName"
                                label={t("training.provider.companyName")}
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error}
                                required
                            />
                        )}
                    />

                    <Controller
                        name="description"
                        control={f.control}
                        rules={required}
                        render={({ field, fieldState }) => (
                            <FloatingTextarea
                                id="description"
                                label={t("training.provider.description")}
                                value={field.value ?? null}
                                onChange={field.onChange}
                                error={fieldState.error}
                                required
                            />
                        )}
                    />

                    <Controller
                        name="contactEmail"
                        control={f.control}
                        rules={required}
                        render={({ field, fieldState }) => (
                            <FloatingInput
                                id="contactEmail"
                                label={t("training.provider.contactEmail")}
                                value={field.value ?? null}
                                onChange={field.onChange}
                                error={fieldState.error}
                                required
                            />
                        )}
                    ></Controller>

                    <Controller
                        name="phoneNumber"
                        control={f.control}
                        rules={{
                            ...required,
                            ...FormValidator.phoneNumber(t)
                        }}
                        render={({ field, fieldState }) => (
                            <PhoneNumberFloatingInput
                                {...field}
                                label={t("employeeProfile.form.phoneNumber")}
                                fullWidth
                                required
                                error={fieldState.error}
                            />
                        )}
                    />

                    <Controller
                        name="website"
                        control={f.control}
                        render={({ field }) => (
                            <FloatingInput
                                id="website"
                                label={t("training.provider.website")}
                                value={field.value ?? null}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    {/* Location – required for geosearch */}
                    <Controller
                        name="locationCountry"
                        control={f.control}
                        rules={required}
                        render={({ field: countryField, fieldState }) => (
                            <Controller
                                name="geocodedPosition"
                                control={f.control}
                                render={({ field: posField }) => (
                                    <CountryAndLocationSelector
                                        value={{
                                            locationCountry: countryField.value ?? null,
                                            geocodedPosition: posField.value ?? null,
                                        }}
                                        onChange={(val: LocationFilterValue) => {
                                            countryField.onChange(val.locationCountry);
                                            posField.onChange(val.geocodedPosition);
                                        }}
                                        config={{ locationOption: 'searchbar', showRadiusSlider: false }}
                                        errors={{ 
                                            locationCountry: fieldState.error, 
                                            geocodedPosition: f.formState.errors.geocodedPosition 
                                        }}
                                        positionRequired
                                    />
                                )}
                            />
                        )}
                    />

                    <div className="mt-10 pb-6">
                        <Button type="submit" fullWidth size={BtnSizes.LARGE} disabled={saving}>
                            {saving ? t("common.saving") : isEditMode ? t("common.save") : t("training.provider.create")}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default TrainingProviderFormView;
