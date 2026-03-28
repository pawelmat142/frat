import React, { createContext, useContext, ReactNode } from 'react';
import { matchPath, useNavigate } from 'react-router-dom';
import { Path } from '../../path';
import { UserRoles } from '@shared/interfaces/UserI';
import { isOneOf } from '@shared/utils/util';
import { MenuConfig } from 'global/components/selector/MenuItems';
import { useBottomSheet } from './BottomSheetProvider';
import { useGlobalContext } from './GlobalProvider';
import IconButton from 'global/components/controls/IconButon';
import { useTranslation } from 'react-i18next';
import { Ico } from 'global/icon.def';
import { useUserContext } from 'user/UserProvider';
import { BtnModes, MenuItem } from 'global/interface/controls.interface';
import { useWorkersSearch } from 'employee/views/search/WorkersSearchProvider';
import { useOfferSearch } from 'offer/views/search/OfferSearchProvider';
import { useNotificationsContext } from 'notification/NotificationsProvider';



interface MenuContextType {
    setupHeaderMenu: (menu: MenuConfig) => void;
    items: MenuItem[]
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

interface NavigationProviderProps {
    children: ReactNode;
}

export const MenuProvider: React.FC<NavigationProviderProps> = ({
    children,
}) => {
    const { me } = useUserContext();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const bottomSheetCtx = useBottomSheet();
    const globalCtx = useGlobalContext();
    const workerSearchCtx = useWorkersSearch()
    const offerSearchCtx = useOfferSearch()
    const notificationsCtx = useNotificationsContext();
    
    const setupHeaderMenu = (menu: MenuConfig) => {
        globalCtx.setHeaderMenu(<IconButton mode={BtnModes.SECONDARY_TXT} icon={<Ico.MENU onClick={() => {
            bottomSheetCtx.openMenu(menu)
        }} />} />);
    }

    const items: MenuItem[] = [{
        label: t('nav.start'),
        badge: notificationsCtx.unreadCount > 0 ? notificationsCtx.unreadCount.toString() : undefined,
        active: !!matchPath({ path: Path.HOME, end: true }, location.pathname),
        onClick: () => {
            navigate(Path.HOME)
        },
        icon: Ico.HOME
    }, {
        label: t('nav.employees'),
        active: location.pathname.includes("workers"),
        onClick: () => {
            workerSearchCtx.navToSearch()
        },
        icon: Ico.SEARCH
    }, {
        label: t('nav.offers'),
        active: location.pathname.includes("offers"),
        onClick: () => {
            offerSearchCtx.navToSearch()
        },
        icon: Ico.OFFER
    }]

    if (me) {
        items.push({
            label: t('chat.chats'),
            active: location.pathname.includes(Path.CHATS),
            onClick: () => navigate(Path.CHATS),
            icon: Ico.CHAT
        });
    } else {
        items.push({
            label: t('signin.submit'),
            active: !!matchPath({ path: Path.SIGN_IN, end: true }, location.pathname),
            onClick: () => navigate(Path.SIGN_IN),
            icon: Ico.SIGN_IN
        });
    }


    const isAdmin = me?.roles.some(role => isOneOf([UserRoles.ADMIN, UserRoles.SUPERADMIN], role));

    if (isAdmin && globalCtx.isDesktop) {
        items.push({
            label: t('header.admin'),
            active: false,
            onClick: () => navigate(Path.ADMIN_DICTIONARIES),
        });
    }

    const value: MenuContextType = {
        items: items,
        setupHeaderMenu
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenuContext = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenuContext must be used within NavigationProvider');
    }
    return context;
};