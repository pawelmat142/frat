import Button from "global/components/controls/Button";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import React from "react";
import { DateRange, WorkerAvailabilityOptions, WorkerForm, WorkerI, WorkerLocationOptions } from "@shared/interfaces/WorkerProfileI";
import { toast } from "react-toastify";
import { WorkerService } from "employee/services/WorkerService";
import Loading from "global/components/Loading";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useUserContext } from "user/UserProvider";
import { useWorkerContext } from "employee/WorkerProvider";
import { useNavigate } from "react-router-dom";
import { DateRangeUtil } from "@shared/utils/DateRangeUtil";
import { Path } from "../../../path";
import { useWorkersSearch } from "../search/WorkersSearchProvider";
import WorkerFormStep1 from "./WorkerFormStep1";
import WorkerFormStep2 from "./WorkerFormStep2";
import { Utils } from "global/utils/utils";
import { useConfirm } from "global/providers/PopupProvider";
import FormWizard from "global/components/FormWizard/FormWizard";
import { GoogleMapService } from "global/services/GoogleMapService";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";
import WorkerFormStep3 from "./WorkerFormStep3";
import WorkerFormStep4 from "./WorkerFormStep4";
import { UserProviders } from "@shared/interfaces/UserI";
import { isOneOf } from "@shared/utils/util";

const LOCAL_STORAGE_KEY = 'employeeProfileFormDraft';

type StepKey = 'step1' | 'step2' | 'step3' | 'step4';

const STEPS_ORDER: StepKey[] = ['step1', 'step2', 'step3', 'step4'];

