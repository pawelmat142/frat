import { useBottomSheet } from "global/providers/BottomSheetProvider";
import { useTranslation } from "react-i18next";
import { FaLanguage } from "react-icons/fa";
import { toast } from "react-toastify";

interface LangSelectTileProps {
    iconSize?: number;
}

const LangSelectTile: React.FC<LangSelectTileProps> = ({ iconSize = 24 }) => {

    const { i18n } = useTranslation();
    const langCode = i18n.language;
    const bottomSheet = useBottomSheet()

    const setLang = (langCode?: string) => {
        if (!langCode) {
            throw new Error("Language code is undefined");
        }
        i18n.changeLanguage(langCode);
        // TODO translation
        toast.success(`Język zmieniony na: ${langCode}`);

    };

    const selectLanguage = () => {
        bottomSheet.openDictionarySelector({
            // TODO translation
            title: i18n.t('common.select_language'),
            translateItems: true,
            code: "LANGUAGES",
            groupCode: "TRANSLATIONS",
            selectedValues: [langCode],
            onSelect: (item) => {
                setLang(item ? String(item.value) : undefined);
            }
        })
    }

    return (
        <div className="sec-tile-wrapper" onClick={() => selectLanguage()}>
            <div className="square-tile">
                <FaLanguage size={iconSize} />
            </div>
            <div className="sec-tile-label">Język</div>
        </div>
    )

}

export default LangSelectTile;
