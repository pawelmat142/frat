import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { TrainingI } from "@shared/interfaces/TrainingI";
import { TrainingService } from "training/services/TrainingService";
import { Path } from "../../../path";
import { useUserContext } from "user/UserProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import Header from "global/components/Header";
import Loading from "global/components/Loading";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import FloatingInput from "global/components/controls/FloatingInput";
import FloatingTextarea from "global/components/controls/FloatingTextarea";
import { FormValidator } from "global/FormValidator";
import DictionarySelector from "global/components/selector/DictionarySelector";
import CountryAndLocationSelector, { LocationFilterValue } from "global/components/controls/CountryAndLocationSelector";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";
import { PositionUtil } from "@shared/utils/PositionUtil";
import Checkbox from "global/components/controls/Checkbox";
import FloatingStepSlider from "global/components/controls/FloatingStepSlider";

interface TrainingFormData {
    title: string;
    description?: string;
    certificateCode: string;
    languages?: string[];
    locationCountry: string;
    geocodedPosition?: GeocodedPosition | null;
    price?: number;
    currency?: string;
    isRecurring: boolean;
    recurringIntervalDays?: number;
    maxParticipants?: number;
    contactEmail?: string;
    contactWebsite?: string;
}

const RECURRING_INTERVAL_STEPS = [30, 60, 90, 120, 180, 365];

