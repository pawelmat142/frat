import { useBottomSheet } from "global/providers/BottomSheetProvider";
import { useTranslation } from "react-i18next";
import { FaLanguage } from "react-icons/fa";
import { toast } from "react-toastify";

interface LangSelectTileProps {
    iconSize?: number;
}

const LangSelectTile: React.FC<LangSelectTileProps> = ({ iconSize = 24 }) => {

    const { i18n, t } = useTranslation();
    const langCode = i18n.language;
    const bottomSheet = useBottomSheet()

    const setLang = (langCode?: string) => {
        if (!langCode) {
            throw new Error(t('lang.notDefined'));
        }
        i18n.changeLanguage(langCode);
        toast.success(t('lang.changedTo', { lang: langCode }));
    };

    const selectLanguage = () => {
        bottomSheet.openDictionarySelector({
            title: i18n.t('lang.select'),
            translateItems: true,
            code: "LANGUAGES",
            groupCode: "TRANSLATIONS",
            selectedValues: [langCode],
            onSelect: (item) => {
                setLang(item ? String(item) : undefined);
            }
        })
    }

    return (
        <div className="sec-tile-wrapper" onClick={() => selectLanguage()}>
            <div className="square-tile">
                <FaLanguage size={iconSize} />
            </div>
            <div className="sec-tile-label">{t("lang.language")}</div>
        </div>
    )

}

export default LangSelectTile;
