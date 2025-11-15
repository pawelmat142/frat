

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "global/components/controls/Input";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { AuthService } from "auth/services/AuthService";
import { Utils } from "global/utils";
import { useNavigate } from "react-router-dom";
import { usePopup } from "global/providers/PopupProvider";
import { Path } from "./../../path";
import Loading from "global/components/Loading";
import Logo from "global/components/Logo";
import IconButton from "global/components/controls/IconButon";

const SignUpPage: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [repeatEmail, setRepeatEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const popup = usePopup();

    const isDevMode = Utils.isDevMode();

    const handleDevFill = () => {
        setEmail("pawelmat142@t.pl");
        setRepeatEmail("pawelmat142@t.pl");
        setPassword("pawelmat142");
        setRepeatPassword("pawelmat142");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await AuthService.registerForm({
                email,
                password,
                confirmEmail: repeatEmail,
                confirmPassword: repeatPassword
            })

            await popup({
                title: t("signup.successTitle"),
                message: t("signup.successMessage"),
                buttons: [{ text: t("common.ok") }] 
            })

            navigate(Path.SIGN_IN);
        }

        catch (e: any) { } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Loading></Loading>
        )
    }

    return (
        <div className="form-view relative">

            <div className="mt-10 mb-10 mx-auto flex justify-center">
                <IconButton onClick={() => { navigate(Path.HOME) }} icon={
                    <Logo />
                }></IconButton>
            </div>

            <form className="" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-10 md:mb-6">
                    <h2 className="text-lg font-bold">{t("signup.title")}</h2>

                    {isDevMode && (
                        <Button onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT} className="ripple mb-2">
                            DEV FILL
                        </Button>)}

                </div>
                <div className="flex flex-col gap-7 md:gap-5">
                    <Input
                        name="email"
                        label={t("signup.email")}
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        fullWidth
                    />
                    <Input
                        name="repeatEmail"
                        label={t("signup.repeatEmail")}
                        type="email"
                        value={repeatEmail}
                        onChange={e => setRepeatEmail(e.target.value)}
                        required
                        fullWidth
                    />
                    <Input
                    className="mt-3"
                        name="password"
                        label={t("signup.password")}
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        fullWidth
                    />
                    <Input
                        name="repeatPassword"
                        label={t("signup.repeatPassword")}
                        type="password"
                        value={repeatPassword}
                        onChange={e => setRepeatPassword(e.target.value)}
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
                    disabled={loading || !email || !repeatEmail || !password || !repeatPassword}
                >
                    {loading ? t("signup.registering") : t("signup.submit")}
                </Button>

            </form>

            <div className="flex items-center cursor-pointer mx-auto w-full justify-center mt-10 mb-10" onClick={() => {
                navigate(Path.SIGN_IN);
            }}>
                {/* TODO translation */}
                <span className="">Already have an account?</span>
                <Button mode={BtnModes.PRIMARY_TXT} fullWidth={false} >
                    Sign In
                </Button>
            </div>
        </div>
    );
};

export default SignUpPage;
