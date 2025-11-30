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
import { FaBriefcase, FaEllipsisV, FaHome, FaListUl, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

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
        globalCtx.setMenu(<IconButton icon={<FaEllipsisV onClick={() => {
            bottomSheetCtx.openMenu(menu)
        }} />} />);
    }

    const iconSize = 22

    const items: NewMenuItem[] = [{
        label: t('nav.start'),
        active: !!matchPath({ path: Path.HOME, end: true }, location.pathname),
        onClick: () => navigate(Path.HOME),
        icon: <FaHome size={iconSize} />
    }, {
        label: t('nav.employees'),
        active: !!matchPath({ path: Path.EMPLOYEE_SEARCH, end: true }, location.pathname),
        onClick: () => navigate(Path.EMPLOYEE_SEARCH),
        icon: <FaSearch size={iconSize} />
    }, {
        label: t('nav.offers'),
        active: !!matchPath({ path: Path.OFFERS_SEARCH, end: true }, location.pathname),
        onClick: () => navigate(Path.OFFERS_SEARCH),
        icon: <FaBriefcase size={iconSize} />
    }, {
        label: t('nav.todo'),
        active: false,
        onClick: () => toast.info("TODO"),
        icon: <FaListUl size={iconSize} />
    }]


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