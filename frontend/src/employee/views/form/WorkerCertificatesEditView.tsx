import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { WorkerForm, WorkerWithCertificates, WorkerLocationOptions, WorkerAvailabilityOptions, WorkerFormSteps } from "@shared/interfaces/WorkerI";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Header from "global/components/Header";
import { useUserContext } from "user/UserProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import WorkerFormStepCertificates from "./WorkerFormStepCertificates";
import { Path } from "../../../path";

const WorkerCertificatesEditView: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();

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
            currentStep: WorkerFormSteps.CERTIFICATES,
            personalData: {
                fullName: "",
                phoneNumber: { prefix: "+00", number: "" },
                email: "",
                communicationLanguages: [""]
            },
            career: {
                categories: [],
                careerStartDate: undefined,
                readyToTravel: undefined,
            },
            location: {
                locationOption: WorkerLocationOptions.POSITION,
                countryCode: null,
                geocodedPosition: null,
            },
            availability: {
                availabilityOption: WorkerAvailabilityOptions.ANYTIME,
                availabilityDateRanges: [],
                startDate: null,
            },
            certificates: {
                certificates: worker.certificates || [],
            },
            certificateDates: {
                certificateDates: {}
            }
        }
    });

    const handleNext = () => {
        const certificatesData = formRef.getValues("certificates");
        navigate(Path.WORKER_CERTIFICATE_DATES_EDIT, {
            state: {
                certificates: certificatesData.certificates || []
            }
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

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
                            onClick={handleNext}
                            size={BtnSizes.LARGE}
                            mode={BtnModes.PRIMARY}
                            className="flex-1"
                            aria-label={t("common.next")}
                        >
                            {t("common.next")}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default WorkerCertificatesEditView;
