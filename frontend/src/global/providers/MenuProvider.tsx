import React, { createContext, useContext, ReactNode } from 'react';
import { matchPath, useNavigate } from 'react-router-dom';
import { Path } from '../../path';
import { useAuthContext } from 'auth/AuthProvider';
import { UserRoles } from '@shared/interfaces/UserI';
import { isOneOf } from '@shared/utils/util';
import { MenuConfig } from 'global/components/selector/MenuItems';
import { useBottomSheet } from './BottomSheetProvider';
import { useGlobalContext } from './GlobalProvider';
import IconButton from 'global/components/controls/IconButon';
import { useTranslation } from 'react-i18next';
import { Ico } from 'global/icon.def';

interface NewMenuItem {
    label: string
    active: boolean
    icon: ReactNode,
    onClick: () => void
}

interface MenuContextType {
    setupHeaderMenu: (menu: MenuConfig) => void;
    items: NewMenuItem[]
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

interface NavigationProviderProps {
    children: ReactNode;
}

export const MenuProvider: React.FC<NavigationProviderProps> = ({
    children,
}) => {
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const bottomSheetCtx = useBottomSheet();
    const globalCtx = useGlobalContext();

    const setupHeaderMenu = (menu: MenuConfig) => {
        globalCtx.setHeaderMenu(<IconButton icon={<Ico.MENU onClick={() => {
            bottomSheetCtx.openMenu(menu)
        }} />} />);
    }

    const iconSize = 22

    const items: NewMenuItem[] = [{
        label: t('nav.start'),
        active: !!matchPath({ path: Path.HOME, end: true }, location.pathname),
        onClick: () => navigate(Path.HOME),
        icon: <Ico.HOME size={iconSize} />
    }, {
        label: t('chat.chats'),
        active: location.pathname.includes(Path.CHATS),
        onClick: () => navigate(Path.CHATS),
        icon: <Ico.CHAT size={iconSize} />
    }, {
        label: t('account.friends'),
        active: location.pathname.includes(Path.FRIENDS),
        onClick: () => navigate(Path.getFriendsPath(me?.uid || '')),
        icon: <Ico.FRIENDS size={iconSize} />
    }]

    if (me) {
        items.push({
            label: t('nav.account'),
            active: !!matchPath({ path: Path.PROFILE, end: true }, location.pathname),
            onClick: () => navigate(Path.getProfilePath(me.uid)),
            icon: <Ico.ACCOUNT size={iconSize} />
        });
    } else {
        items.push({
            label: t('signin.submit'),
            active: !!matchPath({ path: Path.SIGN_IN, end: true }, location.pathname),
            onClick: () => navigate(Path.SIGN_IN),
            icon: <Ico.SIGN_IN size={iconSize} />
        });
    }


    const isAdmin = me?.roles.some(role => isOneOf([UserRoles.ADMIN, UserRoles.SUPERADMIN], role));

    if (isAdmin && globalCtx.isDesktop) {
        items.push({
            label: t('header.admin'),
            active: false,
            onClick: () => navigate(Path.ADMIN_DICTIONARIES),
            icon: null
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