import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormValidator } from "global/FormValidator";
import { WorkerForm, WorkerLocationOption, WorkerLocationOptions } from "@shared/interfaces/WorkerI";
import TabSwitcher, { TabSwitcherOption } from "employee/components/TabSwitcher";
import DictionarySelector from "global/components/selector/DictionarySelector";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import { useUserContext } from "user/UserProvider";
import { toast } from "react-toastify";
import CountryAndLocationSelector from "global/components/controls/CountryAndLocationSelector";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
    formRef: UseFormReturn<WorkerForm>;
    initPosition?: () => void;
}

const WorkerFormStepLocation: React.FC<Props> = ({ formRef, initPosition }) => {
    const { control, formState, setValue, watch, register } = formRef;
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const required = FormValidator.required(t);

    register("location.countryCode", required);
    register("location.geocodedPosition", required);

    const locationOption = watch("location.locationOption");
    const tabTransitionDirection = React.useRef<1 | -1>(1);

    const tabOptions: TabSwitcherOption[] = [
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.POSITION}.tab`),
            code: WorkerLocationOptions.POSITION,
        },
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.SELECTED_COUNTRIES}.tab`),
            code: WorkerLocationOptions.SELECTED_COUNTRIES,
        },
        {
            label: t(`employeeProfile.form.locationOption.${WorkerLocationOptions.ALL_EUROPE}.tab`),
            code: WorkerLocationOptions.ALL_EUROPE,
        },
    ];
    const msgClass = "secondary-text mb-5"

    const resetLocation = () => {
        if (!userCtx.position) {
            toast.error(t("employeeProfile.form.noLocationAccess"));
            return;
        }
        if (initPosition) {
            initPosition();
        } else {
            setValue("location.countryCode", undefined);
            setValue("location.geocodedPosition", undefined);
        }
    }

    const handleLocationOptionChange = (code: string) => {
        const currentIndex = tabOptions.findIndex(option => option.code === locationOption);
        const nextIndex = tabOptions.findIndex(option => option.code === code);

        if (currentIndex !== -1 && nextIndex !== -1 && currentIndex !== nextIndex) {
            tabTransitionDirection.current = nextIndex > currentIndex ? 1 : -1;
        }

        setValue("location.locationOption", code as WorkerLocationOption);
    };

    return (
        <>
            <h2 className="form-subheader">{t("employeeProfile.form.location.title")}</h2>

            <p className={`${msgClass} s-font mt-2`}>
                {t("employeeProfile.form.location.info")}
            </p>

            <CountryAndLocationSelector
                value={{
                    locationCountry: watch("location.countryCode") || null,
                    geocodedPosition: watch("location.geocodedPosition") || null,
                }}
                onChange={(val) => {
                    setValue("location.countryCode", val.locationCountry || undefined, { shouldValidate: true });
                    setValue("location.geocodedPosition", val.geocodedPosition || undefined, { shouldValidate: true });
                }}
                config={{
                    locationOption: 'map',
                }}
                errors={{
                    locationCountry: formState.errors.location?.countryCode,
                    geocodedPosition: formState.errors.location?.geocodedPosition as { message?: string } | undefined,
                }}
            ></CountryAndLocationSelector>

            <div>
                <Button fullWidth mode={BtnModes.PRIMARY_TXT} onClick={resetLocation}>{t("employeeProfile.form.resetLocation")}</Button>
            </div>


            <h2 className="form-subheader mt-10">{t("employeeProfile.form.location.workArea.title")}</h2>
            <p className="secondary-text s-font -mt-3 mb-5">
                {t("employeeProfile.form.location.workArea.info")}
            </p>

            <div className="flex flex-col gap-5 md:gap-8">
                <TabSwitcher
                    options={tabOptions}
                    value={locationOption}
                    onChange={handleLocationOptionChange}
                />

                <div className="w-full flex overflow-x-hidden">
                    <AnimatePresence mode="wait" custom={tabTransitionDirection.current} initial={false}>
                    <motion.div
                        key={locationOption}
                        custom={tabTransitionDirection.current}
                        variants={{
                            enter: (direction: number) => ({ x: 24 * direction, opacity: 0 }),
                            center: { x: 0, opacity: 1 },
                            exit: (direction: number) => ({ x: -24 * direction, opacity: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="primary-text w-full"
                    >
                        {locationOption === WorkerLocationOptions.ALL_EUROPE && (
                            <div className={msgClass}>
                                {t("employeeProfile.form.locationOption.ALL_EUROPE.msg")}
                            </div>
                        )}
                        {locationOption === WorkerLocationOptions.SELECTED_COUNTRIES && (
                            <div className="w-full">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.locationOption.SELECTED_COUNTRIES.msg")}
                                </div>
                                <Controller
                                    name="location.locationCountries"
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
                                            error={formState?.errors.location?.locationCountries}
                                        />
                                    )}
                                />
                            </div>
                        )}
                        {locationOption === WorkerLocationOptions.POSITION && (
                            <div className="flex flex-col gap-3">
                                <div className={msgClass}>
                                    {t("employeeProfile.form.locationOption.POSITION.msg")}
                                </div>
                            </div>
                        )}
                    </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex flex-col gap-5 md:gap-8">



            </div>
        </>
    );
};

export default WorkerFormStepLocation;
