import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import OfferFormProvider, { useOfferForm } from "./OfferFormProvider";
import { OFFER_STEPS_ORDER, OfferFormStep, OfferFormSteps, OfferI } from "@shared/interfaces/OfferI";
import { toast } from "react-toastify";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import OfferFormStepOne from "./OfferFormStepOne";
import OfferFormStepTwo from "./OfferFormStepTwo";
import OfferFormStepThree from "./OfferFormStepThree";
import OfferFormStepFour from "./OfferFormStepFour";
import { OffersService } from "offer/services/OffersService";
import { useEffect, useState } from "react";
import Loading from "global/components/Loading";
import { Path } from "../../../path";
import { useUserContext } from "user/UserProvider";
import { OfferUtil } from "@shared/utils/OfferUtil";
import { Utils } from "global/utils/utils";

const OfferFormContent: React.FC = () => {

    const initFormIfEditMode = async (offerId?: string) => {
        if (!offerId) {
            return;
        }
        try {
            setLoading(true);
            const offer = await OffersService.getOfferById(Number(offerId));
            ctx.initForm(OfferUtil.convertToForm(offer));
        } catch (error) {
            toast.error(t("offer.form.validation.notFound"));
        } finally {
            setLoading(false);
        }
    }

    const isDevMode = Utils.isDevMode();

    const navigate = useNavigate();
    const { t } = useTranslation();
    const ctx = useOfferForm();
    const userCtx = useUserContext();
    const [loading, setLoading] = useState(false);
    const currentStep = ctx.form?.currentStep;

    const param = useParams<{ offerId?: string }>();
    const offerId = param.offerId;

    useEffect(() => {
        initFormIfEditMode(offerId);
    }, [offerId]);

    const onSubmit = async () => {
        const valid = await ctx.formCtx.trigger();
        if (!valid) {
            toast.error(t("offer.form.validation.formInvalid"));
            return;
        }

        try {
            setLoading(true);

            let offer: OfferI | null = null;
            if (offerId) {
                offer = await OffersService.updateOffer(Number(offerId), ctx.form);
                if (!offer) {
                    throw new Error(t("offer.form.validation.createError"));
                }
            } else {
                offer = await OffersService.createOffer(ctx.form);
                if (!offer) {
                    throw new Error(t("offer.form.validation.createError"));
                }
            }
            ctx.removeFormFromLocalStorage();
            await userCtx.initOffers();
            userCtx.setLoading(false);
            if (offerId) {
                toast.success(t("offer.form.successUpdate"));
            } else {
                toast.success(t("offer.form.success"));
            }
            navigate(Path.getOffersPath(offer!.uid));
        } catch (error) {
            toast.error(t("offer.form.validation.createError"));
        } finally {
            setLoading(false);
        }
    }

    const selectStep = async (targetStep: OfferFormStep) => { }

    const renderStep = () => {
        switch (ctx.form?.currentStep) {
            case OfferFormSteps.STEP_ONE:
                return <OfferFormStepOne />;
            case OfferFormSteps.STEP_TWO:
                return <OfferFormStepTwo />;
            case OfferFormSteps.STEP_THREE:
                return <OfferFormStepThree />;
            case OfferFormSteps.STEP_FOUR:
                return <OfferFormStepFour />;
            default:
                return null;
        }
    }

    const handleDevFill = () => {
        ctx.formCtx.setValue("STEP_ONE.category", "SCAFFOLD");
        ctx.formCtx.setValue("STEP_ONE.locationCountry", "pl");
        ctx.formCtx.setValue("STEP_ONE.dateRange", { start: new Date(), end: null });
        ctx.formCtx.setValue("STEP_ONE.availableSlots", 5);

        ctx.formCtx.setValue("STEP_TWO.skillsRequired", ["ONE", "TWO"]);
        ctx.formCtx.setValue("STEP_TWO.skillsNiceToHave", ["THREE", "FOUR"]);
        ctx.formCtx.setValue("STEP_TWO.certificatesRequired", ["ONE", "TWO"]);

        ctx.formCtx.setValue("STEP_THREE.hourlySalaryStart", "100");

        ctx.formCtx.setValue("STEP_FOUR.displayName", "Sample Offer");
        ctx.formCtx.setValue("STEP_FOUR.description", "This is a sample offer description.");
    };

    return (
        <div className="form-view relative">
            {loading ? (
                <Loading></Loading>
            ) : (
                <form
                    onSubmit={ctx.formCtx.handleSubmit(() => { }, errors => {
                        console.log("Form errors", errors);
                        toast.error(t("offer.form.submitError"));
                    })}
                    noValidate
                >
                    {/* Step indicator */}
                    <div className="flex justify-center items-center gap-2 mb-8">
                        {OFFER_STEPS_ORDER.map((step) => (
                            <Button
                                onClick={() => ctx.selectStep(step)}
                                key={step}
                                type="button"
                                mode={ctx.form?.currentStep === step ? BtnModes.PRIMARY_TXT : BtnModes.SECONDARY_TXT}
                                size={BtnSizes.SMALL}
                                disabled={ctx.form?.currentStep === step ||
                                    OFFER_STEPS_ORDER.indexOf(step) > OFFER_STEPS_ORDER.indexOf(ctx.form.currentStep)
                                }
                            >
                                {t(`offer.form.${step}.label`)}
                            </Button>
                        ))}
                    </div>

                    {renderStep()}

                    <div className="flex gap-4 mt-6 mb-10">
                        {currentStep !== OfferFormSteps.STEP_ONE && (
                            <Button
                                type="button"
                                onClick={ctx.prevStep}
                                size={BtnSizes.LARGE}
                                mode={BtnModes.SECONDARY_TXT}
                                className="flex-1"
                            >
                                {t("common.previous")}
                            </Button>
                        )}

                        {currentStep !== OfferFormSteps.STEP_FOUR ? (
                            <Button
                                type="button"
                                onClick={ctx.nextStep}
                                size={BtnSizes.LARGE}
                                mode={BtnModes.PRIMARY_TXT}
                                className="flex-1"
                            >
                                {t("common.next")}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={() => {
                                    onSubmit()
                                }}
                                size={BtnSizes.LARGE}
                                mode={BtnModes.PRIMARY}
                                className="flex-1"
                            >
                                {t("common.save")}
                            </Button>
                        )}

                    </div>
                    {isDevMode && (
                        <div className="flex items-center justify-end">
                            <Button onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT}>
                                DEV FILL
                            </Button>
                        </div>
                    )}

                </form>
            )}

        </div>
    )
}

const OfferFormView: React.FC = () => {
    return (
        <OfferFormProvider>
            <OfferFormContent />
        </OfferFormProvider>
    );
}
export default OfferFormView;