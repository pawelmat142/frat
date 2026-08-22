import TileSection from "employee/components/TileSection";
import { Path } from "../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const AboutDashboard: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <TileSection
            title={t("nav.about")}
            link={{ onClick: () => navigate(Path.ABOUT) }}
        >
            <p className="px-5 pb-3 secondary-text">
                FRAT to profesjonalna platforma dla osób i firm działających w branży prac wysokościowych.
                Łączymy specjalistów, pracodawców i organizatorów szkoleń, aby ułatwić znalezienie współpracy,
                kompetencji oraz możliwości rozwoju w jednym miejscu.
            </p>
        </TileSection>
    );
};

export default AboutDashboard;