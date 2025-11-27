import { SelectorItem } from "global/interface/controls.interface";
import { useBottomSheet } from "global/providers/BottomSheetProvider";
import { useTheme } from "global/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { FaLanguage, FaMoon, FaSun } from "react-icons/fa";
import { toast } from "react-toastify";

interface LangSelectTileProps {
    iconSize?: number;
}

const ThemeSelectTile: React.FC<LangSelectTileProps> = ({ iconSize = 24 }) => {

    const { theme, toggleTheme } = useTheme();
    const bottomSheet = useBottomSheet()
    const isDarkMode = theme === "dark";
    const { t } = useTranslation();

    const selectTheme = () => {
        const items: SelectorItem[] = [{
            label: t("theme.light"),
            value: "light",
            icon: <FaSun />
        }, {
            label: t("theme.dark"),
            value: "dark",
            icon: <FaMoon />
        }]
        bottomSheet.openSelector({
            title: t("theme.select"),
            selectedValues: [theme],
            items,
            onSelect: (item) => {
                toggleTheme()
                toast.success(t('theme.changedTo', { theme: item }));
            }
        })
    }

    return (
        <div className="sec-tile-wrapper" onClick={() => { selectTheme() }}>
            <div className="square-tile">
                {isDarkMode
                    ? <FaMoon size={iconSize} />
                    : <FaSun size={iconSize} />
                }
            </div>
            <div className="sec-tile-label">{t("theme.title")}</div>
        </div>
    )

}

export default ThemeSelectTile;
