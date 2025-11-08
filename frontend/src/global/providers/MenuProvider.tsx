import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuItem } from '../interfaces';
import { Path } from '../../path';
import { useAuthContext } from 'auth/AuthProvider';
import { UserI, UserRoles } from '@shared/interfaces/UserI';
import { AuthValidators } from '@shared/validators/AuthValidator';
import { Util } from '@shared/utils/util';
import { skip } from 'node:test';

interface MenuContextType {
    allMenuItems: MenuItem[];
    menuItems: MenuItem[];
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

interface NavigationProviderProps {
    children: ReactNode;
}

export const MenuProvider: React.FC<NavigationProviderProps> = ({
    children,
}) => {
    const location = useLocation();
    const { me, isAuthenticated } = useAuthContext();

    // Dodajemy właściwość active na podstawie location.pathname
    const allMenuItems: MenuItem[] = useMemo(() => [
        {
            to: Path.HOME,
            label: 'header.home',
        },
        {
            to: Path.ADMIN_DICTIONARIES,
            label: 'header.admin',
            skipMobileMenu: true,
            rolesGuard: [UserRoles.ADMIN, UserRoles.SUPERADMIN],
        },
        isAuthenticated ?
            {
                to: Path.getProfilePath(me!.uid),
                label: 'header.profile',
                authGuard: true
            } :
            {
                to: Path.SIGN_IN,
                label: 'signin.title'
            }
    ].map(item => ({
        ...item,
        active: isMenuItemActive(item),
    })), [location.pathname, isAuthenticated]);


    const filteredMenuItems = useMemo(
        () => allMenuItems
            .filter(item => !item.authGuard || isAuthenticated)
            .filter(item => Util.hasPermission(item.rolesGuard, me)),
        [allMenuItems, me]
    );

    const value: MenuContextType = {
        allMenuItems: allMenuItems,
        menuItems: filteredMenuItems,
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
};

const isMenuItemActive = (item: MenuItem): boolean => {
    const pathname = location.pathname
    if (item.to === Path.HOME) {
        return item.to === pathname
    }
    if (item.to) {
        return pathname.includes(item.to)
    }
    return false
}

export const useMenuContext = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('useMenuContext must be used within NavigationProvider');
    }
    return context;
};

const hasPermission = (item: MenuItem, user?: UserI | null): boolean => {
    return Util.hasPermission(item.rolesGuard, user)
};