import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TranslationService } from 'global/services/Translation.service';

// Custom backend loader for i18next v19.x
class CustomBackend {
  type = 'backend';
  init() {}
  read(language: string, namespace: string, callback: (err: any, data: any) => void) {
    TranslationService.getTranslation(language)
      .then((response) => {
        console.log('Loaded translations:', response);
        // i18next expects the translation object, not the whole response
        callback(null, response.data);
      })
      .catch((err) => {
        console.error('Translation load error:', err);
        callback(err, null);
      });
  }
}

i18n
  .use(initReactI18next)
  .use(new CustomBackend() as any);

// Detect browser language and normalize to two-letter code
function getTwoLetterLanguage(lang: string): string {
  if (!lang) return 'en';
  return lang.split('-')[0].toLowerCase();
}

const browserLanguageRaw = navigator.language || navigator.languages?.[0] || 'en';

const browserLanguage = getTwoLetterLanguage(browserLanguageRaw);

console.log('Detected browser language:', browserLanguageRaw, '| Two-letter:', browserLanguage);

i18n.init({
  lng: browserLanguage, // domyślny język z przeglądarki
  fallbackLng: 'en',  
  ns: ['translation'],
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  backend: {},
  load: 'languageOnly',
});

export default i18n;

export const t = i18n.t.bind(i18n);
