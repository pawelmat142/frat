import Button from "global/components/controls/Button";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { DateRange, WORKER_FORM_STEPS_ORDER, WorkerAvailabilityOptions, WorkerForm, WorkerFormStep, WorkerFormSteps, WorkerLocationOptions, WorkerWithCertificates } from "@shared/interfaces/WorkerI";
import { toast } from "react-toastify";
import { WorkerService } from "employee/services/WorkerService";
import Loading from "global/components/Loading";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useUserContext } from "user/UserProvider";
import { useNavigate } from "react-router-dom";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { Path } from "../../../path";
import { useWorkersSearch } from "../search/WorkersSearchProvider";
import WorkerFormpersonalData from "./WorkerFormStepPersonalData";
import WorkerFormStepLocation from "./WorkerFormStepLocation";
import { Utils } from "global/utils/utils";
import { useConfirm } from "global/providers/PopupProvider";
import FormWizard from "global/components/FormWizard/FormWizard";
import { GoogleMapService } from "global/services/GoogleMapService";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";
import WorkerFormStepCertificates from "./WorkerFormStepCertificates";
import WorkerFormStepCareer from "./WorkerFormStepCareer";
import { UserProviders } from "@shared/interfaces/UserI";
import { isOneOf } from "@shared/utils/util";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import WorkerFormStepAvailability from "./WorkerFormStepAvailability";
import Header from "global/components/Header";

const LOCAL_STORAGE_KEY = 'employeeProfileFormDraft';

