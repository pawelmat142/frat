import TileSection from "global/components/tiles/TileSection";
import { Path } from "../../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const getAboutDashboardDescription = (language: string) => {
    switch (language) {
        case "pl":
            return "Miejsce dla ludzi z branży prac na wysokości, które ułatwia kontakt, sprawną komunikację i znalezienie odpowiednich osób bez marnowania czasu na przeszukiwanie wielu grup.";
        case "en":
        default:
            return "A place for people working at height to connect, communicate clearly, and find the right people without losing time scrolling through countless group posts.";
    }
};

const AboutDashboard: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const language = (i18n.language ?? "en").split("-")[0].toLowerCase();
    const description = getAboutDashboardDescription(language);

    return (
        <TileSection
            title={t("nav.about")}
            link={{ onClick: () => navigate(Path.ABOUT) }}
        >
            <p className="px-5 pb-3 secondary-text">
                {description}
            </p>
        </TileSection>
    );
};

export default AboutDashboard;