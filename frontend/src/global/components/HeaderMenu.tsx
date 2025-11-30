import React from 'react';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import MobileMenu from './MobileMenu';
import DesktopMenu from './DesktopMenu';

const HeaderMenu: React.FC = () => {

    const globalCtx = useGlobalContext()

    if (globalCtx?.isDesktop) {
        return <DesktopMenu />
    }
    return <MobileMenu />
}

export default HeaderMenu;
