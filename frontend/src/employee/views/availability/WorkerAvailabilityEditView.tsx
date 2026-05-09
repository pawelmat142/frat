import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DateRange, WorkerAvailabilityOptions, WorkerForm, WorkerWithCertificates } from "@shared/interfaces/WorkerI";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import Header from "global/components/Header";
import WorkerFormStepAvailability from "../form/WorkerFormStepAvailability";
import { useUserContext } from "user/UserProvider";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { useGlobalContext } from "global/providers/GlobalProvider";

const WorkerAvailabilityEditView: React.FC = () => {

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

    const availabilityDateRanges: DateRange[] = (worker.availabilityDateRanges || [])
        .map(r => DateRangeUtil.toDateRange(r))
        .filter((r): r is DateRange => r != null);


    const formRef = useForm<WorkerForm>({
        defaultValues: {
            availability: {
                availabilityOption: worker.availabilityOption || WorkerAvailabilityOptions.ANYTIME,
                availabilityDateRanges: availabilityDateRanges,
                rangesOption: worker.rangesOption,
                startDate: worker.startDate || null,
            },
        }
    });

    const handleSave = async () => {
        // TODO: Obsługa zapisu - dodać usługę do zapisu danych
        const availabilityData = formRef.getValues("availability");
        console.log("Saving availability:", availabilityData);
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="relative flex flex-col w-full flex-1">
            <Header title={t("employeeProfile.form.availability.title")} />

            <form className="flex flex-col flex-1">
                <div className="flex-1 p-4">
                    <WorkerFormStepAvailability formRef={formRef} />
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

export default WorkerAvailabilityEditView;
