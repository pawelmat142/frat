import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IoIosShare } from 'react-icons/io';
import { toast } from 'react-toastify';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isIosBrowser = (): boolean => {
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = ('standalone' in navigator) && (navigator as unknown as { standalone: boolean }).standalone;
  return isIos && !isStandalone;
};

/** Captures the `beforeinstallprompt` event and exposes an install trigger. */
export function usePwaInstall() {

  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos] = useState(() => isIosBrowser());
  const bottomSheet = useBottomSheet();

  const isInstallable = !!deferredPrompt || isIos;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  
    const install = () => {
      if (!isInstallable) {
        toast.warn(t('pwa.installed'));
        return
      }
      if (isIos) {
        bottomSheet.open({
          title: t('pwa.install'),
          children: (
            <div className="p-4 flex flex-col gap-4">
              <p className="text-center opacity-80">{t('pwa.iosGuide')}</p>
              <ol className="flex flex-col gap-3 text-sm">
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">1</span>
                  <span className="flex items-center gap-1">
                    {t('pwa.iosStep1')} <IoIosShare size={22} className="text-blue-500 inline-block" />
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">2</span>
                  <span>{t('pwa.iosStep2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">3</span>
                  <span>{t('pwa.iosStep3')}</span>
                </li>
              </ol>
            </div>
          ),
        });
      } else {
        _install();
      }
    };


  const _install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      toast.success(t('pwa.success'));
    }
  }, [deferredPrompt]);

  return { isInstallable, isIos, install };
}
