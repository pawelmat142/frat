import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MenuItem, Payload } from '../interfaces';
import { Path } from '../../path';

interface MenuContextType {
    allMenuItems: MenuItem[];
    menuItems: MenuItem[];
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

interface NavigationProviderProps {
    children: ReactNode;
    user?: Payload;
}

export const MenuProvider: React.FC<NavigationProviderProps> = ({
    children,
    user
}) => {
    const location = useLocation();

    // Dodajemy właściwość active na podstawie location.pathname
    const allMenuItems: MenuItem[] = useMemo(() => [
        {
            to: Path.HOME,
            label: 'Home',
        },
        {
            to: Path.ADMIN_PANEL,
            label: 'Admin Panel',
            // TODO admin guard
        }
    ].map(item => ({
        ...item,
        active: isMenuItemActive(item)
    })), [location.pathname]);

    const filteredMenuItems = useMemo(() =>
        allMenuItems.filter(item =>
            !item.rolesGuard || hasPermission(item, user)
        ),
        [allMenuItems, user]
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

const hasPermission = (item: MenuItem, user?: Payload): boolean => {
    if (!item.rolesGuard) {
        return true;
    }
    return item.rolesGuard.some(role => user?.roles.includes(role));
};