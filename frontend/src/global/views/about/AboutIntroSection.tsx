import Logo from "global/components/Logo";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";

interface AboutIntroSectionProps {
    showLogo?: boolean;
}

const AboutIntroSection: React.FC<AboutIntroSectionProps> = ({ showLogo = true }) => {
    const { isDesktop } = useGlobalContext();
    const { t } = useTranslation();

    return (
        <section className="card text-center">
            {showLogo && (
                <div className="flex justify-center mb-3">
                    <Logo size={isDesktop ? 250 : 150} className="!ml-0" />
                </div>
            )}
            <h1 className="text-2xl font-bold primary-text">FRAT</h1>
            <p className="secondary-text mt-1">{t("about.intro.tagline")}</p>
            <p className="secondary-text mt-3">{t("about.intro.description")}</p>
        </section>
    );
};

export default AboutIntroSection;