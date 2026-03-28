import { UserProviders } from "@shared/interfaces/UserI";
import { useAuthContext } from "auth/AuthProvider";
import { AuthService } from "auth/services/AuthService";
import Button from "global/components/controls/Button";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useUserContext } from "user/UserProvider";

const EmailVerificationWarning: React.FC = () => {

    const { t } = useTranslation();
    const { firebaseUser } = useAuthContext()
    const userCtx = useUserContext();
    const me = userCtx.me;

    const showWarnign = me?.provider === UserProviders.EMAIL
        && !firebaseUser?.emailVerified

    if (!showWarnign) {
        return null;
    }
    
    const sendVerificationEmail = async () => {
        try {
            await AuthService.sendVerificationEmail();
            toast.success(t('signup.verificationEmailSent'));
        } catch (error) { } finally {
        }
    }

    return (<div className="mb-6 p-4 rounded border error-color text-center flex flex-col items-center">
        <div className="font-bold mb-2">{t('signup.emailVerificationRequired')}</div>
        <div className="mb-2">{t('signup.emailVerificationMessage')}</div>
        <Button
            className="mx-auto"
            onClick={sendVerificationEmail}
        >{t('signup.resendVerificationEmail')}</Button>
    </div>)
}

export default EmailVerificationWarning;