const WorkerFormView: React.FC = () => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState<boolean>(false);
    const userCtx = useUserContext();
    const navigate = useNavigate();
    const profileCtx = useWorkersSearch();
    const isDevMode = Utils.isDevMode();
    const confirm = useConfirm();
    const globalCtx = useGlobalContext();

    const me = userCtx?.me;

    const [step, setStep] = React.useState<WorkerFormStep>(WORKER_FORM_STEPS_ORDER[0]);

    useEffect(() => {
        globalCtx.hideFooter();
        return () => {
            globalCtx.showFooter();
        }
    }, [])

    const worker: WorkerWithCertificates | null = userCtx?.meCtx?.workerProfile || null;

    const formCtx = useForm<WorkerForm>({
        defaultValues: {
            currentStep: WORKER_FORM_STEPS_ORDER[0],
            personalData: {
                fullName: "",
                phoneNumber: { prefix: "+00", number: "" },
                email: "",
                communicationLanguages: [""]
            },
            career: {
                categories: [],
                careerStartDate: undefined,
                maxAltitude: undefined,
                readyToTravel: undefined,
            },
            location: {
                locationOption: WorkerLocationOptions.POSITION,
                countryCode: null,
                geocodedPosition: null,
            },
            availability: {
                availabilityOption: WorkerAvailabilityOptions.FROM_DATE,
                availabilityDateRanges: [],
                startDate: null,
            },
            certificates: {
                certificates: [],
                certificateDates: {}
            }
        },
    });

    const form = formCtx.watch();

    const getGeoPosition = async (): Promise<GeocodedPosition | null> => {
        if (userCtx.position) {
            // Use backend geocoding to avoid API key restrictions
            const position = await GoogleMapService.reverseGeocodeViaBackend({
                lat: userCtx.position.lat,
                lng: userCtx.position.lng,
            });
            if (position) {
                return position;
            }
        }
        return null;
    }

    const initFormWithUserData = async () => {
        if (!me) return;
        setLoading(true);
        const position = await getGeoPosition();

        formCtx.setValue("personalData.fullName", me.displayName)

        if (isOneOf([UserProviders.EMAIL, UserProviders.GOOGLE], me.provider)) {
            formCtx.setValue("personalData.email", me.email)
        }

        if (me.avatarRef) {
            formCtx.setValue("personalData.avatarRef", me.avatarRef);
        }
        if (position) {
            const element = DictionaryUtil.getElementByCountryCode(globalCtx.dics.languages!, position.country?.toLocaleLowerCase() || "");

            if (element) {
                formCtx.setValue("personalData.phoneNumber.prefix", element.values.PHONE_PREFIX);
                formCtx.setValue("personalData.communicationLanguages", [element.code]);
                setPositionFormDataByLocation(position);
            }
        }
        setLoading(false);
    }

    const resetPositionFormData = async () => {
        const position = await getGeoPosition();
        if (position) {
            setPositionFormDataByLocation(position);
        }
    }

    const getDictionaryElementByPosition = (position: GeocodedPosition) => {
        return DictionaryUtil.getElementByCountryCode(globalCtx.dics.languages!, position.country?.toLocaleLowerCase() || "");
    }

    const setPositionFormDataByLocation = (position: GeocodedPosition) => {
        const element = getDictionaryElementByPosition(position);
        if (element) {
            formCtx.setValue("location.countryCode", element.code);
            formCtx.setValue("location.geocodedPosition", position);
        }
    }


    useEffect(() => {
        // Load from localStorage if no employeeProfile exists
        if (!worker) {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);

            if (savedData) {
                try {
                    const parsedData: WorkerForm = JSON.parse(savedData);
                    if (!parsedData?.currentStep) {
                        parsedData.currentStep = WORKER_FORM_STEPS_ORDER[0];
                    }
                    formCtx.reset(parsedData);
                } catch (error) {
                    console.error("Error loading form from localStorage:", error);
                }
            } else {
                initFormWithUserData();
            }
            return;
        }
        initFormFromProfile();
    }, [worker, formCtx]);

    const initFormFromProfile = async () => {
        if (!worker) return;
        // Load from employeeProfile if it exists
        let locationDistancePosition: any = undefined;
        if (worker.point && Array.isArray(worker.point.coordinates)) {
            locationDistancePosition = {
                lat: worker.point.coordinates[1],
                lng: worker.point.coordinates[0],
            };
        }

        const geoPosition: GeocodedPosition | null = worker?.geocodedPosition || await getGeoPosition();

        const availabilityDateRanges: DateRange[] = (worker.availabilityDateRanges || [])
            .map(r => DateRangeUtil.toDateRange(r))
            .filter((r): r is DateRange => r != null);

        formCtx.reset({
            personalData: {
                fullName: worker.fullName || "",
                phoneNumber: worker.phoneNumber || { prefix: "+48", number: "" },
                email: worker.email || "",
                communicationLanguages: worker.communicationLanguages || [""],
                avatarRef: worker.avatarRef,
            },
            location: {
                locationOption: worker.locationOption || WorkerLocationOptions.POSITION,
                countryCode: worker.locationCountries?.[0],
                geocodedPosition: geoPosition,
                locationCountries: worker.locationCountries || [],
            },
            availability: {
                availabilityOption: worker.availabilityOption || WorkerAvailabilityOptions.ANYTIME,
                availabilityDateRanges: availabilityDateRanges,
                rangesOption: worker.rangesOption,
                startDate: worker.startDate || null,
            },
            career: {
                categories: worker.categories || [],
                careerStartDate: worker.careerStartDate,
                maxAltitude: worker.maxAltitude,
                readyToTravel: worker.readyToTravel,
                bio: worker.bio || ''
            },
            certificates: {
                certificates: worker.certificates || [],
                certificateDates: worker.certs?.reduce((acc, cert) => {
                    acc[cert.code] = cert.validityDate;
                    return acc;
                }, {} as Record<string, string>) || {},
            }
        });
    }


    const onSubmit = async (validateFn: () => Promise<boolean>) => {
        const valid = await validateFn();
        if (!valid) {
            toast.error(t("employeeProfile.form.validationError"));
            return;
        }

        const confirmed = await confirm({
            title: 'employeeProfile.form.confirmTitle',
            message: 'employeeProfile.form.confirmSubmit',
        });
        if (!confirmed) return;


        const form = formCtx.watch();
        if (worker) {
            await updateWorker(form);
            return;
        }
        try {
            setLoading(true);
            const result = await WorkerService.createWorker(form);
            userCtx.initWorker();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            toast.success(t("employeeProfile.form.submitSuccess"));
            navigate(Path.getWorkerProfilePath(`${result.displayName}`), { replace: true });
        } catch (error) {
            console.error("Error creating employee profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateWorker = async (form: WorkerForm) => {
        try {
            setLoading(true);
            const result = await WorkerService.updateWorker(form);
            profileCtx.updateOneProfileInResults(result);
            userCtx.initWorker();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            toast.success(t("employeeProfile.form.submitSuccess"));
            navigate(Path.getWorkerProfilePath(result.displayName), { replace: true });
        } catch (error) {
            console.error("Error updating employee profile:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDevFill = () => {
        formCtx.setValue("personalData.fullName", "Pawel Malek");
        formCtx.setValue("certificates.certificates", ["ONE"]);
        formCtx.setValue("personalData.communicationLanguages", ["en", "pl"]);
    };

    if (loading) {
        return <Loading />;
    }

    const renderStepByKey = (stepKey: WorkerFormStep) => {
        switch (stepKey) {
            case WorkerFormSteps.PERSONAL_DATA:
                return <WorkerFormpersonalData formRef={formCtx} />;
            case WorkerFormSteps.CAREER:
                return <WorkerFormStepCareer formRef={formCtx} />;
            case WorkerFormSteps.LOCATION:
                return <WorkerFormStepLocation formRef={formCtx} initPosition={resetPositionFormData} />;
            case WorkerFormSteps.AVAILABILITY:
                return <WorkerFormStepAvailability formRef={formCtx} />;
            case WorkerFormSteps.CERTIFICATES:
                return <WorkerFormStepCertificates formRef={formCtx} />;
            default:
                return null;
        }
    }

    const validateStep = async (step: WorkerFormStep): Promise<boolean> => {
        const result = await formCtx.trigger(step);
        if (!result) {
            toast.error(t("employeeProfile.form.validationError"));
        }
        return result;
    }

    const validateCurrentStep = async (): Promise<boolean> => {
        return validateStep(form.currentStep);
    }

    const selectStep = async (targetStep: WorkerFormStep) => {
        const targetIndex = WORKER_FORM_STEPS_ORDER.indexOf(targetStep);
        const currentIndex = WORKER_FORM_STEPS_ORDER.indexOf(form.currentStep);
        if (targetIndex < currentIndex) {
            // Going back - no validation needed
            setCurrentStep(targetStep);
        } else if (targetIndex > currentIndex) {
            // Going forward - validate current step
            const isValid = await validateCurrentStep();
            if (isValid) {
                setCurrentStep(targetStep);
                saveFormToLocalStorage(formCtx.watch());
            }
        }
    }

    const saveFormToLocalStorage = (form: WorkerForm) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
    }

    const setCurrentStep = (step: WorkerFormStep) => {
        formCtx.setValue("currentStep", step);
    }

    return (<>
        <Header title={t("employeeProfile.form.title")}></Header>
        <FormWizard
            localStorageKey={LOCAL_STORAGE_KEY}
            formRef={formCtx}
            stepsOrder={WORKER_FORM_STEPS_ORDER}
            currentStep={form.currentStep}
            onFinalSubmit={onSubmit}
            onSelectStep={selectStep}
        >
            {
                <>
                    {renderStepByKey(form.currentStep)}

                    {isDevMode && (
                        <div className="flex items-center justify-end">
                            <Button onClick={handleDevFill} size={BtnSizes.SMALL} mode={BtnModes.PRIMARY_TXT}>
                                DEV FILL
                            </Button>
                        </div>
                    )}
                </>
            }
        </FormWizard>
    </>
    );
}

export default WorkerFormView;
