import { useTranslation } from 'react-i18next';
import { useTheme } from 'global/providers/ThemeProvider';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import { SelectorItem } from 'global/interface/controls.interface';
import { Ico } from 'global/icon.def';
import { FaChevronDown, FaMoon, FaSun } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ListItem from 'global/components/ListItem';

const chevron = <FaChevronDown size={20} className="secondary-text m-auto" />;

const SettingsView: React.FC = () => {
    const { i18n, t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const bottomSheet = useBottomSheet();

    const isDarkMode = theme === 'dark';
    const langCode = i18n.language;

    const selectLanguage = () => {
        bottomSheet.openDictionarySelector({
            title: t('lang.select'),
            translateItems: true,
            code: 'LANGUAGES',
            groupCode: 'TRANSLATIONS',
            selectedValues: [langCode],
            onSelect: (item) => {
                if (!item) return;
                i18n.changeLanguage(String(item));
                toast.success(t('lang.changedTo', { lang: item }));
            },
        });
    };

    const selectTheme = () => {
        const items: SelectorItem[] = [
            { label: t('theme.light'), value: 'light', icon: <FaSun /> },
            { label: t('theme.dark'), value: 'dark', icon: <FaMoon /> },
        ];
        bottomSheet.openSelector({
            title: t('theme.select'),
            selectedValues: [theme],
            items,
            onSelect: (item) => {
                toggleTheme();
                toast.success(t('theme.changedTo', { theme: item }));
            },
        });
    };

    return (
        <div className="list-view">
            <div onClick={selectLanguage}>
                <ListItem
                    imgComponent={<Ico.LANGUAGE size={24} />}
                    topLeft={t('lang.language')}
                    bottomLeft={<span className="primary-color small-font">{langCode.toUpperCase()}</span>}
                    rightSection={chevron}
                    first
                />
            </div>
            <div onClick={selectTheme}>
                <ListItem
                    imgComponent={isDarkMode ? <FaMoon size={24} /> : <FaSun size={24} />}
                    topLeft={t('theme.title')}
                    bottomLeft={<span className="primary-color small-font">{isDarkMode ? t('theme.dark') : t('theme.light')}</span>}
                    rightSection={chevron}
                    last
                />
            </div>
        </div>
    );
};

export default SettingsView