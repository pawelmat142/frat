import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'global/providers/ThemeProvider';
import { Ico } from 'global/icon.def';
import { FaChevronDown, FaMoon, FaSun } from 'react-icons/fa';
import { Themes } from '@shared/interfaces/SettingsI';
import { useUserContext } from 'user/UserProvider';
import { AppConfig } from '@shared/AppConfig';
import { useConfirm } from 'global/providers/PopupProvider';
import { useState } from 'react';
import Loading from 'global/components/Loading';
import { UserManagementService } from 'user/services/UserManagementService';
import { FirebaseAuth } from 'auth/services/FirebaseAuth';
import { toast } from 'react-toastify';
import { MenuItem } from 'global/interface/controls.interface';
import ListUi from 'global/components/ui/ListUi';
import Header from 'global/components/Header';
import ChatCryptoService from 'chat/services/ChatCryptoService';
import { useChatsContext } from 'chat/ChatsProvider';
import { Path } from '../../path';
import { EDIT_AVATAR_FLAG_KEY } from 'user/components/AvatarTile';

const chevron = <FaChevronDown size={20} className="secondary-text m-auto" />;

const SettingsView: React.FC = () => {

    const userCtx = useUserContext();
    const { i18n, t } = useTranslation();
    const { theme } = useTheme();
    const confirm = useConfirm();
    const { isNewE2EDevice } = useChatsContext();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const isDarkMode = theme === Themes.DARK;
    const langCode = i18n.language;

    const editAvatar = () => {
        localStorage.setItem(EDIT_AVATAR_FLAG_KEY, 'true');
        navigate(Path.HOME);
    };

    const selectLanguage = () => {
        userCtx.selectLanguage();
    };

    const selectTheme = () => {
        userCtx.selectTheme();
    };

    const deleteAccount = async () => {
        const confirmed = await confirm({
            title: t('account.deleteAccountConfirmTitle'),
            message: t('account.deleteAccountConfirmMessage'),
        });

        if (!confirmed) {
            return;
        }

        try {
            setLoading(true);
            await UserManagementService.deleteAccount();
            FirebaseAuth.getAuth().signOut()
            toast.success(t('account.deleteAccountSuccessToast'));
        } catch (error) {
            console.error(error);
            toast.error(t('account.deleteAccountFailed'));
        } finally {
            setLoading(false);
        }
    }

    const items: MenuItem[] = [{
        label: t('employeeProfile.form.uploadAvatar'),
        icon: Ico.EDIT,
        onClick: editAvatar
    }, {
        label: t('lang.language'),
        icon: Ico.LANGUAGE,
        onClick: selectLanguage
    }, {
        label: t('theme.title'),
        icon: isDarkMode ? FaMoon: FaSun,
        onClick: selectTheme
    }, {
        label: t('account.deleteAccountConfirmTitle'),
        icon: Ico.DELETE,
        onClick: deleteAccount
    }]

    if (loading) {
        return <Loading></Loading>
    }

    return (<>
        <Header title={t('common.settings')}></Header>

        {/* New device warning — shown when keys were freshly generated on this device */}
        {isNewE2EDevice && ChatCryptoService.isE2EEnabled() && (
            <div className="mx-4 mt-3 rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
                {t('chat.e2eNewDeviceWarning')}
            </div>
        )}

        <div className="list-view">
            <ListUi items={items} itemClassName="m-font py-3"></ListUi>
        </div>
    </>
    );
};

export default SettingsView