const WorkerFormView: React.FC = () => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState<boolean>(false);
    const userCtx = useUserContext();
    const workerCtx = useWorkerContext();
    const navigate = useNavigate();
    const profileCtx = useWorkersSearch();
    const isDevMode = Utils.isDevMode();
    const confirm = useConfirm();
    const globalCtx = useGlobalContext();

    const me = userCtx?.me;

    const [step, setStep] = React.useState<StepKey>(STEPS_ORDER[0]);
    const [geolocatedPosition, setGeolocatedPosition] = React.useState<GeocodedPosition | null>(null);

    const worker: WorkerI | null = workerCtx.worker || null;

    const formRef = useForm<WorkerForm>({
        defaultValues: {
            step1: {
                fullName: "",
                phoneNumber: { prefix: "+00", phoneNumber: "" },
                email: "",
                communicationLanguages: [""]
            },
            step2: {
                locationOption: WorkerLocationOptions.POSITION,
                countryCode: undefined,
                geocodedPosition: null,


            },
            step3: {
                availabilityOption: WorkerAvailabilityOptions.FROM_DATE,
                availabilityDateRanges: [],
                startDate: null,
            },
            step4: {
                experience: [],
                certificates: []
            }
        },
    });

    const initPosition = async (): Promise<GeocodedPosition | null> => {
        if (userCtx.position) {
            // Use backend geocoding to avoid API key restrictions
            const position = await GoogleMapService.reverseGeocodeViaBackend({
                lat: userCtx.position.lat,
                lng: userCtx.position.lng,
            });
            if (position) {
                setGeolocatedPosition(position);
                return position;
            }
        }
        return null;
    }

    const initFormWithUserData = async () => {
        if (!me) return;
        setLoading(true);
        const position = await initPosition();

        formRef.setValue("step1.fullName", me.displayName)

        if (isOneOf([UserProviders.EMAIL, UserProviders.GOOGLE], me.provider)) {
            formRef.setValue("step1.email", me.email)
        }
        
        if (me.avatarRef) {
            formRef.setValue("step1.avatarRef", me.avatarRef);
        }
        if (position) {
            const element = globalCtx.dics.languages?.elements.find(lang => lang.values.COUNTRY_CODE === position.country?.toLocaleLowerCase());

            if (element) {
                formRef.setValue("step1.phoneNumber.prefix", element.values.PHONE_PREFIX);
                formRef.setValue("step1.communicationLanguages", [element.code]);
                setPositionFormDataByLocation(position);
            }
        }
        setLoading(false);
    }

    const resetPositionFormData = async () => {
        const position = await initPosition();
        if (position) {
            setPositionFormDataByLocation(position);
        }
    }

    const getDictionaryElementByPosition = (position: GeocodedPosition) => {
        return globalCtx.dics.languages?.elements.find(lang => lang.values.COUNTRY_CODE === position.country?.toLocaleLowerCase());
    }

    const setPositionFormDataByLocation = (position: GeocodedPosition) => {
        const element = getDictionaryElementByPosition(position);
        if (element) {
            formRef.setValue("step2.countryCode", element.code);
            formRef.setValue("step2.geocodedPosition", position);
        }
    }


    React.useEffect(() => {
        // Load from localStorage if no employeeProfile exists
        if (!worker) {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);

            if (savedData) {
                try {
                    const parsedData: WorkerForm = JSON.parse(savedData);
                    formRef.reset(parsedData);
                } catch (error) {
                    console.error("Error loading form from localStorage:", error);
                }
            } else {
                initFormWithUserData();
            }
            return;
        }
        initFormFromProfile();
    }, [worker, formRef]);

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

        const geoPosition: GeocodedPosition | null = worker?.geocodedPosition || await initPosition();

        const availabilityDateRanges: DateRange[] = (worker.availabilityDateRanges || [])
            .map(r => DateRangeUtil.toDateRange(r))
            .filter((r): r is DateRange => r != null);

        formRef.reset({
            step1: {
                fullName: worker.fullName || "",
                phoneNumber: worker.phoneNumber || { prefix: "+48", phoneNumber: "" },
                email: worker.email || "",
                communicationLanguages: worker.communicationLanguages || [""],
                avatarRef: worker.avatarRef,
                bio: worker.bio || ''
            },
            step2: {
                locationOption: worker.locationOption || WorkerLocationOptions.POSITION,
                countryCode: worker.locationCountries?.[0],
                geocodedPosition: geoPosition,
                locationCountries: worker.locationCountries || [],
            },
            step3: {
                availabilityOption: worker.availabilityOption || WorkerAvailabilityOptions.ANYTIME,
                availabilityDateRanges: availabilityDateRanges,
                rangesOption: worker.rangesOption,
                startDate: worker.startDate || null,
            },
            step4: {
                // TODO
                experience: worker.categories || [],
                certificates: worker.certificates || []
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
            confirmText: 'common.confirm',
            cancelText: 'common.cancel'
        });
        if (!confirmed) return;


        const form = formRef.watch();
        if (worker) {
            await updateWorker(form);
            return;
        }
        try {
            setLoading(true);
            const result = await WorkerService.createWorker(form);
            workerCtx.initWorker();
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
            workerCtx.initWorker();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            toast.success(t("employeeProfile.form.submitSuccess"));
            navigate(-1)
        } catch (error) {
            console.error("Error updating employee profile:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDevFill = () => {
        formRef.setValue("step1.fullName", "Pawel Malek");
        formRef.setValue("step4.certificates", ["ONE"]);
        formRef.setValue("step4.experience", ["ONE", "TWO"]);
        formRef.setValue("step1.communicationLanguages", ["en", "pl"]);
    };

    if (loading) {
        return <Loading />;
    }

    const renderStepByKey = (stepKey: StepKey) => {
        switch (stepKey) {
            case 'step1':
                return <WorkerFormStep1 formRef={formRef} />;
            case 'step2':
                return <WorkerFormStep2 formRef={formRef} initPosition={resetPositionFormData} />;
            case 'step3':
                return <WorkerFormStep3 formRef={formRef} />;
            case 'step4':
                return <WorkerFormStep4 formRef={formRef} />;
            default:
                return null;
        }
    }

    return (
        <FormWizard
            localStorageKey={LOCAL_STORAGE_KEY}
            formRef={formRef}
            stepsOrder={STEPS_ORDER}
            currentStep={step}
            onFinalSubmit={onSubmit}
            onSelectStep={setStep}
        >
            {
                <>
                    {renderStepByKey(step)}
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
    );
}

export default WorkerFormView;
