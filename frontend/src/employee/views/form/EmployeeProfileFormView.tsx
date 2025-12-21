import Button from "global/components/controls/Button";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import React from "react";
import { DateRange, EmployeeProfileAvailabilityOptions, EmployeeProfileForm, EmployeeProfileLocationOptions } from "@shared/interfaces/EmployeeProfileI";
import { toast } from "react-toastify";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import Loading from "global/components/Loading";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DoneIcon from '@mui/icons-material/Done';
import { useUserContext } from "user/UserProvider";
import { useNavigate } from "react-router-dom";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { Path } from "../../../path";
import { useEmployeeSearch } from "../search/EmployeeSearchProvider";
import EmployeeProfileStep1 from "./EmployeeProfileStep1";
import EmployeeProfileStep2 from "./EmployeeProfileStep2";
import EmployeeProfileStep3 from "./EmployeeProfileStep3";
import EmployeeProfileStep4 from "./EmployeeProfileStep4";
import { Utils } from "global/utils/utils";
import { useConfirm } from "global/providers/PopupProvider";

const LOCAL_STORAGE_KEY = 'employeeProfileFormDraft';

type StepKey = 'step1' | 'step2' | 'step3' | 'step4';

const STEPS_ORDER: StepKey[] = ['step1', 'step2', 'step3', 'step4'];