const TrainingFormView: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();

    const { trainingId } = useParams<{ trainingId?: string }>();
    const isEditMode = !!trainingId;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [providerId, setProviderId] = useState<number | null>(null);

    const f = useForm<TrainingFormData>({
        defaultValues: {
            isRecurring: false,
            languages: [],
        },
    });

    const isRecurring = f.watch("isRecurring");
    const required = FormValidator.required(t);

    useEffect(() => {
        globalCtx.hideFooter();
        return () => globalCtx.showFooter();
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // Load provider profile to get providerId
                const profile = await TrainingService.getMyProviderProfile();
                setProviderId(profile.providerId);

                if (isEditMode) {
                    const training = await TrainingService.getTrainingById(Number(trainingId));
                    f.reset({
                        title: training.title,
                        description: training.description,
                        certificateCode: training.certificateCode,
                        languages: training.languages,
                        locationCountry: training.locationCountry,
                        price: training.price,
                        currency: training.currency,
                        isRecurring: training.isRecurring,
                        recurringIntervalDays: training.recurringIntervalDays,
                        maxParticipants: training.maxParticipants,
                        contactEmail: training.contactEmail,
                        contactWebsite: training.contactWebsite,
                    });
                }
            } catch {
                toast.error(t("training.form.loadError"));
                navigate(Path.MY_TRAININGS);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [trainingId]);

    const onSubmit = async (data: TrainingFormData) => {
        if (!providerId) return;

        const point = data.geocodedPosition
            ? PositionUtil.toGeoPoint({ lat: data.geocodedPosition.lat, lng: data.geocodedPosition.lng })
            : undefined;

        const payload: Partial<TrainingI> & { providerId?: number } = {
            title: data.title,
            description: data.description,
            certificateCode: data.certificateCode,
            languages: data.languages,
            locationCountry: data.locationCountry,
            displayAddress: data.geocodedPosition?.fullAddress,
            point: point as any,
            price: data.price ? Number(data.price) : undefined,
            currency: data.currency,
            isRecurring: data.isRecurring,
            recurringIntervalDays: data.isRecurring ? data.recurringIntervalDays : undefined,
            maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : undefined,
            contactEmail: data.contactEmail,
            contactWebsite: data.contactWebsite,
        };

        try {
            setSaving(true);
            if (isEditMode) {
                await TrainingService.updateTraining(Number(trainingId), payload);
                toast.success(t("training.form.updateSuccess"));
            } else {
                await TrainingService.createTraining({ ...payload, providerId });
                toast.success(t("training.form.createSuccess"));
            }
            navigate(Path.MY_TRAININGS);
        } catch {
            toast.error(t("training.form.saveError"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="form-view flex flex-col primary-bg">
            <Header
                onBack={() => navigate(Path.MY_TRAININGS)}
                title={isEditMode ? t("training.form.editTitle") : t("training.form.createTitle")}
            />

            <form onSubmit={f.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 py-4 flex-1">

                {/* Title */}
                <Controller
                    name="title"
                    control={f.control}
                    rules={{ validate: required }}
                    render={({ field, fieldState }) => (
                        <FloatingInput
                            id="title"
                            label={t("training.form.title")}
                            value={field.value ?? null}
                            onChange={field.onChange}
                            error={fieldState.error ? { message: fieldState.error.message } : null}
                            required
                        />
                    )}
                />

                {/* Certificate */}
                <Controller
                    name="certificateCode"
                    control={f.control}
                    rules={{ validate: required }}
                    render={({ field, fieldState }) => (
                        <DictionarySelector
                            id="certificateCode"
                            label={t("training.certificate")}
                            code="CERTIFICATES"
                            type="single"
                            valueInput={field.value}
                            onSelect={(val) => field.onChange(val)}
                            required
                            fullWidth
                        />
                    )}
                />

                {/* Location */}
                <Controller
                    name="locationCountry"
                    control={f.control}
                    rules={{ validate: required }}
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
                                    errors={{
                                        locationCountry: fieldState.error
                                    }}
                                    countryRequired
                                />
                            )}
                        />
                    )}
                />

                {/* Description */}
                <Controller
                    name="description"
                    control={f.control}
                    render={({ field }) => (
                        <FloatingTextarea
                            id="description"
                            label={t("training.form.description")}
                            value={field.value ?? null}
                            onChange={field.onChange}
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

                {/* Price + Currency */}
                <div className="flex gap-2">
                    <Controller
                        name="price"
                        control={f.control}
                        render={({ field }) => (
                            <FloatingInput
                                id="price"
                                label={t("training.form.price")}
                                type="number"
                                value={field.value ?? null}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <Controller
                        name="currency"
                        control={f.control}
                        render={({ field }) => (
                            <FloatingInput
                                id="currency"
                                label={t("training.form.currency")}
                                value={field.value ?? null}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>

                {/* Max participants */}
                <Controller
                    name="maxParticipants"
                    control={f.control}
                    render={({ field }) => (
                        <FloatingInput
                            id="maxParticipants"
                            label={t("training.form.maxParticipants")}
                            type="number"
                            value={field.value ?? null}
                            onChange={field.onChange}
                        />
                    )}
                />

                {/* Recurring */}
                <Controller
                    name="isRecurring"
                    control={f.control}
                    render={({ field }) => (
                        <Checkbox
                            id="isRecurring"
                            label={t("training.form.isRecurring")}
                            checked={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />

                {isRecurring && (
                    <Controller
                        name="recurringIntervalDays"
                        control={f.control}
                        render={({ field }) => (
                            <FloatingStepSlider
                                label={t("training.form.recurringInterval")}
                                steps={RECURRING_INTERVAL_STEPS}
                                value={field.value ?? RECURRING_INTERVAL_STEPS[1]}
                                onChange={field.onChange}
                                displayValue={(v) => `${v} ${t("training.form.days")}`}
                            />
                        )}
                    />
                )}

                {/* Contact */}
                <Controller
                    name="contactEmail"
                    control={f.control}
                    render={({ field }) => (
                        <FloatingInput
                            id="contactEmail"
                            label={t("training.form.contactEmail")}
                            type="email"
                            value={field.value ?? null}
                            onChange={field.onChange}
                        />
                    )}
                />
                <Controller
                    name="contactWebsite"
                    control={f.control}
                    render={({ field }) => (
                        <FloatingInput
                            id="contactWebsite"
                            label={t("training.form.contactWebsite")}
                            value={field.value ?? null}
                            onChange={field.onChange}
                        />
                    )}
                />

                <div className="mt-auto pb-6">
                    <Button
                        type="submit"
                        fullWidth
                        size={BtnSizes.LARGE}
                        disabled={saving}
                    >
                        {saving ? t("common.saving") : isEditMode ? t("common.save") : t("training.form.create")}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default TrainingFormView;
