import React from "react";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import { useNavigate } from "react-router-dom";
import { httpClient } from "global/services/http";
import { Path } from "./../../path";
import { useTranslation } from "react-i18next";
import ReportForm from "global/components/ReportForm";

const ErrorPage: React.FC = () => {

    const [msg, setMsg] = React.useState<string>("");
    const hasReadMsg = React.useRef(false);

    const { t } = useTranslation();
    // Ensures the error message is read and cleared only once
    React.useEffect(() => {
        if (!hasReadMsg.current) {
            setMsg(httpClient.getAndClearErrorMsg());
            hasReadMsg.current = true;
        }
    }, []);


    const navigate = useNavigate();

    // Prevents returning to the page where the error occurred
    React.useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            navigate(Path.HOME, { replace: true });
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate]);


    return (
        <div className="w-full px-5 py-3 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="flex flex-col gap-4 p-6 border rounded shadow max-w-lg w-full bg-secondary-bg">
                <h2 className="text-2xl font-bold error-color mb-2">{t("validation.view.title")}</h2>
                <div className="text-base primary-text mb-4">{msg}</div>
                <div className="flex gap-2 justify-center mt-2">
                    <Button mode={BtnModes.PRIMARY} onClick={() => navigate(Path.HOME)}>{t("validation.view.goHome")}</Button>
                </div>
            </div>

            <ReportForm title={t("validation.view.reportTitle")} />
        </div>
    );
};

export default ErrorPage;
