import { useTranslation } from 'react-i18next';
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

const chevron = <FaChevronDown size={20} className="secondary-text m-auto" />;

const SettingsView: React.FC = () => {

    const userCtx = useUserContext();
    const { i18n, t } = useTranslation();
    const { theme } = useTheme();
    const confirm = useConfirm();
    
    const [loading, setLoading] = useState(false);  

    const isDarkMode = theme === Themes.DARK;
    const langCode = i18n.language;

    const selectLanguage = () => {
        userCtx.selectLanguage();
    };

    const selectTheme = () => {
        userCtx.selectTheme();
    };

    const iconSize = `${AppConfig.DEFAULT_AVATAR_SIZE}rem`;

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
        
        <div className="list-view">
            <ListUi items={items} itemClassName="m-font py-3"></ListUi>
        </div>
    </>
    );
};

export default SettingsView