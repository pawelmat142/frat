import { AuthService } from "auth/services/AuthService";
import Button from "global/components/controls/Button";
import FloatingInput from "global/components/controls/FloatingInput";
import Loading from "global/components/Loading";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const TELEGRAM_BOT_USERNAME = process.env.REACT_APP_TELEGRAM_BOT_USERNAME;

const TelegramSignPage: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [pin, setPin] = useState("");


    useEffect(() => {
        let executed = false;
        if (!executed) {
            executed = true;
            AuthService.triggerAutoGenerate();
        }
        return () => { executed = true; };
    }, [])

    const handleSubmit = async () => {
        if (!pin) return;
        try {
            setLoading(true);
            const credentials = await AuthService.loginByPin(pin);
            
            if (!credentials) {
                toast.error(t("signin.invalidOrExpiredPin"));   
                return
            }

            await AuthService.loginForm({
                email: credentials.email,
                password: credentials.password
            });
        }
        catch (e: any) { } finally {
            setLoading(false);
        }
    };

    // @TestAccountFratBot
    const handleTelegramNav = () => {
        if (!TELEGRAM_BOT_USERNAME) {
            throw new Error("Telegram bot username is not defined in environment variables.");
        }
        // Deep link - otwiera aplikację Telegram bezpośrednio
        const telegramAppUrl = `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}`;
        // Fallback do web jeśli aplikacja nie jest zainstalowana
        const telegramWebUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

        // Próba otwarcia aplikacji, z fallbackiem do web
        const appWindow = window.open(telegramAppUrl, '_self');
        setTimeout(() => {
            // Jeśli aplikacja się nie otworzyła, otwórz w przeglądarce
            window.open(telegramWebUrl, '_blank');
        }, 500);
    }

    if (loading) {
        return (
            <Loading></Loading>
        )
    }

    return (
        <div className="form-view relative">

            <form className="mt-10" onSubmit={handleSubmit}>

                <div className="flex flex-col gap-5 md:gap-5">
                    <FloatingInput
                        name="pin"
                        label={t("signin.pin")}
                        type="text"
                        value={pin}
                        onChange={e => setPin(e.target.value)}
                        required
                        fullWidth
                    />
                </div>

                <div className="flex justify-end">
                    <Button mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} onClick={() => {
                        navigator.clipboard.readText().then(text => {
                            setPin(text);
                        })
                    }}>{t("signin.pasteFromClipboard")}</Button>
                </div>

                <Button
                    onClick={handleSubmit}
                    mode={BtnModes.PRIMARY}
                    size={BtnSizes.LARGE}
                    fullWidth={true}
                    className="mt-5"
                    disabled={!pin}
                >
                    {t("signin.submit")}
                </Button>
                <Button
                    mode={BtnModes.SECONDARY}
                    size={BtnSizes.LARGE}
                    fullWidth={true}
                    className="mt-5"
                    onClick={handleTelegramNav}
                >
                    {t("signin.openBot")}
                </Button>

            </form>

        </div>
    );
}

export default TelegramSignPage;

