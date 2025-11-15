import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "global/components/controls/Input";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom";
import Loading from "global/components/Loading";
import { AuthService } from "auth/services/AuthService";
import { toast } from "react-toastify";
import Logo from "global/components/Logo";
import IconButton from "global/components/controls/IconButon";

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
        <div className="form-view relative">
            <div className="mt-10 mb-10 mx-auto flex justify-center">
                <IconButton onClick={() => { navigate("/") }} icon={<Logo />} />
            </div>
            <form className="" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-10 md:mb-6">
                    <h2 className="text-lg font-bold">{t("signin.forgotPasswordTitle", "Forgot Password")}</h2>
                </div>
                <div className="flex flex-col gap-7 md:gap-5">
                    <Input
                        name="email"
                        label={t("signin.email")}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        fullWidth
                    />
                </div>
                <Button
                    mode={BtnModes.PRIMARY}
                    size={BtnSizes.LARGE}
                    fullWidth={true}
                    className="mt-8"
                    type="submit"
                    disabled={!email}
                >
                    {t("signin.sendResetLink", "Send reset link")}
                </Button>
            </form>
            <div className="flex items-center cursor-pointer mx-auto w-full justify-center mt-5 mb-10" onClick={() => {
                navigate(-1);
            }}>
                <Button mode={BtnModes.PRIMARY_TXT} fullWidth={true} >
                    {t("common.back")}
                </Button>
            </div>
        </div>
    );
};

export default ForgotPassword;
