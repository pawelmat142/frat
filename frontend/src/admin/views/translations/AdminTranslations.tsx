import { TranslationListDto } from "@shared/dto/TranslationListDto";
import { TranslationAdminService } from "admin/services/TranslationAdmin.service";
import Loading from "global/components/Loading";
import { useEffect, useState } from "react";

const AdminTranslations: React.FC = () => {

    const [languages, setLanguages] = useState<TranslationListDto[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadLanguagesList();
    }, []);

    const loadLanguagesList = async () => {
        setLoading(true);
        const langs = await TranslationAdminService.getLanguagesList();
        setLanguages(langs);
        setLoading(false);
        console.log(languages);
    }

    if (loading) {
        return <Loading></Loading>
    }

    const onSelectLanguage = (item: TranslationListDto) => {
        // Przykładowa akcja po kliknięciu w wiersz
        alert(`Selected language: ${item.name} (${item.code})`);
    }

    return (
        <div className="flex flex-1 flex-col gap-2 items-center w-full p-5">
            <div className="w-full px-0">

                <h2 className="h2 mb-6 pl-2 primary-text">Translations</h2>

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
                            {languages.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-6 secondary-text text-center">No translations found.</td>
                                </tr>
                            ) : (
                                languages.map((lang, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover-bg transition cursor-pointer"
                                        style={{ userSelect: 'none' }}
                                        onClick={() => onSelectLanguage(lang)}
                                    >
                                        <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{lang.code}</td>
                                        <td className="px-6 py-3 border-b border-color primary-text">{lang.localeCode}</td>
                                        <td className="px-6 py-3 border-b border-color primary-text">{lang.name}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                </div>

            </div>
        </div>
    )
}

export default AdminTranslations;