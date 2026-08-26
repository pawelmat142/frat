import { Themes } from "@shared/interfaces/SettingsI";
import { useTheme } from "global/providers/ThemeProvider";
import { useTranslation } from "react-i18next";
import { FaMoon, FaSun } from "react-icons/fa";
import { useUserContext } from "user/UserProvider";

interface LangSelectTileProps {
    iconSize?: number;
}

const ThemeSelectTile: React.FC<LangSelectTileProps> = ({ iconSize = 24 }) => {

    const { theme } = useTheme();
    const isDarkMode = theme === Themes.DARK;
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const selectTheme = () => {
        userCtx.selectTheme();
    }

    return (
        <div className="sec-tile-wrapper" onClick={() => { selectTheme() }}>
            <div className="p-tile square-tile col-tile primary-color gap-3">
                {isDarkMode
                    ? <FaMoon size={iconSize} />
                    : <FaSun size={iconSize} />
                }
                <div>{t("theme.title")}</div>
            </div>
        </div>
    )

}

export default ThemeSelectTile;
