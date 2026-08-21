import { OfferI } from "@shared/interfaces/OfferI";
import TileSection from "employee/components/TileSection";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import ChecklistUi from "global/components/ui/ChecklistUi";
import { Ico } from "global/icon.def";
import { useTranslation } from "react-i18next";

interface Props {
  offer: OfferI;
}

const OfferCertificatesSection: React.FC<Props> = ({ offer }) => {
  const { t } = useTranslation();

  if (!offer.requiredCertificates?.length) {
    return null;
  }

  return (
    <TileSection title={t("offer.form.STEP_FOUR.title")}>
      <ChecklistUi
        icon={Ico.CHECK}
        className="pb-1"
        items={offer.requiredCertificates.map((certificate) => ({
          label: DictionaryDisplay({ dictionary: "CERTIFICATES", value: certificate, t }),
        }))}
      />
    </TileSection>
  );
};

export default OfferCertificatesSection;