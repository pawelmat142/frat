import { useTranslation } from 'react-i18next';
import { usePwaInstall } from 'global/hooks/usePwaInstall';
import { Ico } from 'global/icon.def';
import Button from './controls/Button';
import { BtnSizes } from 'global/interface/controls.interface';

/** Renders a PWA "Add to Home Screen" button when the browser supports installation. */
const InstallPwaButton: React.FC = () => {
  const { t } = useTranslation();
  const { isInstallable, install } = usePwaInstall();

  if (!isInstallable) return null;

  return (
    <Button onClick={install} fullWidth size={BtnSizes.LARGE}>
         <Ico.DOWNLOAD size={26} className='mr-3' />
        {t('pwa.install')}
    </Button>
  );
};

export default InstallPwaButton;
