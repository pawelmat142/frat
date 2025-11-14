import { SelectorItem } from "global/interface/controls.interface";
import { useBottomSheet } from "global/providers/BottomSheetProvider";
import { useTheme } from "global/providers/ThemeProvider";
import { FaLanguage, FaMoon, FaSun } from "react-icons/fa";

interface LangSelectTileProps {
    iconSize?: number;
}

const ThemeSelectTile: React.FC<LangSelectTileProps> = ({ iconSize = 24 }) => {

    const { theme, toggleTheme } = useTheme();
    const bottomSheet = useBottomSheet()
    const isDarkMode = theme === "dark";

    // TODO translations
    const selectTheme = () => {
        const items: SelectorItem[] = [{
            label: "Jasny",
            value: "light",
            icon: <FaSun />
        }, {
            label: "Ciemny",
            value: "dark",
            icon: <FaMoon />
        }]
        bottomSheet.open({
            title: "Wybierz motyw",
            selectedValues: [theme],
            items,
            onSelect: (item) => {
                toggleTheme()
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
            <div className="sec-tile-label">Motyw</div>
        </div>
    )

}

export default ThemeSelectTile;
