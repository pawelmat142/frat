import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenuContext } from 'global/providers/MenuProvider';
import { Path } from '../../path';
import Logo from './Logo';
import { useUserContext } from 'user/UserProvider';
import AvatarTile from 'user/components/AvatarTile';
import { useNotificationsContext } from 'notification/NotificationsProvider';
import { NotificationTypes } from '@shared/interfaces/NotificationI';
import { Ico } from 'global/icon.def';
import { ContextMenuGroup, MenuItemIdentifiers } from 'global/interface/controls.interface';
import { useTranslation } from 'react-i18next';
import { useConfirm } from 'global/providers/PopupProvider';
import { AuthService } from 'auth/services/AuthService';
import { useGlobalContext } from 'global/providers/GlobalProvider';

const DesktopHeader: React.FC = () => {
    const { items } = useMenuContext();
    const navigate = useNavigate();
    const { me } = useUserContext();
    const { notifications } = useNotificationsContext();
    const { t } = useTranslation();
    const confirm = useConfirm();
    const { openContextMenu } = useGlobalContext();
    const unreadNotificationsCount = notifications.filter(
        notification => notification.readAt == null && notification.type !== NotificationTypes.NEW_MESSAGE,
    ).length;

    const openPath = (path: string) => {
        navigate(path);
    };

    const logout = async () => {
        const confirmed = await confirm({
            title: t('signin.logoutPopupTitle'),
            message: t('signin.logoutPopupMessage'),
            confirmText: t('signin.logoutPopupConfirm'),
        });
        if (confirmed) await AuthService.logout();
    };

    const openUserContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!me) return;

        const { left, bottom } = event.currentTarget.getBoundingClientRect();
        const userMenuGroups: ContextMenuGroup[] = [
            {
                items: [
                    {
                        label: t('account.showProfile'),
                        icon: Ico.ACCOUNT,
                        onClick: () => openPath(Path.getProfilePath(me.uid)),
                    },
                    {
                        label: t('common.settings'),
                        icon: Ico.SETTINGS,
                        onClick: () => openPath(Path.SETTINGS),
                    },
                ],
            },
            {
                items: [
                    {
                        label: t('signin.logout'),
                        icon: Ico.SIGN_OUT,
                        className: 'error-color',
                        onClick: logout,
                    },
                ],
            },
        ];

        openContextMenu({ x: left, y: bottom + 8 }, userMenuGroups);
    };

    return (
        <header className="desktop-header" data-testid="desktop-header">
            <nav className="desktop-header-content w-full max-w-6xl" aria-label="Primary navigation">
                <button className="desktop-header-brand" type="button" onClick={() => navigate(Path.HOME)} aria-label="FRAT home">
                    <Logo size={52} className="desktop-header-logo" />
                    <span className="desktop-header-title">FRAT</span>
                </button>

                <div className="desktop-header-navigation">
                    {items.map((item) => (
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
                </div>

                <div className="desktop-header-actions">
                    {me && (
                        <>
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
                                className="desktop-header-user ripple"
                                type="button"
                                onClick={() => navigate(Path.HOME)}
                                aria-label={`Go to dashboard, ${me.displayName}`}
                            >
                                <AvatarTile src={me.avatarRef?.url} alt={me.displayName} size={2.25} circle />
                                <span className="desktop-header-user-name">{me.displayName}</span>
                            </button>
                            <button
                                className="desktop-header-user-menu-toggle ripple"
                                type="button"
                                onClick={openUserContextMenu}
                                aria-label="User menu"
                            >
                                <Ico.MENU size={18} aria-hidden="true" />
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default DesktopHeader;