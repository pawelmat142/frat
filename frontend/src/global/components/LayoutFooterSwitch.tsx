import React from 'react';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

const LayoutFooterSwitch: React.FC = () => {
  const globalCtx = useGlobalContext();
  if (globalCtx.isDesktop) {
    return <Footer />;
  }
  return <MobileBottomNav />;
};

export default LayoutFooterSwitch;
