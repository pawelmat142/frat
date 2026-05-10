import React, { useEffect, useState, useRef } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DateRange, WorkerAvailabilityOption, WorkerAvailabilityOptions, WorkerForm, WorkerFormRangesOption, WorkerFormRangesOptions } from "@shared/interfaces/WorkerI";
import { FormValidator } from "global/FormValidator";
import TabSwitcher, { TabSwitcherOption } from "../../components/TabSwitcher";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { DateUtil } from "@shared/utils/DateUtil";
import FloatingDateInput, { datepickerWithDaysConfig } from "global/components/callendar/FloatingDateInput";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
}

const WorkerFormStepAvailability: React.FC<Props> = ({ formRef }) => {
    const { control, setValue, watch, getValues, formState } = formRef;
    const { t } = useTranslation();
    const availabilityOption = watch("availability.availabilityOption");
    const availabilityDateRanges = watch("availability.availabilityDateRanges") || [];
    const rangesOption = watch("availability.rangesOption");

    const required = FormValidator.dateRangeRequired(t);
    const startDateRequired = FormValidator.required(t);

    const rangesStateRef = useRef<{
        [WorkerFormRangesOptions.AVAILABLE_ON]: DateRange[];
        [WorkerFormRangesOptions.NOT_AVAILABLE_ON]: DateRange[];
    }>({
        [WorkerFormRangesOptions.AVAILABLE_ON]: [],
        [WorkerFormRangesOptions.NOT_AVAILABLE_ON]: [],
    });
    const prevRangesOptionRef = useRef(rangesOption);

    // Initialize ranges on first mount
    useEffect(() => {
        if (!rangesOption) return;
        rangesStateRef.current[rangesOption] = availabilityDateRanges || [];
        prevRangesOptionRef.current = rangesOption;
    }, []);

    // Handle rangesOption change - swap between availability and unavailability ranges
    useEffect(() => {
        if (!rangesOption) return;

        const prevOption = prevRangesOptionRef.current;

        // Save current ranges to the previous option
        if (prevOption) {
            rangesStateRef.current[prevOption] = availabilityDateRanges;
        }

        // Load ranges for the new option only when rangesOption actually changes
        if (prevOption !== rangesOption) {
            let newRanges = rangesStateRef.current[rangesOption] || [];
            // Ensure at least one range is available when switching options
            if (!newRanges.length) {
                newRanges = [getDefaultDateRange()];
            }
            setValue("availability.availabilityDateRanges", newRanges);
            prevRangesOptionRef.current = rangesOption;
        } else {
            // Just update the ref when ranges change within same option
            rangesStateRef.current[rangesOption] = availabilityDateRanges;
        }
    }, [rangesOption, setValue, availabilityDateRanges]);

    const getRanges = (): DateRange[] => {
        return availabilityDateRanges || [];
    }

    const getDefaultDateRange = (): DateRange => {
        return {
            start: DateUtil.toLocalDateString(new Date()),
            id: DateRangeUtil.newId(availabilityDateRanges)
        }
    }

    const onRangeChange = (dateRange: DateRange | null, idx: number) => {
        const newRanges = [...availabilityDateRanges];

        if (dateRange) {
            newRanges[idx] = dateRange;
        } else {
            newRanges.splice(idx, 1);
        }

        // Update form
        setValue("availability.availabilityDateRanges", newRanges);
    }

    useEffect(() => {
        if (
            availabilityOption === WorkerAvailabilityOptions.DATE_RANGES &&
            (!availabilityDateRanges?.length)
        ) {
            const range = getDefaultDateRange()
            if (range) {
                setValue("availability.availabilityDateRanges", [range]);
            }
        } else if (availabilityOption === WorkerAvailabilityOptions.FROM_DATE) {
            if (!getValues("availability.startDate")) {
                setValue("availability.startDate", DateUtil.toLocalDateString(new Date()));
            }
        }
    }, [availabilityOption]);

    const addRateRange = () => {
        let start: string;
        if (availabilityDateRanges?.length) {
            // Find the latest end date among existing ranges
            const lastRange = availabilityDateRanges[availabilityDateRanges.length - 1];
            if (lastRange?.end) {
                const endDate = DateUtil.parseDateFromStringLocalDate(lastRange.end);
                if (endDate) {
                    endDate.setDate(endDate.getDate() + 1); // next day after previous end
                    start = DateUtil.toLocalDateString(endDate)!;
                } else {
                    start = DateUtil.toLocalDateString(new Date())!;
                }
            } else {
                start = DateUtil.toLocalDateString(new Date())!;
            }
        } else {
            start = DateUtil.toLocalDateString(new Date())!;
        }
        const newRange: DateRange = { start, id: DateRangeUtil.newId(availabilityDateRanges) };
        const newRanges = [
            ...availabilityDateRanges,
            newRange
        ]
        setValue("availability.availabilityDateRanges", newRanges);
    }

    const removeDateRange = (id?: number) => {
        const ranges = availabilityDateRanges?.filter((r) => r && r.id !== id);
        setValue("availability.availabilityDateRanges", (ranges || []).filter(Boolean));
    }

    const msgClass = "secondary-text mb-5 mt-4"

    const tabOptions: TabSwitcherOption[] = [
        {
            label: t(`employeeProfile.form.availabilityOption.${WorkerAvailabilityOptions.FROM_DATE}.tab`),
            code: WorkerAvailabilityOptions.FROM_DATE,
        },
        {
            label: t(`employeeProfile.form.availabilityOption.${WorkerAvailabilityOptions.DATE_RANGES}.tab`),
            code: WorkerAvailabilityOptions.DATE_RANGES,
        },
        {
            label: t(`employeeProfile.form.availabilityOption.${WorkerAvailabilityOptions.ANYTIME}.tab`),
            code: WorkerAvailabilityOptions.ANYTIME,
        },
    ];

    const rangesOptions: TabSwitcherOption[] = [{
        label: t(`employeeProfile.form.rangesOption.${WorkerFormRangesOptions.AVAILABLE_ON}.tab`),
        code: WorkerFormRangesOptions.AVAILABLE_ON,
    }, {
        label: t(`employeeProfile.form.rangesOption.${WorkerFormRangesOptions.NOT_AVAILABLE_ON}.tab`),
        code: WorkerFormRangesOptions.NOT_AVAILABLE_ON,
    }]


    const setAvailabilityOption = (option: WorkerAvailabilityOption) => {
        setValue("availability.availabilityOption", option);
        if (option === WorkerAvailabilityOptions.DATE_RANGES && !rangesOption) {
            setValue("availability.rangesOption", WorkerFormRangesOptions.AVAILABLE_ON);
        }
    }

    const ranges = getRanges();

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.availability.title")}
            </h3>

            <div className="flex flex-col gap-3 md:gap-3">
                <TabSwitcher
                    options={tabOptions}
                    value={availabilityOption}
                    onChange={code => setAvailabilityOption(code as WorkerAvailabilityOption)}
                />
                <div className="w-full flex">
                    <div className="primary-text w-full">
                        {availabilityOption === WorkerAvailabilityOptions.ANYTIME && (
                            <div className={msgClass}>
                                {t("employeeProfile.form.availabilityOption.ANYTIME.msg")}
                            </div>
                        )}
                        {availabilityOption === WorkerAvailabilityOptions.FROM_DATE && (
                            <>
                                <div className={msgClass}>
                                    {t("employeeProfile.form.availabilityOption.FROM_DATE.msg")}
                                </div>
                                <div>

                                    <Controller
                                        name="availability.startDate"
                                        control={control}
                                        rules={startDateRequired}
                                        render={({ field }) => {
                                            const fieldError = formState?.errors?.availability?.startDate;
                                            const errorMessage = fieldError?.message as string | undefined;
                                            return (
                                                <FloatingDateInput
                                                    required
                                                    label={t("employeeProfile.form.availabilityOption.FROM_DATE.startLabel")}
                                                    className="w-full"
                                                    value={field.value ? DateUtil.parseDateFromStringLocalDate(field.value) : null}
                                                    onChange={date => field.onChange(DateUtil.toLocalDateString(date) ?? null)}
                                                    error={errorMessage ? { message: errorMessage } : undefined}
                                                    config={datepickerWithDaysConfig}
                                                />
                                            )
                                        }}
                                    />

                                </div>
                            </>
                        )}
                        {availabilityOption === WorkerAvailabilityOptions.DATE_RANGES && (
                            <div className="w-full">

                                <TabSwitcher
                                    options={rangesOptions}
                                    value={rangesOption!}
                                    onChange={code => setValue("availability.rangesOption", code as WorkerFormRangesOption)}
                                />

                                <div className={msgClass}>
                                    {t(`employeeProfile.form.rangesOption.${rangesOption}.msg`)}
                                </div>
                                <div className="mb-5"></div>

                                {ranges.map((dateRange, idx) => {
                                    return (
                                        <div key={`${rangesOption}-range-${idx}`} className="flex gap-2 items-end mt-4">
                                            <Controller
                                                name={`availability.availabilityDateRanges.${idx}` as const}
                                                control={control}
                                                rules={required}
                                                render={({ field }) => {
                                                    // Extract string message for this specific range error (RHF stores errors by index/key)
                                                    const fieldError = (formState?.errors?.availability?.availabilityDateRanges as any)?.[idx];
                                                    const errorMessage = fieldError?.message as string | undefined;
                                                    // Use availabilityDateRanges[idx] from watch() to ensure synchronization
                                                    const currentValue = availabilityDateRanges[idx] || field.value || getDefaultDateRange();
                                                    return (
                                                        <DateRangeInputViewSelector
                                                            required
                                                            label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label") + (availabilityDateRanges.length ? ` #${idx + 1}` : "") + ` (${t(`employeeProfile.form.rangesOption.${rangesOption}.tab`)})`}
                                                            className="w-full"
                                                            value={currentValue}
                                                            onChange={(dateRange) => {
                                                                onRangeChange(dateRange || null, idx);
                                                            }}
                                                            error={errorMessage}
                                                            rightIcon={
                                                                (idx > 0 && <IconButton
                                                                    className="mb-1"
                                                                    icon={<DeleteIcon />}
                                                                    mode={BtnModes.ERROR_TXT}
                                                                    onClick={() => {
                                                                        removeDateRange(dateRange.id);
                                                                    }}
                                                                />)
                                                            }
                                                        />
                                                    )
                                                }}
                                            />
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

export default WorkerFormStepAvailability;