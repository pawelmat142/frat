import React, { useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DateRange, EmployeeProfileAvailabilityOption, EmployeeProfileAvailabilityOptions, EmployeeProfileForm, EmployeeProfileFormRangesOption, EmployeeProfileFormRangesOptions } from "@shared/interfaces/EmployeeProfileI";
import { FormValidator } from "global/FormValidator";
import TabSwitcher, { TabSwitcherOption } from "../../components/TabSwitcher";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import DateInputViewSelector from "global/components/callendar/DateInputViewSelector";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";

interface Props {
    formRef: UseFormReturn<EmployeeProfileForm>;
}

const EmployeeProfileStep3: React.FC<Props> = ({ formRef }) => {
    const { control, setValue, watch, getValues, formState } = formRef;
    const { t } = useTranslation();
    const availabilityOption = watch("step3.availabilityOption");
    const availabilityDateRanges = watch("step3.availabilityDateRanges") || [];
    const rangesOption = watch("step3.rangesOption");

    const required = FormValidator.dateRangeRequired(t);
    const startDateRequired = FormValidator.required(t);

    const getDefaultDateRange = (): DateRange => {
        return {
            start: new Date(),
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
        const newRange: DateRange = { start, id: DateRangeUtil.newId(availabilityDateRanges) };
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

    const msgClass = "secondary-text mb-5 mt-4"

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

    const rangesOptions: TabSwitcherOption[] = [{
        label: t(`employeeProfile.form.rangesOption.${EmployeeProfileFormRangesOptions.AVAILABLE_ON}.tab`),
        code: EmployeeProfileFormRangesOptions.AVAILABLE_ON,
    }, {
        label: t(`employeeProfile.form.rangesOption.${EmployeeProfileFormRangesOptions.NOT_AVAILABLE_ON}.tab`),
        code: EmployeeProfileFormRangesOptions.NOT_AVAILABLE_ON,
    }]


    const setAvailabilityOption = (option: EmployeeProfileAvailabilityOption) => {
        setValue("step3.availabilityOption", option);
        if (option === EmployeeProfileAvailabilityOptions.DATE_RANGES && !rangesOption) {
            setValue("step3.rangesOption", EmployeeProfileFormRangesOptions.AVAILABLE_ON);
        }
    }

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.step3.title")}
            </h3>

            <div className="flex flex-col gap-3 md:gap-3">
                <TabSwitcher
                    options={tabOptions}
                    value={availabilityOption}
                    onChange={code => setAvailabilityOption(code as EmployeeProfileAvailabilityOption)}
                />
                <div className="w-full flex">
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
                                            const fieldError = (formState?.errors?.step4?.availabilityDateRanges as any)?.[0];
                                            const errorMessage = fieldError?.message as string | undefined;
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
                                            )
                                        }}
                                    />
                                </div>
                            </>
                        )}
                        {availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES && (
                            <div className="w-full">

                                <TabSwitcher
                                    options={rangesOptions}
                                    value={rangesOption!}
                                    onChange={code => setValue("step3.rangesOption", code as EmployeeProfileFormRangesOption)}
                                />

                                <div className={msgClass}>
                                    {t(`employeeProfile.form.rangesOption.${rangesOption}.msg`)}
                                </div>
                                <div className="mb-5"></div>

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
                                                        <DateRangeInputViewSelector
                                                            label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label") + (availabilityDateRanges.length ? ` #${idx + 1}` : "")}
                                                            className="w-full"
                                                            value={field.value || getDefaultDateRange()}
                                                            onChange={(dateRange) => {
                                                                field.onChange(dateRange)
                                                            }}
                                                            error={errorMessage}
                                                        />

                                                        // <DateRangeInput
                                                        //     label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label") + (availabilityDateRanges.length ? ` #${idx + 1}` : "")}
                                                        //     className="w-full"
                                                        //     value={field.value || getDefaultDateRange()}
                                                        //     onChange={(dateRange) => {
                                                        //         if (dateRange) {
                                                        //             field.onChange(dateRange)
                                                        //         }
                                                        //     }}
                                                        //     name={field.name}
                                                        //     error={errorMessage}
                                                        // />
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