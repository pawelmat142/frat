import React from "react";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { WorkerForm } from "@shared/interfaces/WorkerI";
import CertificateSelector from "global/components/selector/CertificateSelector";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStepCertificates: React.FC<Props> = ({ formRef }) => {
    const { t } = useTranslation();

    return (
        <>
            <h2 className="form-subheader">{t("employeeProfile.form.certificates.title")}</h2>

            <p className="secondary-text mb-5 s-font">
                {t("employeeProfile.form.certificates.info")}
            </p>

            <CertificateSelector
                formRef={formRef}
                fieldName="certificates.certificates"
            />
        </>
    );
};

export default WorkerFormStepCertificates;
