import { NotificationTypes } from "@shared/interfaces/NotificationI";
import { OfferI } from "@shared/interfaces/OfferI";
import { DateUtil } from "@shared/utils/DateUtil";
import DateInputViewSelector from "global/components/callendar/DateInputViewSelector";
import Header from "global/components/Header";
import { FormValidator } from "global/FormValidator";
import { useNotificationsContext } from "notification/NotificationsProvider";
import { OffersService } from "offer/services/OffersService";
import { Path } from "../../../path";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserContext } from "user/UserProvider";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Button from "global/components/controls/Button";
import AvatarTile from "user/components/AvatarTile";
import { AppConfig } from "@shared/AppConfig";
import OfferAvatarMock from "offer/components/OfferAvatarMock";
import Loading from "global/components/Loading";

const OfferAvailabilityEditView: React.FC = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const notificationsCtx = useNotificationsContext();

    const param = useParams<{ offerId?: string }>();
    const offerId = param.offerId;

    const [loading, setLoading] = useState(false);


    if (!offerId) {
        throw new Error("Offer ID is required for editing availability.");
    }

    const offer = userCtx?.meCtx?.offers?.find((o) => o.offerId === offerId);

    if (!offer) {
        throw new Error(`Offer with ID ${offerId} not found.`);
    }


    const startDate = DateUtil.toLocalDateString(offer.startDate);

    const requiredDateNotInPast = FormValidator.requiredLocalStringDateNotInPast(t);
    const formCtx = useForm<{ startDate: string | null }>({ defaultValues: { startDate: startDate || null } });
    const form = formCtx.watch();

    useEffect(() => {
        formCtx.trigger()
    }, [])

    const removeNotificationAboutOfferExpirationIfExists = (offer: OfferI) => {
        const isOfferExpired = DateUtil.isBefore(offer.startDate, new Date());
        if (isOfferExpired) {
            return;
        }
        const notification = notificationsCtx.notifications.find(n => n.type === NotificationTypes.OFFER_EXPIRATION && n.targetId === offer.offerId);
        if (notification) {
            notificationsCtx.removeNotification(notification.notificationId);
        }
    }

    const handleSave = async () => {
        // Validate form before saving
        const isValid = await formCtx.trigger();
        if (!isValid) {
            return;
        }

        try {
            const startDate = formCtx.getValues("startDate");
            if (!startDate) {
                return
            }
            setLoading(true);
            const result = await OffersService.updateOfferStartDate(offerId, startDate);
            if (!result) {
                throw new Error(t("offer.form.validation.createError"));
            }
            removeNotificationAboutOfferExpirationIfExists(result);
            await userCtx.initOffers();
            toast.success(t("offer.form.successUpdate"));
            navigate(Path.getOfferPath(result.offerId));
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading></Loading>
    }

    return (
        <>
            <Header title={t('notification.updateDate')} />

            <div className="form-view flex flex-col">

                {offer.avatarRef ? (<div className="notification-avatar-wrapper mt-2">
                    <AvatarTile
                        src={offer.avatarRef?.url}
                        editable={false}
                        uid={""}
                    />
                </div>) : (
                    <div className="notification-view-icon mt-5">
                        <OfferAvatarMock offer={offer} size={AppConfig.SIZE.DEFAULT_AVATAR_BIG} />
                    </div>
                )}

                <div className="text-center my-8">
                    <h3 className="text-xl font-semibold">{offer.displayName}</h3>
                </div>

                <form className="flex flex-col flex-1"
                    onSubmit={formCtx.handleSubmit(() => { }, (errors) => {
                        console.log('Form errors', errors)
                        toast.error(t('common.sww'))
                    })}
                    noValidate
                >

                    <Controller
                        name={`startDate`}
                        control={formCtx.control}
                        rules={requiredDateNotInPast}
                        render={({ field }) => <DateInputViewSelector
                            label={t("offer.dateRange")}
                            className="w-full"
                            value={field.value}
                            onChange={(date) => {
                                field.onChange(date);
                                formCtx.trigger("startDate");
                            }}
                            error={formCtx.formState.errors.startDate?.message}
                        />
                        }
                    />

                    <div className="flex flex-col gap-3 mt-6">
                        <Button
                            type="button"
                            onClick={handleSave}
                            size={BtnSizes.LARGE}
                            mode={BtnModes.PRIMARY}
                            className="flex-1 w-full"
                            aria-label={t("common.save")}
                        >
                            {t("common.save")}
                        </Button>
                    </div>

                </form>
            </div>

        </>
    )


}

export default OfferAvailabilityEditView;
