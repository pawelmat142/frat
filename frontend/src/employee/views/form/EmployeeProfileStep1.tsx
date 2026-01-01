import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FloatingInput from "global/components/controls/FloatingInput";
import { FormValidator } from "global/FormValidator";
import {
    EmployeeProfileForm
} from "@shared/interfaces/EmployeeProfileI";
import CommunicationLanguagesSection from "../../components/CommunicationLanguagesSection";
import AvatarTile from "user/components/AvatarTile";

interface Props {
    formRef: UseFormReturn<EmployeeProfileForm>;
}

const EmployeeProfileStep1: React.FC<Props> = ({ formRef }) => {
    const { t } = useTranslation();
    const required = FormValidator.required(t);
    const { control, setValue, watch, formState } = formRef;

    return (
        <>
            <h2 className="form-subheader">
                {t("employeeProfile.form.step1.title")}
            </h2>
            <div className="flex flex-col gap-5 md:gap-5">

                <Controller
                    name="step1.fullName"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            label={t("employeeProfile.form.fullName")}
                            fullWidth
                            required
                            error={formState.errors.step1?.fullName}
                        />
                    )}
                />

                <Controller
                    name="step1.phoneNumber"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            label={t("employeeProfile.form.phoneNumber")}
                            fullWidth
                            required
                            error={formState.errors.step1?.phoneNumber}
                        />
                    )}
                />

                <Controller
                    name="step1.email"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            label={t("employeeProfile.form.email")}
                            fullWidth
                            required
                            error={formState.errors.step1?.email}
                        />
                    )}
                />

                <CommunicationLanguagesSection
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    formState={formState}
                />

                <AvatarTile></AvatarTile>
            </div>
        </>
    );
};

export default EmployeeProfileStep1;
