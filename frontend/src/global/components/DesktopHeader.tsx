import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMenuContext } from 'global/providers/MenuProvider';
import { Path } from '../../path';
import Logo from './Logo';
import { useUserContext } from 'user/UserProvider';
import AvatarTile from 'user/components/AvatarTile';
import { useNotificationsContext } from 'notification/NotificationsProvider';
import { NotificationTypes } from '@shared/interfaces/NotificationI';
import { Ico } from 'global/icon.def';
import { MenuItemIdentifiers } from 'global/interface/controls.interface';
import { useGlobalContext } from 'global/providers/GlobalProvider';
import { useUserMenuGroups } from 'user/menu/useUserMenuGroups';
import { useTranslation } from 'react-i18next';

const DesktopHeader: React.FC = () => {
    const { items } = useMenuContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const { me } = useUserContext();
    const { notifications } = useNotificationsContext();
    const { openContextMenu } = useGlobalContext();
    const userMenuGroups = useUserMenuGroups();
    const unreadNotificationsCount = notifications.filter(
        notification => notification.readAt == null && notification.type !== NotificationTypes.NEW_MESSAGE,
    ).length;
    const adminPanelItem = items.find(item => item.label === t('header.admin'));
    const navigationItems = items.filter(item => item !== adminPanelItem);

    const openUserContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!me) return;

        const { left, bottom } = event.currentTarget.getBoundingClientRect();
        openContextMenu({ x: left, y: bottom + 8 }, userMenuGroups, { width: 260 });
    };

    return (
        <header className="desktop-header" data-testid="desktop-header">
            <nav className="desktop-header-content w-full max-w-6xl" aria-label="Primary navigation">
                <button className="desktop-header-brand" type="button" onClick={() => navigate(Path.HOME)} aria-label="FRAT home">
                    <Logo size={52} className="desktop-header-logo" />
                    <span className="desktop-header-title">FRAT</span>
                </button>

                <div className="desktop-header-navigation">
                    {navigationItems.map((item) => (
                        <button
                            key={item.id || item.label}
                            className={`desktop-header-nav-item ripple${item.active ? ' active' : ''}`}
                            type="button"
                            onClick={item.onClick}
                        >
                            {item.icon && <item.icon size={20} aria-hidden="true" />}
                            <span>{item.label}</span>
                            {item.badge && item.id !== MenuItemIdentifiers.START && (
                                <span className="desktop-header-badge">{item.badge}</span>
                            )}
                        </button>
                    ))}
                    <button
                        className={`desktop-header-nav-item ripple${location.pathname === Path.ABOUT ? ' active' : ''}`}
                        type="button"
                        onClick={() => navigate(Path.ABOUT)}
                    >
                        <Ico.INFO size={20} aria-hidden="true" />
                        <span>{t('nav.about')}</span>
                    </button>
                    {adminPanelItem && (
                        <button
                            className={`desktop-header-nav-item ripple${adminPanelItem.active ? ' active' : ''}`}
                            type="button"
                            onClick={adminPanelItem.onClick}
                        >
                            {adminPanelItem.icon && <adminPanelItem.icon size={20} aria-hidden="true" />}
                            <span>{adminPanelItem.label}</span>
                        </button>
                    )}
                </div>

                <div className="desktop-header-actions">
                    {me && (
                        <>
                            <button
                                className="desktop-header-user ripple"
                                type="button"
                                onClick={() => navigate(Path.HOME)}
                                aria-label={`Go to dashboard, ${me.displayName}`}
                            >
                                <AvatarTile src={me.avatarRef?.url} alt={me.displayName} size={2.25} circle />
                                <span className="desktop-header-user-name">{me.displayName}</span>
                            </button>
                            <button
                                className="desktop-header-notifications ripple"
                                type="button"
                                onClick={() => navigate(Path.NOTIFICATIONS)}
                                aria-label={unreadNotificationsCount > 0
                                    ? `Notifications, ${unreadNotificationsCount} unread`
                                    : 'Notifications'}
                            >
                                <Ico.NOTIFICATION size={20} aria-hidden="true" />
                                {unreadNotificationsCount > 0 && (
                                    <span className="desktop-header-notification-badge">
                                        {unreadNotificationsCount}
                                    </span>
                                )}
                            </button>
                            <button
                                className="desktop-header-user-menu-toggle ripple burger"
                                type="button"
                                onClick={openUserContextMenu}
                                aria-label="User menu"
                            >
                                <Ico.BURGER size={18} aria-hidden="true" />
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default DesktopHeader;