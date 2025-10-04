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
  .use(new CustomBackend() as any)
  .init({
    // TODO znajdz w przegladarce
    lng: 'en', // domyślny język
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
