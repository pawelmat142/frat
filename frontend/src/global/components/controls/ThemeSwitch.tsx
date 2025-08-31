import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';
import { useTheme } from "../../providers/ThemeProvider";

const ThemeSwitch: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === "dark";

    return (<div className='ripple primary-color' onClick={toggleTheme}>{
        isDarkMode
            ? <LightMode />
            : <DarkMode />}
    </div>)
};

export default ThemeSwitch;
