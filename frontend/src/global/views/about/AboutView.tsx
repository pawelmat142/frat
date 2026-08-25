import Header from "global/components/Header";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import AboutEnglishContent from "./AboutEnglishContent";
import AboutPolishContent from "./AboutPolishContent";
import ReportForm from "global/components/ReportForm";

const getAboutContent = (language: string) => {
    switch (language) {
        case "pl":
            return {
                title: "O aplikacji",
                Content: AboutPolishContent,
            };
        case "en":
        default:
            return {
                title: "About FRAT",
                Content: AboutEnglishContent,
            };
    }
};

const AboutView: React.FC = () => {
    const { isDesktop } = useGlobalContext();
    const { i18n } = useTranslation();
    const language = (i18n.language ?? "en").split("-")[0].toLowerCase();
    const { title, Content } = getAboutContent(language);

    return (
    <>
        <Header title={title} />

        <main className="view-container !px-2 sm:!px-4 flex flex-col gap-4 pb-8">
            <Content isDesktop={isDesktop} />
            <ReportForm className="!mt-4 !mb-0 !mx-3 !w-auto md:!mx-auto md:!w-full" />
        </main>
    </>
    );
};

export default AboutView;