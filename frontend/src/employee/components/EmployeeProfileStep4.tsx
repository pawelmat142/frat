import React from "react";
import { Control, FormState, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { EmployeeProfileForm } from "@shared/interfaces/EmployeeProfileI";
import EmployeeProfileDates from "./EmployeeProfileDates";

interface Props {
    control: Control<EmployeeProfileForm>;
    setValue: UseFormSetValue<EmployeeProfileForm>;
    watch: UseFormWatch<EmployeeProfileForm>;
    formState: FormState<EmployeeProfileForm>;
}

const EmployeeProfileStep4: React.FC<Props> = ({ control, setValue, watch, formState }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-7 md:gap-5">
            <h3 className="text-xl font-semibold mb-2">
                {t("employeeProfile.form.step4.title")}
            </h3>
            
            <EmployeeProfileDates
                control={control}
                setValue={setValue}
                watch={watch}
                formState={formState}
            />
        </div>
    );
};

export default EmployeeProfileStep4;
