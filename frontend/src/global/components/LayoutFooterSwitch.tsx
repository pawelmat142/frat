import React, { useEffect, useState } from 'react';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import { AnimatePresence } from 'framer-motion';

const useIsKeyboardOpen = (): boolean => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    // Capture reference height before keyboard ever opens.
    // window.innerHeight is unreliable — on Android Chrome it also shrinks with the keyboard.
    const baseHeight = vv.height;

    const handleResize = () => {
      setIsOpen(vv.height < baseHeight * 0.75);
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, []);

  return isOpen;
};

const MobileBottomNavWrapper: React.FC<{ isFooterHidden: boolean }> = ({ isFooterHidden }) => {
  const isKeyboardOpen = useIsKeyboardOpen();
  const show = !isFooterHidden && !isKeyboardOpen;

  return (
    <AnimatePresence>
      {show && <MobileBottomNav />}
    </AnimatePresence>
  );
};

const LayoutFooterSwitch: React.FC = () => {
  const globalCtx = useGlobalContext();

  if (globalCtx.isDesktop) {
    return <Footer />;
  }

  return <MobileBottomNavWrapper isFooterHidden={globalCtx.isFooterHidden} />;
};

export default LayoutFooterSwitch;
