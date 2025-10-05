import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "global/components/controls/Input";
import Buton from "global/components/controls/Buton";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom";
import Loading from "global/components/Loading";
import { AuthService } from "auth/services/AuthService";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await AuthService.sendPasswordResetEmail(email)
            toast.success(t('signin.forgotPasswordSuccess'))
            navigate(-1)
        } catch (e) { } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="w-full px-5 py-3 relative">
            <form className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20 max-w-xl mx-auto mb-20 border border-color" onSubmit={handleSubmit}>
                <h2 className="text-lg font-bold mb-4">{t("signin.forgotPasswordTitle", "Forgot Password")}</h2>
                <>
                    <Input
                        name="email"
                        label={t("signin.email")}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        fullWidth
                    />
                    <Buton
                        mode={BtnModes.PRIMARY}
                        size={BtnSizes.LARGE}
                        fullWidth={true}
                        className="mt-5"
                        type="submit"
                        disabled={!email}
                    >
                        {t("signin.sendResetLink", "Send reset link")}
                    </Buton>
                </>
                <Buton
                    mode={BtnModes.PRIMARY_TXT}
                    fullWidth={true}
                    className="mt-5"
                    onClick={() => navigate(-1)}
                >
                    {t("common.back")}
                </Buton>
            </form>
        </div>
    );
};

export default ForgotPassword;
