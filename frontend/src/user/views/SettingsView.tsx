import { useTranslation } from 'react-i18next';
import { useTheme } from 'global/providers/ThemeProvider';
import { Ico } from 'global/icon.def';
import { FaChevronDown, FaMoon, FaSun } from 'react-icons/fa';
import ListItem from 'global/components/ListItem';
import { Themes } from '@shared/interfaces/SettingsI';
import { useUserContext } from 'user/UserProvider';

const chevron = <FaChevronDown size={20} className="secondary-text m-auto" />;

const SettingsView: React.FC = () => {

    const userCtx = useUserContext();

    const { i18n, t } = useTranslation();
    const { theme } = useTheme();

    const isDarkMode = theme === Themes.DARK;
    const langCode = i18n.language;

    const selectLanguage = () => {
        userCtx.selectLanguage();
    };

    const selectTheme = () => {
        userCtx.selectTheme();
    };

    return (
        <div className="list-view">
            <div onClick={selectLanguage}>
                <ListItem
                    imgComponent={<Ico.LANGUAGE />}
                    topLeft={t('lang.language')}
                    bottomLeft={<span className="primary-color s-font">{langCode.toUpperCase()}</span>}
                    rightSection={chevron}
                    first
                />
            </div>
            <div onClick={selectTheme}>
                <ListItem
                    imgComponent={isDarkMode ? <FaMoon /> : <FaSun />}
                    topLeft={t('theme.title')}
                    bottomLeft={<span className="primary-color s-font">{isDarkMode ? t('theme.dark') : t('theme.light')}</span>}
                    rightSection={chevron}
                    last
                />
            </div>
        </div>
    );
};

export default SettingsView