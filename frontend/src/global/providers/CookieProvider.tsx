import React, { createContext, useContext, useEffect, useState } from "react";

export type CookieConsent = {
  necessary: boolean;
  accepted: boolean;
};

interface CookieContextValue {
  consent: CookieConsent | null;
  showBanner: boolean;
  acceptCookies: () => void;
}

const COOKIE_CONSENT_KEY = 'cookieConsent';

export const CookieContext = createContext<CookieContextValue | undefined>(undefined);

export const CookieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  console.debug('CookieProvider rendered');

  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsent(parsed);
        setShowBanner(false);
      } catch (error) {
        console.error('Error parsing saved cookie consent:', error);
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    const newConsent: CookieConsent = {
      necessary: true,
      accepted: true,
    };
    setConsent(newConsent);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newConsent));
    setShowBanner(false);
  };

  return (
    <CookieContext.Provider 
      value={{ 
        consent, 
        showBanner, 
        acceptCookies,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};

export const useCookie = () => {
  const ctx = useContext(CookieContext);
  if (!ctx) throw new Error("useCookie must be used within CookieProvider");
  return ctx;
};
