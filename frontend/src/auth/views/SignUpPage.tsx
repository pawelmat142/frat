

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

    // Developer autofill button
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

    return (
        <div className="w-full px-5 py-3 relative">
            <form className="flex flex-col gap-4 px-4 py-6 rounded mt-5 md:mt-20 max-w-xl mx-auto mb-20 border border-color" onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{t("signup.title")}</h2>

                    {isDevMode && (
                        <Button onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT} className="ripple mb-2">
                            DEV FILL
                        </Button>)}

                </div>
                <div className="flex flex-col gap-3">
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

                <div className="buttons">
                    <Button
                        mode={BtnModes.PRIMARY}
                        size={BtnSizes.LARGE}
                        fullWidth={true}
                        className="mt-5"
                        type="submit"
                        disabled={loading || !email || !repeatEmail || !password || !repeatPassword}
                    >
                        {loading ? t("signup.registering") : t("signup.submit")}
                    </Button>

                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        fullWidth={true}
                        className="mt-5"
                        onClick={() => {
                            navigate(-1);
                        }}
                    >
                        {t("common.back")}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SignUpPage;
