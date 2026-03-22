import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { WorkerForm } from "@shared/interfaces/WorkerI";
import DictionarySelector from "global/components/selector/DictionarySelector";
import DateInputViewSelector from "global/components/callendar/DateInputViewSelector";
import FloatingInput from "global/components/controls/FloatingInput";
import BooleanSelector from "global/components/controls/BooleanSelector";
import { FormValidator } from "global/FormValidator";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStepCareer: React.FC<Props> = ({ formRef }) => {
    const { control, formState } = formRef;
    const { t } = useTranslation();

    return (
        <>
            <h2 className="form-subheader">
                {t("employeeProfile.form.career.title")}
            </h2>

            <div className="flex flex-col gap-5 md:gap-5 mt-5">
                <Controller
                    name="career.categories"
                    control={control}
                    render={({ field }) => (
                        <DictionarySelector
                            type="multi"
                            className="w-full"
                            valueInput={field.value ?? []}
                            onSelectMulti={items => field.onChange(items)}
                            label={t("employeeProfile.form.career.categories")}
                            code="WORK_CATEGORY"
                            fullWidth
                        />
                    )}
                />

                <Controller
                    name="career.careerStartDate"
                    control={control}
                    render={({ field }) => (
                        <DateInputViewSelector
                            label={t("employeeProfile.form.career.careerStartDate")}
                            className="w-full"
                            value={field.value ?? null}
                            onChange={date => field.onChange(date ?? undefined)}
                        />
                    )}
                />

                <Controller
                    name="career.maxAltitude"
                    control={control}
                    rules={FormValidator.positiveInterger(t)}
                    render={({ field }) => (
                        <FloatingInput
                            type="number"
                            label={t("employeeProfile.form.career.maxAltitude")}
                            fullWidth
                            value={field.value ?? ''}
                            onChange={e => {
                                const v = e.target.value;
                                field.onChange(v === '' ? undefined : Number(v));
                            }}
                            error={formState.errors.career?.maxAltitude}
                        />
                    )}
                />

                <Controller
                    name="career.readyToTravel"
                    control={control}
                    render={({ field }) => (
                        <BooleanSelector
                            value={field.value ?? null}
                            onChange={field.onChange}
                            label={t("employeeProfile.form.career.readyToTravel")}
                            labelTrue={t("common.yes")}
                            labelFalse={t("common.no")}
                        />
                    )}
                />
            </div>
        </>
    );
};

export default WorkerFormStepCareer;
