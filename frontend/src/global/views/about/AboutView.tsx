import Header from "global/components/Header";
import { useTranslation } from "react-i18next";
import ReportForm from "global/components/ReportForm";
import AboutIntroSection from "./AboutIntroSection";

const benefitKeys = [
    "about.specialist.benefits.qualifications",
    "about.specialist.benefits.details",
    "about.specialist.benefits.search",
    "about.specialist.benefits.engagement",
];

const AboutView: React.FC = () => {
    const { t } = useTranslation();

    return (
    <>
        <Header title={t("about.title")} />

        <main className="view-container !px-2 sm:!px-4 flex flex-col gap-4 pb-8 md:mb-20">
            <AboutIntroSection />

            <section className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold primary-text mb-2">{t("about.whoWeAre.title")}</h2>
                <p className="secondary-text">{t("about.whoWeAre.firstParagraph")}</p>
                <p className="secondary-text mt-3">{t("about.whoWeAre.secondParagraph")}</p>
            </section>

            <section className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold primary-text mb-2">{t("about.whyFrat.title")}</h2>
                <p className="secondary-text">{t("about.whyFrat.description")}</p>
            </section>

            <section className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold primary-text mb-3">{t("about.specialist.title")}</h2>
                <p className="secondary-text mb-3">{t("about.specialist.description")}</p>
                <ul className="primary-color list-disc pl-5 space-y-2">
                    {benefitKeys.map(key => (
                        <li key={key} className="list-disc"><span className="secondary-text">{t(key)}</span></li>
                    ))}
                </ul>
            </section>

            <section className="card p-4 sm:p-6">
                <h2 className="text-lg font-bold primary-text mb-2">{t("about.work.title")}</h2>
                <p className="secondary-text">{t("about.work.firstParagraph")}</p>
                <p className="secondary-text mt-3">{t("about.work.secondParagraph")}</p>
            </section>
            <ReportForm />
        </main>
    </>
    );
};

export default AboutView;