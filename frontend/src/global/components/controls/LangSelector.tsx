

import DictionarySelector from './DictionarySelector';
import { useTranslation } from 'react-i18next';

const LangSelector = () => {
    const { i18n } = useTranslation();
    const langCode = i18n.language;

    const setLang = (langCode?: string) => {
        if (!langCode) {
            throw new Error("Language code is undefined");
        }
        i18n.changeLanguage(langCode);
    };

    return (
        <DictionarySelector<string>
            fullWidth
            valueInput={langCode}
            code="LANGUAGES"
            groupCode="TRANSLATIONS"
            required
            label={i18n.t('common.language')}
            onSelect={(item) => setLang(item?.value)}
        />
    );
};

export default LangSelector;
