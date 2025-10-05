

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "global/components/controls/Input";
import Buton from "global/components/controls/Buton";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { AuthService } from "auth/services/AuthService";
import { Utils } from "global/utils";
import { useNavigate } from "react-router-dom";
import { Path } from "../../path";
import Loading from "global/components/Loading";
import GoogleIcon from '@mui/icons-material/Google';
import Email from '@mui/icons-material/Email';

const SignInPage: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const isDevMode = Utils.isDevMode();

    // Developer autofill button
    const handleDevFill = () => {
        setEmail("pawelmat142@t.pl");
        setPassword("pawelmat142");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await AuthService.loginForm({
                email,
                password
            })
        }
        catch (e: any) { } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await AuthService.loginWithGoogle();
        }
        catch (e: any) { } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <Loading></Loading>
        )
    }

    return (
        <div className="w-full px-5 py-3 relative">
            <form className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20 max-w-xl mx-auto mb-20 border border-color" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{t("signin.title")}</h2>

                    {isDevMode && (
                        <Buton onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT} className="ripple mb-2">
                            DEV FILL
                        </Buton>)}

                </div>
                <div className="flex flex-col gap-3">
                    <Input
                        name="email"
                        label={t("signin.email")}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        fullWidth
                    />
                    <Input
                        name="password"
                        label={t("signin.password")}
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        fullWidth
                    />
                </div>

                <div className="buttons">
                    <Buton
                        mode={BtnModes.SECONDARY_TXT}
                        size={BtnSizes.SMALL}
                        className="ml-auto mb-10"
                        onClick={() => {
                            navigate(Path.FORGOT_PASSWORD);
                        }}
                    >
                        {t("signin.forgotPassword")}
                    </Buton>

                    <Buton
                        mode={BtnModes.PRIMARY}
                        size={BtnSizes.LARGE}
                        fullWidth={true}
                        className="mt-5"
                        type="submit"
                        disabled={loading || !email || !password}
                    >
                        {loading ? t("signin.signingIn") : t("signin.submit")}
                    </Buton>

                    <Buton
                        mode={BtnModes.SECONDARY}
                        size={BtnSizes.LARGE}
                        fullWidth={true}
                        className="mt-5"
                        onClick={handleGoogleSignIn}
                    >
                        <GoogleIcon />
                        {t("signin.googleProvider")}
                    </Buton>

                    <Buton
                        mode={BtnModes.PRIMARY_TXT}
                        fullWidth={true}
                        className="mt-5"
                        onClick={() => {
                            navigate(Path.SIGN_UP);
                        }}
                    >
                        <Email />
                        {t("signin.signUpForm")}
                    </Buton>

                </div>
            </form>
        </div>
    );
};

export default SignInPage;
