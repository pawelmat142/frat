import { useTranslation } from 'react-i18next';
import { usePwaInstall } from 'global/hooks/usePwaInstall';
import { Ico } from 'global/icon.def';
import Button from './controls/Button';
import { BtnSizes } from 'global/interface/controls.interface';
import { useBottomSheet } from 'global/providers/BottomSheetProvider';
import { IoIosShare } from 'react-icons/io';

/** Renders a PWA "Add to Home Screen" button when the browser supports installation. */
const InstallPwaButton: React.FC = () => {
  const { t } = useTranslation();
  const { isInstallable, isIos, install } = usePwaInstall();
  const bottomSheet = useBottomSheet();

  if (!isInstallable) return null;

  const handleClick = () => {
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
      install();
    }
  };

  return (
    <Button onClick={handleClick} fullWidth size={BtnSizes.LARGE}>
         <Ico.DOWNLOAD size={26} className='mr-3' />
        {t('pwa.install')}
    </Button>
  );
};

export default InstallPwaButton;
