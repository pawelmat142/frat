import { TranslationListDto } from "@shared/dto/TranslationListDto";
import Loading from "global/components/Loading";
import { useEffect, useState } from "react";
import { userAdminPanelContext } from "../AdminPanelProvider";
import TranslationsSection from "./TranslationsSection";

const AdminTranslations: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const { translation } = userAdminPanelContext();

    const _initTranslations = async () => {
        try {
            setLoading(true);
            await translation?.initTranslations();
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        _initTranslations();
    }, []);

    if (loading) {
        return <Loading />;
    }

    const onSelectLanguage = (item: TranslationListDto) => {
        try {
            setLoading(true);
            translation?.loadLanguage?.(item.code);
        } catch (e) {} finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-2 items-center w-full p-5">
            <div className="w-full px-0">

                <h2 className="h2 mb-6 pl-2 primary-text">Translations</h2>

                <h2 className="font-mono font-bold mb-2 mt-10">Languages:</h2>

                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">CODE</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">LOCALE_CODE</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">NAME</th>
                            </tr>
                        </thead>
                        <tbody>
                            {translation?.languages?.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-6 secondary-text text-center">No translations found.</td>
                                </tr>
                            ) : (
                                translation?.languages?.map((lang, idx) => {
                                    const isActive = translation?.selectedLanguage && (translation?.selectedLanguage === lang.code);
                                    return (
                                        <tr
                                            key={idx}
                                            className={`hover-bg transition cursor-pointer${isActive ? ' active' : ''}`}
                                            style={{ userSelect: 'none' }}
                                            onClick={() => onSelectLanguage(lang)}
                                        >
                                            <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{lang.code}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{lang.localeCode}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{lang.name}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>

                <TranslationsSection />

            </div>
        </div>
    )
}

export default AdminTranslations;