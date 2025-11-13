import { Controller, UseFormSetValue, UseFormWatch, Control, FormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TabSwitcher, { TabSwitcherOption } from "./TabSwitcher";
import React, { useEffect } from "react";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileForm, EmployeeProfileAvailabilityOptions, EmployeeProfileAvailabilityOption, DateRange } from "@shared/interfaces/EmployeeProfileI";
import DateRangeInput from "global/components/controls/DateRangeInput";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import DateInput from "global/components/controls/DateInput";

interface Props {
    control: Control<EmployeeProfileForm>;
    setValue: UseFormSetValue<EmployeeProfileForm>;
    watch: UseFormWatch<EmployeeProfileForm>;
    formState?: FormState<EmployeeProfileForm>;
}

const EmployeeProfileDates: React.FC<Props> = ({ control, setValue, watch, formState }) => {
    const availabilityOption = watch("availabilityOption");
    const availabilityDateRanges = watch("availabilityDateRanges") || [];

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
            const ranges = getDefaultDateRange()
            if (ranges) {
                setValue("availabilityDateRanges", [ranges]);
            }
        }
        if (availabilityOption === EmployeeProfileAvailabilityOptions.FROM_DATE) {
            if (availabilityDateRanges.length) {
                setValue("availabilityDateRanges", [{ 
                    start: availabilityDateRanges[0]?.start || new Date(),
                    id: availabilityDateRanges[0]?.id || DateRangeUtil.newId(availabilityDateRanges)
                 }]);
            } else {
                setValue("availabilityDateRanges", [{ 
                    start: new Date(),
                    id: DateRangeUtil.newId(availabilityDateRanges)
                 }]);
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
        console.log('newRanges', newRanges);
        setValue("availabilityDateRanges", newRanges);
    }

    const { t } = useTranslation();

    const required = FormValidator.required(t);

    const tabOptions: TabSwitcherOption[] = [
        // TODO translations
        {
            label: "Od zaraz",
            code: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
        {
            label: "Od dnia",
            code: EmployeeProfileAvailabilityOptions.FROM_DATE,
        },
        {
            label: "Wybrane terminy",
            code: EmployeeProfileAvailabilityOptions.DATE_RANGES,
        },
    ];

    const removeDateRange = (id?: number) => {
        const ranges = availabilityDateRanges?.filter((r, i) => r && r.id !== id);
        setValue("availabilityDateRanges", (ranges || []).filter(Boolean));
    }

    const rangesIds = (availabilityDateRanges || []).filter(Boolean).map(r => r.id);

    return (
        <>
            <div className="flex items-center justify-between mt-5">
                <h3 className="text-lg">Dostępność</h3>
            </div>

            <TabSwitcher
                options={tabOptions}
                value={availabilityOption}
                onChange={code => setValue("availabilityOption", code as EmployeeProfileAvailabilityOption)}
            />

            <div className="w-full flex mt-4">
                <div className="primary-text w-full">
                    {availabilityOption === EmployeeProfileAvailabilityOptions.ANYTIME && (
                        <div className="text-center mb-10">
                            Szukam pracy od zaraz
                        </div>
                    )}
                    {availabilityOption === EmployeeProfileAvailabilityOptions.FROM_DATE && (
                        <div className="text-center mb-10">
                            Szukam pracy od dnia:

                            <Controller
                                name={`availabilityDateRanges.0` as const}
                                control={control}
                                rules={required}
                                render={({ field }) => {
                                    // Extract string message for this specific range error (RHF stores errors by index/key)
                                    const fieldError = (formState?.errors?.availabilityDateRanges as any)?.[0];
                                    const errorMessage = fieldError?.message as string | undefined;
                                    return (
                                        <DateInput
                                            className="w-full mt-5"
                                            value={ field.value?.start || new Date() }
                                            onChange={(date) => {
                                                if (date) {
                                                    field.onChange({ ...field.value, start: date })
                                                }
                                            }}
                                            name={field.name}
                                            error={errorMessage? { message: errorMessage } : undefined}
                                        />
                                    )
                                }}
                            />
                        </div>
                    )}
                    {availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES && (
                        <div className="w-full">
                            <div className="mb-10 text-center">
                                Wybierz daty, w których jesteś dostępny/a do pracy
                            </div>
                            {availabilityDateRanges.map((dateRange, idx) => {

                                return (
                                    <div key={dateRange.id} className="flex gap-2 items-end mt-4">
                                        <Controller
                                            name={`availabilityDateRanges.${idx}` as const}
                                            control={control}
                                            rules={required}
                                            render={({ field }) => {
                                                // Extract string message for this specific range error (RHF stores errors by index/key)
                                                const fieldError = (formState?.errors?.availabilityDateRanges as any)?.[idx];
                                                const errorMessage = fieldError?.message as string | undefined;
                                                return (
                                                    <DateRangeInput
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
                                                mode={BtnModes.ERROR}
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
                                Add Date Range
                            </Button>
                        </div>
                    )}



                </div>
            </div>
        </>
    );
};

export default EmployeeProfileDates;
