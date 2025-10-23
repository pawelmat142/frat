
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCookie } from '../providers/CookieProvider';
import Button from './controls/Button';
import { BtnSizes } from 'global/interface/controls.interface';

const CookieBanner: React.FC = () => {
  const { t } = useTranslation();
  const { showBanner, acceptCookies } = useCookie();

  if (!showBanner) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner container">
          <div className="cookie-banner-actions card">
            <Button 
              onClick={acceptCookies}
              className="cookie-btn cookie-btn-primary h-fit"
              size={BtnSizes.MEDIUM}
            >
              {t('cookies.accept')}
            </Button>
          </div>
        <div className="cookie-banner-content">
          <h3 className="cookie-banner-title">{t('cookies.title')}</h3>
          <p className="cookie-banner-description">{t('cookies.description')}</p>

        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
