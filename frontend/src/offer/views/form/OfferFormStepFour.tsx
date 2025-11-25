import { FormValidator } from "global/FormValidator";
import { useTranslation } from "react-i18next";
import { useOfferForm } from "./OfferFormProvider";

const OfferFormStepFour: React.FC = () => {

    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const ctx = useOfferForm();

    return (
        <>
            <h2 className="form-subheader">
                {t("offer.form.stepFour.title")}
            </h2>
            <div className="flex flex-col gap-7 md:gap-5">

                {/* TODO */}
            </div>
        </>
    )
}
export default OfferFormStepFour;