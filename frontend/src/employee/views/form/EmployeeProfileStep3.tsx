import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TabSwitcher, { TabSwitcherOption } from "../../components/TabSwitcher";
import { FormValidator } from "global/FormValidator";
import { EmployeeProfileLocationOptions, EmployeeProfileLocationOption, EmployeeProfileForm } from "@shared/interfaces/EmployeeProfileI";
import DictionarySelector from "global/components/selector/DictionarySelector";
import FloatingInput from "global/components/controls/FloatingInput";
import PositionSelector from "global/components/selector/position/PositionSelector";
import { useUserContext } from "user/UserProvider";
import { Position } from "@shared/interfaces/MapsInterfaces";

interface Props {
    formRef: UseFormReturn<EmployeeProfileForm>;
}

const EmployeeProfileStep3: React.FC<Props> = ({ formRef }) => {
    const { control, setValue, watch, formState } = formRef;
    const { t } = useTranslation();
    
    const userCtx = useUserContext();

    const preparePosition = (): Position => {
        return userCtx.position || { lat: 52.2297, lng: 21.0122 };//domyslnie warszawa
    }
    // --- EmployeeLocationSection logic inlined below ---
    const locationOption = watch("step3.locationOption");
    const required = FormValidator.required(t);
    const tabOptions: TabSwitcherOption[] = [
        {
            label: t(`employeeProfile.form.locationOption.${EmployeeProfileLocationOptions.POSITION}.tab`),
            code: EmployeeProfileLocationOptions.POSITION,
        },
        {
            label: t(`employeeProfile.form.locationOption.${EmployeeProfileLocationOptions.SELECTED_COUNTRIES}.tab`),
            code: EmployeeProfileLocationOptions.SELECTED_COUNTRIES,
        },
        {
            label: t(`employeeProfile.form.locationOption.${EmployeeProfileLocationOptions.ALL_EUROPE}.tab`),
            code: EmployeeProfileLocationOptions.ALL_EUROPE,
        },
    ];

    const msgClass = "secondary-text mb-5"

    return (
        <>
            <h3 className="form-subheader">
                {t("employeeProfile.form.step3.title")}
            </h3>

            <div className="flex flex-col gap-5 md:gap-5 mt-5">
                <TabSwitcher
                    options={tabOptions}
                    value={locationOption}
                    onChange={code => setValue("step3.locationOption", code as EmployeeProfileLocationOption)}
                />

                <div className="w-full flex mt-4">
                    <div className="primary-text w-full">
                        {locationOption === EmployeeProfileLocationOptions.ALL_EUROPE && (
                            <div className={msgClass}>
                                {t("employeeProfile.form.locationOption.ALL_EUROPE.msg")}
                            </div>
                        )}
                        {locationOption === EmployeeProfileLocationOptions.SELECTED_COUNTRIES && (
                            <div className="w-full">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.locationOption.SELECTED_COUNTRIES.msg")}
                                </div>
                                <Controller
                                    name="step3.locationCountries"
                                    control={control}
                                    rules={required}
                                    render={({ field }) => (
                                        <DictionarySelector
                                            type="multi"
                                            className="w-full"
                                            valueInput={field.value ?? []}
                                            onSelectMulti={items => field.onChange(items.map(i => String(i)))}
                                            label={t("employeeProfile.form.locationCountries")}
                                            code="LANGUAGES"
                                            elementLabelTranslationKey="COUNTRY_NAME"
                                            fullWidth
                                            required
                                            error={formState?.errors.step3?.locationCountries}
                                        />
                                    )}
                                />
                            </div>
                        )}
                        {locationOption === EmployeeProfileLocationOptions.POSITION && (
                            <div className="flex flex-col gap-3">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.locationOption.DISTANCE.msg")}
                                </div>
                                <Controller
                                    name="step3.geocodedPosition"
                                    control={control}
                                    rules={required}
                                    render={({ field }) => (
                                        <PositionSelector
                                            label={t("employeeProfile.form.location")}
                                            name="locationDistance"
                                            className="w-full"
                                            value={field.value}
                                            initialPosition={preparePosition()}
                                            required
                                            onChange={field.onChange}
                                            error={formState?.errors.step3?.geocodedPosition}
                                        />
                                    )}
                                />
                                <Controller
                                    name="step3.locationDistanceRadius"
                                    rules={required}
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingInput
                                            type="number"
                                            {...field}
                                            value={field.value ?? null}
                                            label={t("employeeProfile.form.radius")}
                                            fullWidth
                                            required
                                            error={formState?.errors.step3?.locationDistanceRadius}
                                            icon={
                                                <div>[km]</div>
                                            }
                                        />
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EmployeeProfileStep3;
