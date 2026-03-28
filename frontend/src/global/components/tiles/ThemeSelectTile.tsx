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
            <div className="ripple square-tile bottom-bar-shadow">
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
