import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import OfferFormProvider, { useOfferForm } from "./OfferFormProvider";
import { OFFER_STEPS_ORDER, OfferFormStep, OfferFormSteps } from "@shared/interfaces/OfferI";
import { toast } from "react-toastify";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import OfferFormStepOne from "./OfferFormStepOne";
import OfferFormStepTwo from "./OfferFormStepTwo";
import OfferFormStepThree from "./OfferFormStepThree";
import OfferFormStepFour from "./OfferFormStepFour";
import { Utils } from "global/utils";
import { OffersService } from "offer/services/OffersService";
import { useState } from "react";
import Loading from "global/components/Loading";
import { Path } from "../../../path";

const OfferFormContent: React.FC = () => {

    const isDevMode = Utils.isDevMode();

    const navigate = useNavigate();
    const { t } = useTranslation();
    const ctx = useOfferForm();

    const [loading, setLoading] = useState(false);
    const currentStep = ctx.form?.currentStep;

    const onSubmit = async () => {
        const valid = await ctx.formCtx.trigger();
        if (!valid) {
            // TODO
            toast.error(t(""));
            return;
        }

        try {
            setLoading(true);
            const offer = await OffersService.createOffer(ctx.form);
            if (!offer) {
                throw new Error("TODO");
            }
            ctx.removeFormFromLocalStorage();
            toast.success(t("TODO"));
            navigate(Path.getOffersPath(offer.uid));
        } catch (error) {
            toast.error(t(""));
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
        <div className="form-view relative mt-10">
            <h2 className="form-header">
                {t("offer.form.title")}
            </h2>

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

                    <div className="flex gap-4 mt-10 mb-10">
                        {currentStep !== OfferFormSteps.STEP_ONE && (
                            <Button
                                type="button"
                                onClick={ctx.prevStep}
                                size={BtnSizes.LARGE}
                                mode={BtnModes.SECONDARY}
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
                                mode={BtnModes.PRIMARY}
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