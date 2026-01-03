import React, { useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DateRange, EmployeeProfileAvailabilityOption, EmployeeProfileAvailabilityOptions, EmployeeProfileForm } from "@shared/interfaces/EmployeeProfileI";
import { FormValidator } from "global/FormValidator";
import TabSwitcher, { TabSwitcherOption } from "../../components/TabSwitcher";
import DateRangeInput from "global/components/callendar/DateRangeInput";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import FloatingDateInput from "global/components/controls/FloatingDateInput";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import DateInputViewSelector from "global/components/callendar/DateInputViewSelector";

interface Props {
    formRef: UseFormReturn<EmployeeProfileForm>;
}

const EmployeeProfileStep3: React.FC<Props> = ({ formRef }) => {
    const { control, setValue, watch, formState } = formRef;
    const { t } = useTranslation();
    const availabilityOption = watch("step3.availabilityOption");
    const availabilityDateRanges = watch("step3.availabilityDateRanges") || [];

    const required = FormValidator.dateRangeRequired(t);
    const startDateRequired = FormValidator.required(t);

    const getDefaultDateRange = (): DateRange => {
        const end = new Date();
        end.setDate(end.getDate() + 7);
        return {
            start: new Date(),
            end,
            id: DateRangeUtil.newId(availabilityDateRanges)
        }
    }

    useEffect(() => {
        if (
            availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES &&
            (!availabilityDateRanges?.length)
        ) {
            const range = getDefaultDateRange()
            if (range) {
                setValue("step3.availabilityDateRanges", [range]);
            }
        }
    }, [availabilityOption]);

    const addRateRange = () => {
        let start: Date;
        if (availabilityDateRanges?.length) {
            // Find the latest end date among existing ranges
            const lastRange = availabilityDateRanges[availabilityDateRanges.length - 1];
            if (lastRange?.end) {
                start = new Date(lastRange.end);
                start.setDate(start.getDate() + 1); // next day after previous end
            } else {
                start = new Date();
            }
        } else {
            start = new Date();
        }
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        const newRange: DateRange = { start, end, id: DateRangeUtil.newId(availabilityDateRanges) };
        const newRanges = [
            ...availabilityDateRanges,
            newRange
        ]
        setValue("step3.availabilityDateRanges", newRanges);
    }

    const removeDateRange = (id?: number) => {
        const ranges = availabilityDateRanges?.filter((r, i) => r && r.id !== id);
        setValue("step3.availabilityDateRanges", (ranges || []).filter(Boolean));
    }

    const msgClass = "secondary-text mb-5"

    const tabOptions: TabSwitcherOption[] = [
        {
            label: t(`employeeProfile.form.availabilityOption.${EmployeeProfileAvailabilityOptions.FROM_DATE}.tab`),
            code: EmployeeProfileAvailabilityOptions.FROM_DATE,
        },
        {
            label: t(`employeeProfile.form.availabilityOption.${EmployeeProfileAvailabilityOptions.DATE_RANGES}.tab`),
            code: EmployeeProfileAvailabilityOptions.DATE_RANGES,
        },
        {
            label: t(`employeeProfile.form.availabilityOption.${EmployeeProfileAvailabilityOptions.ANYTIME}.tab`),
            code: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
    ];

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.step3.title")}
            </h3>

            <div className="flex flex-col gap-5 md:gap-5">
                <TabSwitcher
                    options={tabOptions}
                    value={availabilityOption}
                    onChange={code => setValue("step3.availabilityOption", code as EmployeeProfileAvailabilityOption)}
                />

                <div className="w-full flex mt-4">
                    <div className="primary-text w-full">
                        {availabilityOption === EmployeeProfileAvailabilityOptions.ANYTIME && (
                            <div className={msgClass}>
                                {t("employeeProfile.form.availabilityOption.ANYTIME.msg")}
                            </div>
                        )}
                        {availabilityOption === EmployeeProfileAvailabilityOptions.FROM_DATE && (
                            <>
                                <div className={msgClass}>
                                    {t("employeeProfile.form.availabilityOption.FROM_DATE.msg")}
                                </div>
                                <div>
                                    <Controller
                                        name={`step3.startDate`}
                                        control={control}
                                        rules={startDateRequired}
                                        render={({ field }) => {
                                            // Extract string message for this specific range error (RHF stores errors by index/key)
                                            const fieldError = (formState?.errors?.step4?.availabilityDateRanges as any)?.[0];
                                            const errorMessage = fieldError?.message as string | undefined;
                                            console.log('field.value', field.value);
                                            return (
                                                <DateInputViewSelector
                                                    label={t("employeeProfile.form.availabilityOption.FROM_DATE.startLabel")}
                                                    className="w-full"
                                                    value={field.value}
                                                    onChange={(date) => {
                                                        field.onChange(date);
                                                    }}
                                                    error={errorMessage}
                                                />

                                                // <FloatingDateInput
                                                //     className="w-full mt-5"
                                                //     value={field.value}
                                                //     label={t("employeeProfile.form.availabilityOption.FROM_DATE.startLabel")}
                                                //     onChange={(date) => {
                                                //         field.onChange(date)
                                                //     }}
                                                //     name={field.name}
                                                //     error={errorMessage ? { message: errorMessage } : undefined}
                                                // />
                                            )
                                        }}
                                    />
                                </div>
                            </>
                        )}
                        {availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES && (
                            <div className="w-full">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.availabilityOption.DATE_RANGES.msg")}
                                </div>
                                {availabilityDateRanges.map((dateRange, idx) => {

                                    return (
                                        <div key={dateRange?.id ?? idx} className="flex gap-2 items-end mt-4">
                                            <Controller
                                                name={`step3.availabilityDateRanges.${idx}` as const}
                                                control={control}
                                                rules={required}
                                                render={({ field }) => {
                                                    // Extract string message for this specific range error (RHF stores errors by index/key)
                                                    const fieldError = (formState?.errors?.step3?.availabilityDateRanges as any)?.[idx];
                                                    const errorMessage = fieldError?.message as string | undefined;
                                                    return (
                                                        <DateRangeInput
                                                            label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label") + (availabilityDateRanges.length ? ` #${idx + 1}` : "")}
                                                            className="w-full"
                                                            value={field.value || getDefaultDateRange()}
                                                            onChange={(dateRange) => {
                                                                if (dateRange) {
                                                                    field.onChange(dateRange)
                                                                }
                                                            }}
                                                            name={field.name}
                                                            error={errorMessage}
                                                        />
                                                    )
                                                }}
                                            />
                                            {idx > 0 && (
                                                <IconButton
                                                    className="mb-1"
                                                    icon={<DeleteIcon />}
                                                    size={BtnSizes.SMALL}
                                                    mode={BtnModes.ERROR_TXT}
                                                    onClick={() => {
                                                        removeDateRange(dateRange.id);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )
                                })}

                                <Button
                                    mode={BtnModes.PRIMARY_TXT}
                                    size={BtnSizes.SMALL}
                                    className="ml-auto mt-3"
                                    onClick={() => {
                                        addRateRange();
                                    }}
                                >
                                    {t("employeeProfile.form.availabilityOption.DATE_RANGES.add")}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </>
    );
};

export default EmployeeProfileStep3;