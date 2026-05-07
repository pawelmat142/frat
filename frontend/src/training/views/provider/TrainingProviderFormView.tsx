import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TrainingProviderProfileI } from "@shared/interfaces/TrainingI";
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

interface ProviderFormData {
    companyName: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    locationCountry: string;
    geocodedPosition?: GeocodedPosition | null;
}

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
            locationCountry: '',
            geocodedPosition: null,
        }
    });
    const required = FormValidator.required(t);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // TODO
                // const profile = await TrainingService.getMyProviderProfile();
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
                });
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const onSubmit = async (data: ProviderFormData) => {
        const point = data.geocodedPosition
            ? PositionUtil.toGeoPoint({ lat: data.geocodedPosition.lat, lng: data.geocodedPosition.lng })
            : undefined;

        const payload: Partial<TrainingProviderProfileI> = {
            companyName: data.companyName,
            description: data.description,
            website: data.website,
            contactEmail: data.contactEmail,
            locationCountry: data.locationCountry,
            displayAddress: data.geocodedPosition?.fullAddress,
            point: point as any,
        };

        try {
            setSaving(true);
            if (isEditMode) {
                await TrainingService.updateProviderProfile(payload);
                toast.success(t("training.provider.updateSuccess"));
            } else {
                await TrainingService.createProviderProfile(payload);
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

    return (
        <>
            <Header
                onBack={() => navigate(Path.MY_TRAININGS)}
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
                        render={({ field }) => (
                            <FloatingTextarea
                                id="description"
                                label={t("training.provider.description")}
                                value={field.value ?? null}
                                onChange={field.onChange}
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

                    <Controller
                        name="contactEmail"
                        control={f.control}
                        render={({ field }) => (
                            <FloatingInput
                                id="contactEmail"
                                label={t("training.provider.contactEmail")}
                                type="email"
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
                                        errors={{ locationCountry: fieldState.error }}
                                        countryRequired
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
