import React, { useEffect, useState } from 'react';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

const useIsKeyboardOpen = (): boolean => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      // Keyboard is considered open when visual viewport is significantly smaller than layout height
      setIsOpen(vv.height < window.innerHeight * 0.75);
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, []);

  return isOpen;
};

const LayoutFooterSwitch: React.FC = () => {
  const globalCtx = useGlobalContext();
  const isKeyboardOpen = useIsKeyboardOpen();

  if (globalCtx.isDesktop) {
    return <Footer />;
  }

  if (globalCtx.state?.hideFooter || isKeyboardOpen) {
    return null;
  }
  return <MobileBottomNav />;
};

export default LayoutFooterSwitch;
