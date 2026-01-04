import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { WorkerForm } from "@shared/interfaces/WorkerProfileI";
import DictionarySelector from "global/components/selector/DictionarySelector";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStep4: React.FC<Props> = ({ formRef }) => {
    const { control, formState } = formRef;
    const { t } = useTranslation();
    const requiredArray = FormValidator.requiredArray(t);

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.step4.title")}
            </h3>

            <div className="flex flex-col gap-5 md:gap-5 mt-5">

                <Controller
                    name="step4.certificates"
                    control={control}
                    rules={requiredArray}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => field.onChange(items)}
                            label={t("employeeProfile.form.certificates")}
                            code="CERTIFICATES"
                            fullWidth
                            required
                            error={formState.errors.step4?.certificates}
                        />
                    )}
                />
                <Controller
                    name="step4.experience"
                    control={control}
                    rules={requiredArray}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value}
                            onSelectMulti={items => {
                                
                                console.log(items);
                                field.onChange(items)}}
                            label={t("employeeProfile.form.experience")}
                            code="SKILLS"
                            fullWidth
                            required
                            error={formState.errors.step4?.experience}
                        />
                    )}
                />

            </div>
        </>
    );
};

export default WorkerFormStep4;
