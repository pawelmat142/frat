import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import OfferFormProvider, { useOfferForm } from "./OfferFormProvider";
import { Currencies, OFFER_STEPS_ORDER, OfferFormSteps, OfferI } from "@shared/interfaces/OfferI";
import { toast } from "react-toastify";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import OfferFormStepOne from "./OfferFormStepOne";
import OfferFormStepTwo from "./OfferFormStepTwo";
import OfferFormStepThree from "./OfferFormStepThree";
import { OffersService } from "offer/services/OffersService";
import { useEffect, useState } from "react";
import Loading from "global/components/Loading";
import { Path } from "../../../path";
import { useUserContext } from "user/UserProvider";
import { useOffersContext } from "offer/OffersProvider";
import { OfferUtil } from "@shared/utils/OfferUtil";
import { Utils } from "global/utils/utils";
import FormWizard from "global/components/FormWizard/FormWizard";
import { DateUtil } from "@shared/utils/DateUtil";
import { GeocodedPosition, Position } from "@shared/interfaces/MapsInterfaces";
import { GoogleMapService } from "global/services/GoogleMapService";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";

// TODO move to config - share with front
const DEFAUT_POINT: Position = { lat: 52.2297, lng: 21.0122 }; // Warsaw center as default point

const OfferFormContent: React.FC = () => {

    const isDevMode = Utils.isDevMode();

    const navigate = useNavigate();
    const { t } = useTranslation();
    const ctx = useOfferForm();
    const userCtx = useUserContext();
    const offersCtx = useOffersContext();
    const globalCtx = useGlobalContext();
    const [loading, setLoading] = useState(false);

    const param = useParams<{ offerId?: string }>();
    const offerId = param.offerId;

    const initFormIfEditMode = async (offerId?: string) => {
        if (!offerId) {
            prefillFormIfNewOffer()
            return
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

    const prefillFormIfNewOffer = async () => {
        const position = await getGeoPosition()
        if (position) {
            const countryCode = position.country?.toLocaleLowerCase();
            const languagesDictionary = globalCtx.dics.languages;
            if (!languagesDictionary) {
                throw new Error("LANGUAGES dictionary not found");
            }
            if (countryCode) {
                const element = DictionaryUtil.getElementByCountryCode(languagesDictionary, countryCode || "")
                if (element) {
                    const currencyCode = element.values.CURRENCY
                    if (currencyCode) {
                        ctx.formCtx.setValue("STEP_THREE.currency", currencyCode);
                    }
                }
            }
            ctx.formCtx.setValue("STEP_TWO.geocodedPosition", position)
            ctx.formCtx.setValue("STEP_TWO.locationCountry", countryCode)
        }

        const phoneNumber =  offersCtx.offers.find(o => o.phoneNumber)?.phoneNumber
        if (phoneNumber) {
            ctx.formCtx.setValue("STEP_ONE.phoneNumber", phoneNumber)
        }

        ctx.formCtx.setValue("STEP_ONE.startDate", DateUtil.toLocalDateString(new Date()))
        

    }

    useEffect(() => {
        initFormIfEditMode(offerId);
    }, [offerId]);

    const getGeoPosition = async (): Promise<GeocodedPosition | null> => {
        if (userCtx.position) {
            // Use backend geocoding to avoid API key restrictions
            const position = await GoogleMapService.reverseGeocodeViaBackend({
                lat: userCtx.position.lat,
                lng: userCtx.position.lng,
            });
            if (position) {
                return position;
            }
        }
        return null;
    }


    const onSubmit = async () => {
        const valid = await ctx.formCtx.trigger();
        if (!valid) {
            toast.error(t("offer.form.validation.formInvalid"));
            return;
        }

        try {
            setLoading(true);
            ctx.saveFormToLocalStorage(ctx.form);
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
            await offersCtx.initOffers();
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
            ctx.removeFormFromLocalStorage();
        }
    }

    const renderStep = () => {
        switch (ctx.form?.currentStep) {
            case OfferFormSteps.STEP_ONE:
                return <OfferFormStepOne />;
            case OfferFormSteps.STEP_TWO:
                return <OfferFormStepTwo />;
            case OfferFormSteps.STEP_THREE:
                return <OfferFormStepThree />;
            default:
                return null;
        }
    }

    const handleDevFill = () => {
        ctx.formCtx.setValue("STEP_ONE.category", "SCAFFOLD");
        ctx.formCtx.setValue("STEP_ONE.startDate", DateUtil.toLocalDateString(new Date()));
        ctx.formCtx.setValue("STEP_ONE.communicationLanguages", ["pl", "en"]);
        ctx.formCtx.setValue("STEP_ONE.phoneNumber", { prefix: "+48", number: "123456789" });

        ctx.formCtx.setValue("STEP_TWO.locationCountry", "pl");
        ctx.formCtx.setValue("STEP_TWO.geocodedPosition", DEFAUT_POINT);

        ctx.formCtx.setValue("STEP_THREE.displayName", "Praca na budowie");
        ctx.formCtx.setValue("STEP_THREE.salary", 5000);
        ctx.formCtx.setValue("STEP_THREE.currency", Currencies.PLN);
    };

    const LOCAL_STORAGE_KEY = 'offerFormDraft';

    if (loading) {
        return <Loading />;
    }

    return (
        <FormWizard
            localStorageKey={LOCAL_STORAGE_KEY}
            formRef={ctx.formCtx}
            stepsOrder={OFFER_STEPS_ORDER}
            currentStep={ctx.form.currentStep}
            onFinalSubmit={onSubmit}
            onSelectStep={ctx.selectStep}
        >
            <>
                {renderStep()}

                {isDevMode && (
                    <div className="flex items-center justify-end">
                        <Button onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT}>
                            DEV FILL
                        </Button>
                    </div>
                )}
            </>
        </FormWizard>
    );
}

const OfferFormView: React.FC = () => {
    return (
        <OfferFormProvider>
            <OfferFormContent />
        </OfferFormProvider>
    );
}
export default OfferFormView;