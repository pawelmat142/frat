import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { WorkerForm, WorkerWithCertificates } from "@shared/interfaces/WorkerI";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Header from "global/components/Header";
import { useUserContext } from "user/UserProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { WorkerService } from "employee/services/WorkerService";
import { toast } from "react-toastify";
import Loading from "global/components/Loading";
import { WorkerUtil } from "@shared/utils/WorkerUtil";
import WorkerFormStepCertificates from "./WorkerFormStepCertificates";

const WorkerCertificatesEditView: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();

    const [loading, setLoading] = useState(false);

    const worker: WorkerWithCertificates | null = userCtx?.meCtx?.workerProfile || null;

    useEffect(() => {
        globalCtx.hideFooter();
        return globalCtx.showFooter
    }, [])

    if (!worker) {
        return null
    }

    const formRef = useForm<WorkerForm>({
        defaultValues: {
            currentStep: 'certificates',
            certificates: {
                certificates: worker.certificates || [],
            },
            certificateDates: {
                certificateDates: WorkerUtil.prepareCertificateDates(worker)
            }
        }
    });

    const handleSave = async () => {
        try {
            const certificatesData = formRef.getValues("certificates");
            const certificateDatesData = formRef.getValues("certificateDates");
            setLoading(true);
            const result = await WorkerService.updateCertificates({
                ...certificatesData,
                ...certificateDatesData
            });
            userCtx.initWorker();
            toast.success(t("employeeProfile.form.submitSuccess"));
            handleBack();
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <Loading></Loading>
    }

    return (
        <div className="relative flex flex-col w-full flex-1">
            <Header title={t("employeeProfile.form.certificates.title")} />

            <form className="flex flex-col flex-1">
                <div className="flex-1 p-4">
                    <WorkerFormStepCertificates formRef={formRef} />
                </div>

                <div className="view-margin pb-3">
                    <div className="form-wizard-buttons">
                        <Button
                            type="button"
                            onClick={handleBack}
                            size={BtnSizes.LARGE}
                            mode={BtnModes.SECONDARY_TXT}
                            className="flex-1"
                            aria-label={t("common.back")}
                        >
                            {t("common.back")}
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSave}
                            size={BtnSizes.LARGE}
                            mode={BtnModes.PRIMARY}
                            className="flex-1"
                            aria-label={t("common.save")}
                        >
                            {t("common.save")}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default WorkerCertificatesEditView;
