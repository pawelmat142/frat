import React, { useEffect } from "react";
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
import DateInputViewSelector from "global/components/callendar/DateInputViewSelector";
import DateRangeInputViewSelector from "global/components/callendar/DateRangeInputViewSelector";
import { DateUtil } from "@shared/utils/DateUtil";

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

    const getDefaultDateRange = (): DateRange => {
        return {
            start: DateUtil.toLocalDateString(new Date()),
            id: DateRangeUtil.newId(availabilityDateRanges)
        }
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
        const ranges = availabilityDateRanges?.filter((r, i) => r && r.id !== id);
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

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.step3.title")}
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
                                        name={`availability.startDate`}
                                        control={control}
                                        rules={startDateRequired}
                                        render={({ field }) => {
                                            const fieldError = (formState?.errors?.availability?.availabilityDateRanges as any)?.[0];
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

                                {availabilityDateRanges.map((dateRange, idx) => {
                                    return (
                                        <div key={dateRange?.id ?? idx} className="flex gap-2 items-end mt-4">
                                            <Controller
                                                name={`availability.availabilityDateRanges.${idx}` as const}
                                                control={control}
                                                rules={required}
                                                render={({ field }) => {
                                                    // Extract string message for this specific range error (RHF stores errors by index/key)
                                                    const fieldError = (formState?.errors?.availability?.availabilityDateRanges as any)?.[idx];
                                                    const errorMessage = fieldError?.message as string | undefined;
                                                    return (
                                                        <DateRangeInputViewSelector
                                                            label={t("employeeProfile.form.availabilityOption.DATE_RANGES.label") + (availabilityDateRanges.length ? ` #${idx + 1}` : "") + ` (${t(`employeeProfile.form.rangesOption.${rangesOption}.tab`)})`}
                                                            className="w-full"
                                                            value={field.value || getDefaultDateRange()}
                                                            onChange={(dateRange) => {
                                                                field.onChange(dateRange)
                                                            }}
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

export default WorkerFormStepAvailability;