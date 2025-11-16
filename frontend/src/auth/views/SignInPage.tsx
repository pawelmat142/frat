

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "global/components/controls/Input";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { AuthService } from "auth/services/AuthService";
import { Utils } from "global/utils";
import { useNavigate } from "react-router-dom";
import { Path } from "../../path";
import Loading from "global/components/Loading";
import Logo from "global/components/Logo";
import { FaPlus } from "react-icons/fa";
import GoogleIcon from "global/components/icons/GoogleIcon";
import IconButton from "global/components/controls/IconButon";

const SignInPage: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const isDevMode = Utils.isDevMode();

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
    const iconSize = 42

    return (
        <div className="form-view relative">

            <div className="mt-10 mb-5 mx-auto flex justify-center">
                <IconButton onClick={() => { navigate(Path.HOME) }} icon={
                    <Logo />
                }></IconButton>
            </div>

            <form className="" onSubmit={handleSubmit}>
                <h2 className="form-header">
                    {t("signin.title")}
                </h2>

                {isDevMode && (
                    <div className="flex items-center justify-end">
                        <Button onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT}>
                            DEV FILL
                        </Button>
                    </div>
                )}

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

                <Button
                    mode={BtnModes.SECONDARY_TXT}
                    size={BtnSizes.SMALL}
                    className="ml-auto mb-10 md:mb-5 secondary-text"
                    onClick={() => {
                        navigate(Path.FORGOT_PASSWORD);
                    }}
                >
                    {t("signin.forgotPassword")}
                </Button>

                <Button
                    mode={BtnModes.PRIMARY}
                    size={BtnSizes.LARGE}
                    fullWidth={true}
                    className="mt-5"
                    type="submit"
                    disabled={loading || !email || !password}
                >
                    {loading ? t("signin.signingIn") : t("signin.submit")}
                </Button>

            </form>

            <div className="text-center mt-10 mb-4">
                {t("signin.orSignInWith")}
            </div>

            <div className="tiles-center-wrapper pb-5">

                <div></div>

                <div className="square-tile p-5 col-tile" onClick={() => handleGoogleSignIn()}>
                    <GoogleIcon size={iconSize} />
                    <div>Google</div>
                </div>

                <div className="square-tile p-5 col-tile">
                    <FaPlus size={iconSize} />
                    <div>TODO</div>
                </div>

            </div>

            <div className="flex items-center cursor-pointer mx-auto w-full justify-center mt-10 mb-10" onClick={() => {
                navigate(Path.SIGN_UP);
            }}>
                {/* TODO translation */}
                <span className="">{t("signin.noAccount")}</span>
                <Button mode={BtnModes.PRIMARY_TXT} fullWidth={false} >
                    {t("signup.title")}
                </Button>
            </div>
        </div>
    );
};

export default SignInPage;
