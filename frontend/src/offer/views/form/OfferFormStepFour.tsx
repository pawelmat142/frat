import { useTranslation } from "react-i18next";
import CertificateSelector from "global/components/selector/CertificateSelector";
import { useOfferForm } from "./OfferFormProvider";

const OfferFormStepFour: React.FC = () => {
    const { t } = useTranslation();
    const { formCtx } = useOfferForm();

    return (
        <>
            <h2 className="form-subheader">{t("offer.form.STEP_FOUR.title")}</h2>
            
            <p className="secondary-text mb-5 s-font">
                {t("offer.form.STEP_FOUR.info")}
            </p>

            <CertificateSelector
                formRef={formCtx}
                fieldName="STEP_FOUR.requiredCertificates"
            />
        </>
    );
};

export default OfferFormStepFour;