import { Controller, UseFormSetValue, UseFormWatch, Control, FormState } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TabSwitcher, { TabSwitcherOption } from "./TabSwitcher";
import React, { useEffect } from "react";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileForm, EmployeeProfileAvailabilityOptions, EmployeeProfileAvailabilityOption } from "@shared/interfaces/EmployeeProfileI";
import DateRangeInput from "global/components/controls/DateRangeInput";

interface Props {
    control: Control<EmployeeProfileForm>;
    setValue: UseFormSetValue<EmployeeProfileForm>;
    watch: UseFormWatch<EmployeeProfileForm>;
    formState?: FormState<EmployeeProfileForm>;
}

const EmployeeProfileDates: React.FC<Props> = ({ control, setValue, watch, formState }) => {
    const availabilityOption = watch("availabilityOption");
    const availabilityDateRanges = watch("availabilityDateRanges") || [];

    const getDefaultDateRange = () => ({
        start: new Date().toISOString(),
        end: new Date().toISOString(),
    });

    useEffect(() => {
        if (
            availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES &&
            (!availabilityDateRanges || availabilityDateRanges.length === 0)
        ) {
            setValue("availabilityDateRanges", [getDefaultDateRange()]);
        }
    }, [availabilityOption]);

    const { t } = useTranslation();

    const required = FormValidator.required(t);

    const tabOptions: TabSwitcherOption[] = [
        {
            label: "Od zaraz",
            code: EmployeeProfileAvailabilityOptions.ANYTIME,
        },
        {
            label: "Wybrane terminy",
            code: EmployeeProfileAvailabilityOptions.DATE_RANGES,
        },
    ];


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
                    {availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES && (
                        <div className="w-full">
                            <div className="mb-10 text-center">
                                Wybierz daty, w których jesteś dostępny/a do pracy
                            </div>
                            {availabilityDateRanges.map((lang, idx) => (
                                <Controller
                                    key={idx}
                                    name={`availabilityDateRanges.${idx}` as const}
                                    control={control}
                                    rules={required}
                                    render={({ field }) => (
                                        <DateRangeInput
                                            value={field.value || getDefaultDateRange()}
                                            onChange={(dateRange) => field.onChange(dateRange || null)}
                                            name={field.name}
                                        />
                                    )}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default EmployeeProfileDates;
