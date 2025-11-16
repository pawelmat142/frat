import React from "react";
import { Controller, Control, FormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileForm } from "@shared/interfaces/EmployeeProfileI";
import DictionarySelector from "global/components/selector/DictionarySelector";

interface Props {
    control: Control<EmployeeProfileForm>;
    formState: FormState<EmployeeProfileForm>;
}

const EmployeeProfileStep2: React.FC<Props> = ({ control, formState }) => {
    const { t } = useTranslation();
    const requiredArray = FormValidator.requiredArray(t);

    return (
        <>
            <h2 className="form-header">
                {t("employeeProfile.form.step2.title")}
            </h2>

            <div className="flex flex-col gap-7 md:gap-5">
                <Controller
                    name="step2.skills"
                    control={control}
                    rules={requiredArray}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("employeeProfile.form.skills")}
                            code="SKILLS"
                            fullWidth
                            required
                            error={formState.errors.step2?.skills}
                        />
                    )}
                />

                <Controller
                    name="step2.certificates"
                    control={control}
                    rules={requiredArray}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items.map(i => String(i.value)))}
                            label={t("employeeProfile.form.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                            required
                            error={formState.errors.step2?.certificates}
                        />
                    )}
                />
            </div>
        </>
    );
};

export default EmployeeProfileStep2;
