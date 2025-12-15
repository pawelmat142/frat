import React from "react";
import { Controller, Control, FormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FloatingInput from "global/components/controls/FloatingInput";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileForm, EmployeeProfileFormStep1 } from "@shared/interfaces/EmployeeProfileI";
import CommunicationLanguagesSection from "./CommunicationLanguagesSection";

interface Props {
    control: Control<EmployeeProfileForm>;
    setValue: any;
    watch: any;
    formState: FormState<EmployeeProfileForm>;
}

const EmployeeProfileStep1: React.FC<Props> = ({ control, setValue, watch, formState }) => {
    const { t } = useTranslation();
    const required = FormValidator.required(t);

    return (
        <>
            <h2 className="form-subheader">
                {t("employeeProfile.form.step1.title")}
            </h2>
            <div className="flex flex-col gap-5 md:gap-5">

                <Controller
                    name="step1.firstName"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            label={t("employeeProfile.form.firstName")}
                            fullWidth
                            required
                            error={formState.errors.step1?.firstName}
                        />
                    )}
                />

                <Controller
                    name="step1.lastName"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            label={t("employeeProfile.form.lastName")}
                            fullWidth
                            required
                            error={formState.errors.step1?.lastName}
                        />
                    )}
                />

                <CommunicationLanguagesSection
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    formState={formState}
                />
            </div>
        </>
    );
};

export default EmployeeProfileStep1;