const EmployeeProfileFormView: React.FC = () => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState<boolean>(false);
    const [currentStep, setCurrentStep] = React.useState<StepKey>('step1');
    const { employeeProfile, initEmployeeProfile } = useUserContext();
    const navigate = useNavigate();
    const profileCtx = useEmployeeSearch();
    const isDevMode = Utils.isDevMode();
    const confirm = useConfirm();

    const { control, handleSubmit, watch, setValue, reset, formState, trigger } = useForm<EmployeeProfileForm>({
        defaultValues: {
            step1: {
                firstName: "",
                lastName: "",
                communicationLanguages: [""]
            },
            step2: {
                skills: [],
                certificates: []
            },
            step3: {
                locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,
                locationCountries: [],
                locationDistancePosition: undefined,
                locationDistanceRadius: NaN
            },
            step4: {
                availabilityOption: EmployeeProfileAvailabilityOptions.ANYTIME,
                availabilityDateRanges: []
            }
        },
    });

    React.useEffect(() => {
        // Load from localStorage if no employeeProfile exists
        if (!employeeProfile) {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);

            if (savedData) {
                try {
                    const parsedData: EmployeeProfileForm = JSON.parse(savedData);
                    reset(parsedData);
                } catch (error) {
                    console.error("Error loading form from localStorage:", error);
                }
            }
            return;
        }

        // Load from employeeProfile if it exists
        let locationDistancePosition: any = undefined;
        if (employeeProfile.point && Array.isArray(employeeProfile.point.coordinates)) {
            locationDistancePosition = {
                lat: employeeProfile.point.coordinates[1],
                lng: employeeProfile.point.coordinates[0],
                address: employeeProfile.address
            };
        }
        const availabilityDateRanges: DateRange[] = (employeeProfile.availabilityDateRanges || [])
            .map(r => DateRangeUtil.toDateRange(r))
            .filter((r): r is DateRange => r != null);

        reset({
            step1: {
                firstName: employeeProfile.firstName || "",
                lastName: employeeProfile.lastName || "",
                // residenceCountry: employeeProfile.residenceCountry || "",
                communicationLanguages: employeeProfile.communicationLanguages || [""]
            },
            step2: {
                skills: employeeProfile.skills || [],
                certificates: employeeProfile.certificates || []
            },
            step3: {
                locationOption: employeeProfile.locationOption || EmployeeProfileLocationOptions.ALL_EUROPE,
                locationCountries: employeeProfile.locationCountries || [],
                locationDistancePosition,
                locationDistanceRadius: employeeProfile.pointRadius ?? NaN
            },
            step4: {
                availabilityOption: employeeProfile.availabilityOption || EmployeeProfileAvailabilityOptions.ANYTIME,
                availabilityDateRanges: availabilityDateRanges
            }
        });
    }, [employeeProfile, reset, trigger]);

    const onSubmit = async () => {
        const confirmed = await confirm({
            title: 'employeeProfile.form.confirmTitle',
            message: 'employeeProfile.form.confirmSubmit',
            confirmText: 'common.confirm',
            cancelText: 'common.cancel'
        });
        if (!confirmed) return;

        const valid = await validateCurrentStep();
        if (!valid) {
            toast.error(t("employeeProfile.form.validationError"));
            return;
        }
        const form = watch();
        if (employeeProfile) {
            await updateEmployeeProfile(form);
            return;
        }
        try {
            setLoading(true);
            const result = await EmployeeProfileService.createEmployeeProfile(form);
            initEmployeeProfile();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            toast.success(t("employeeProfile.form.submitSuccess"));
            navigate(Path.getEmployeeProfilePath(`${result.employeeProfileId}`));
        } catch (error) {
            console.error("Error creating employee profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateEmployeeProfile = async (form: EmployeeProfileForm) => {
        try {
            setLoading(true);
            const result = await EmployeeProfileService.updateEmployeeProfile(form);
            profileCtx.updateOneProfileInResults(result);
            initEmployeeProfile();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            toast.success(t("employeeProfile.form.submitSuccess"));
            navigate(-1);
        } catch (error) {
            console.error("Error updating employee profile:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDevFill = () => {
        setValue("step1.firstName", "Pawel");
        setValue("step1.lastName", "Mat");
        setValue("step2.skills", ["ONE", "TWO"]);
        setValue("step2.certificates", ["ONE"]);
        setValue("step1.communicationLanguages", ["en", "pl"]);
    };

    if (loading) {
        return <Loading />;
    }

    const renderStep = () => {
        switch (currentStep) {
            case 'step1':
                return (
                    <EmployeeProfileStep1
                        control={control}
                        setValue={setValue}
                        watch={watch}
                        formState={formState}
                    />
                );
            case 'step2':
                return (
                    <EmployeeProfileStep2
                        control={control}
                        formState={formState}
                    />
                );
            case 'step3':
                return (
                    <EmployeeProfileStep3
                        control={control}
                        setValue={setValue}
                        watch={watch}
                        formState={formState}
                    />
                );
            case 'step4':
                return (
                    <EmployeeProfileStep4
                        control={control}
                        setValue={setValue}
                        watch={watch}
                        formState={formState}
                    />
                );
            default:
                return null;
        }
    };

    const handleNext = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            saveFormToLocalStorage();
            const currentIndex = STEPS_ORDER.indexOf(currentStep);
            if (currentIndex < STEPS_ORDER.length - 1) {
                setCurrentStep(STEPS_ORDER[currentIndex + 1]);
            }
        }
    };

    const validateCurrentStep = async (): Promise<boolean> => {
        return validateStep(currentStep);
    }

    const validateStep = async (step: StepKey): Promise<boolean> => {
        const result = await trigger(step);
        if (!result) {
            toast.error(t("employeeProfile.form.validationError"));
        }
        return result;
    }

    const saveFormToLocalStorage = () => {
        const formData = watch();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    }

    const handlePrev = () => {
        saveFormToLocalStorage();
        const currentIndex = STEPS_ORDER.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(STEPS_ORDER[currentIndex - 1]);
        }
    };

    const selectStep = async (targetStep: StepKey) => {
        const targetIndex = STEPS_ORDER.indexOf(targetStep);
        const currentIndex = STEPS_ORDER.indexOf(currentStep);

        if (targetIndex < currentIndex) {
            // Going back - no validation needed
            setCurrentStep(targetStep);
        } else if (targetIndex > currentIndex) {
            // Going forward - validate current step
            const isValid = await validateCurrentStep();
            if (isValid) {
                saveFormToLocalStorage();
                setCurrentStep(targetStep);
            }
        }
    }

    return (
        <div className="form-view relative">
            <form
                onSubmit={handleSubmit(() => { }, errors => {
                    console.log("Form errors", errors);
                    toast.error(t("employeeProfile.form.submitError"));
                })}
                noValidate
            >
                <div className="form-wizard-top-wrapper">
                    <div className="form-wizard-top">
                        {t(`employeeProfile.form.${currentStep}.label`)}

                    </div>
                </div>

                {renderStep()}


                {isDevMode && (
                    <div className="flex items-center justify-end">
                        <Button onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT}>
                            DEV FILL
                        </Button>
                    </div>
                )}
            </form>

            <div className="form-wizard-buttons-wrapper">
                <div className="form-wizard-buttons">
                    <Button
                        type="button"
                        onClick={handlePrev}
                        size={BtnSizes.LARGE}
                        mode={BtnModes.SECONDARY_TXT}
                        disabled={currentStep === 'step1'}
                        className="flex-1"
                        aria-label={t("common.previous")}
                    >
                        <ArrowBackIosNewIcon />
                    </Button>

                    <div className="wizard-stepper">

                        {STEPS_ORDER.map((step) => (
                            <Button
                                onClick={() => {
                                    if (currentStep === step || STEPS_ORDER.indexOf(step) > STEPS_ORDER.indexOf(currentStep)) {
                                        return
                                    }
                                    selectStep(step)
                                }}
                                key={step}
                                type="button"
                                mode={currentStep === step ? BtnModes.PRIMARY_TXT : BtnModes.SECONDARY_TXT}
                                size={BtnSizes.SMALL}
                                disabled={
                                    STEPS_ORDER.indexOf(step) > STEPS_ORDER.indexOf(currentStep)
                                }
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <circle cx="6" cy="6" r="5" fill={currentStep === step ? 'var(--primary-color, #2563eb)' : '#e5e7eb'} />
                                </svg>
                            </Button>
                        ))}

                    </div>

                    {currentStep !== 'step4' ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            size={BtnSizes.LARGE}
                            mode={BtnModes.PRIMARY_TXT}
                            className="flex-1"
                            aria-label={t("common.next")}
                        >
                            <ArrowForwardIosIcon />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => {
                                onSubmit()
                            }}
                            size={BtnSizes.LARGE}
                            mode={BtnModes.PRIMARY_TXT}
                            className="flex-1 font-bold"
                            aria-label={t("common.save")}
                        >
                            <DoneIcon sx={{ fontSize: 22, transform: 'scale(1.6)' }} />
                        </Button>
                    )}

                </div>

            </div>
        </div>
    );
}

export default EmployeeProfileFormView;
