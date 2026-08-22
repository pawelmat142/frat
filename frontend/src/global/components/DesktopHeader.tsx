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
import { MenuItemIdentifiers } from 'global/interface/controls.interface';
import { useTranslation } from 'react-i18next';
import { useConfirm } from 'global/providers/PopupProvider';
import { AuthService } from 'auth/services/AuthService';

const DesktopHeader: React.FC = () => {
    const { items } = useMenuContext();
    const navigate = useNavigate();
    const { me } = useUserContext();
    const { notifications } = useNotificationsContext();
    const { t } = useTranslation();
    const confirm = useConfirm();
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);
    const unreadNotificationsCount = notifications.filter(
        notification => notification.readAt == null && notification.type !== NotificationTypes.NEW_MESSAGE,
    ).length;

    React.useEffect(() => {
        if (!isUserMenuOpen) return;

        const closeOnOutsideClick = (event: MouseEvent) => {
            if (!userMenuRef.current?.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsUserMenuOpen(false);
        };

        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isUserMenuOpen]);

    const openPath = (path: string) => {
        setIsUserMenuOpen(false);
        navigate(path);
    };

    const logout = async () => {
        setIsUserMenuOpen(false);
        const confirmed = await confirm({
            title: t('signin.logoutPopupTitle'),
            message: t('signin.logoutPopupMessage'),
            confirmText: t('signin.logoutPopupConfirm'),
        });
        if (confirmed) await AuthService.logout();
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
                            <div className="desktop-header-user-menu" ref={userMenuRef}>
                                <button
                                    className="desktop-header-user-menu-toggle ripple"
                                    type="button"
                                    onClick={() => setIsUserMenuOpen(isOpen => !isOpen)}
                                    aria-label="User menu"
                                    aria-expanded={isUserMenuOpen}
                                    aria-controls="desktop-header-user-menu-items"
                                >
                                    <Ico.MENU size={18} aria-hidden="true" />
                                </button>
                                {isUserMenuOpen && (
                                    <div id="desktop-header-user-menu-items" className="desktop-header-user-menu-items" role="menu">
                                        <button type="button" role="menuitem" onClick={() => openPath(Path.getProfilePath(me.uid))}>
                                            <Ico.ACCOUNT aria-hidden="true" />
                                            {t('account.showProfile')}
                                        </button>
                                        <button type="button" role="menuitem" onClick={() => openPath(Path.SETTINGS)}>
                                            <Ico.SETTINGS aria-hidden="true" />
                                            {t('common.settings')}
                                        </button>
                                        <div className="desktop-header-user-menu-divider" role="separator" />
                                        <button type="button" role="menuitem" className="desktop-header-user-menu-logout" onClick={logout}>
                                            <Ico.SIGN_OUT aria-hidden="true" />
                                            {t('signin.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default DesktopHeader;