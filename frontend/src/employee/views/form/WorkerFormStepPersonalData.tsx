import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FloatingInput from "global/components/controls/FloatingInput";
import { FormValidator } from "global/FormValidator";
import {
    WorkerForm
} from "@shared/interfaces/WorkerI";
import CommunicationLanguagesSection from "../../components/CommunicationLanguagesSection";
import AvatarUploadField from "global/components/controls/AvatarUploadField";
import PhoneNumberFloatingInput from "global/components/controls/PhoneNumberFloatingInput";
import { useUserContext } from "user/UserProvider";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormpersonalData: React.FC<Props> = ({ formRef }) => {
    const { t } = useTranslation();
    const { me } = useUserContext();
    const required = FormValidator.required(t);
    const { control, setValue, watch, formState } = formRef;

    return (
        <>
            <h2 className="form-subheader">
                {t("employeeProfile.form.personalData.title")}
            </h2>
            <div className="flex flex-col gap-5 md:gap-5">

                <Controller
                    name="personalData.fullName"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            label={t("employeeProfile.form.fullName")}
                            fullWidth
                            required
                            error={formState.errors.personalData?.fullName}
                        />
                    )}
                />

                <Controller
                    name="personalData.phoneNumber"
                    control={control}
                    rules={{
                        ...required,
                        ...FormValidator.phoneNumber(t)
                    }}
                    render={({ field }) => (
                        <PhoneNumberFloatingInput
                            {...field}
                            label={t("employeeProfile.form.phoneNumber")}
                            fullWidth
                            required
                            error={formState.errors.personalData?.phoneNumber}
                        />
                    )}
                />

                <Controller
                    name="personalData.email"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <FloatingInput
                            {...field}
                            label={t("employeeProfile.form.email")}
                            fullWidth
                            required
                            error={formState.errors.personalData?.email}
                        />
                    )}
                />

                <CommunicationLanguagesSection
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    formState={formState}
                />  

                <Controller
                    name="personalData.avatarRef"
                    control={control}
                    rules={required}
                    render={({ field }) => (
                        <AvatarUploadField
                            value={field.value}
                            onChange={field.onChange}
                            uid={me?.uid}
                            error={formState.errors.personalData?.avatarRef}
                            required
                        />
                    )}
                />
            </div>
        </>
    );
};

export default WorkerFormpersonalData;
