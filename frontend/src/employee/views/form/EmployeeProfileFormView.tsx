import Button from "global/components/controls/Button";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import React from "react";
import { DateRange, EmployeeProfileAvailabilityOptions, EmployeeProfileForm, EmployeeProfileI, EmployeeProfileLocationOptions } from "@shared/interfaces/EmployeeProfileI";
import { toast } from "react-toastify";
import { EmployeeProfileService } from "employee/services/EmployeeProfileService";
import Loading from "global/components/Loading";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
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
import FormWizard from "global/components/FormWizard/FormWizard";
import { useAuthContext } from "auth/AuthProvider";
import { GoogleMapService } from "global/services/GoogleMapService";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { GeocodedPosition } from "@shared/interfaces/MapsInterfaces";

const LOCAL_STORAGE_KEY = 'employeeProfileFormDraft';

type StepKey = 'step1' | 'step2' | 'step3' | 'step4';

const STEPS_ORDER: StepKey[] = ['step1', 'step2', 'step3', 'step4'];

const EmployeeProfileFormView: React.FC = () => {

    const { t } = useTranslation();
    const [loading, setLoading] = React.useState<boolean>(false);
    const userCtx = useUserContext();
    const navigate = useNavigate();
    const profileCtx = useEmployeeSearch();
    const isDevMode = Utils.isDevMode();
    const confirm = useConfirm();
    const { me } = useAuthContext();
    const globalCtx = useGlobalContext();

    const [step, setStep] = React.useState<StepKey>(STEPS_ORDER[0]);
    const [geolocatedPosition, setGeolocatedPosition] = React.useState<GeocodedPosition | null>(null);

    const employeeProfile: EmployeeProfileI | null = userCtx.employeeProfile || null;

    const formRef = useForm<EmployeeProfileForm>({
        defaultValues: {
            step1: {
                fullName: "",
                phoneNumber: { prefix: "+00", phoneNumber: "" },
                email: "",
                communicationLanguages: [""]
            },
            step2: {
                locationOption: EmployeeProfileLocationOptions.POSITION,
                countryCode: undefined,
                geocodedPosition: null,

                // TODO remove:
                skills: [],
                certificates: []
            },
            step3: {
                locationOption: EmployeeProfileLocationOptions.ALL_EUROPE,
                locationCountries: [],
                geocodedPosition: undefined,
                locationDistanceRadius: NaN
            },
            step4: {
                availabilityOption: EmployeeProfileAvailabilityOptions.ANYTIME,
                availabilityDateRanges: []
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
        formRef.setValue("step1.email", me.email)
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
        if (!employeeProfile) {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);

            if (savedData) {
                try {
                    const parsedData: EmployeeProfileForm = JSON.parse(savedData);
                    formRef.reset(parsedData);
                } catch (error) {
                    console.error("Error loading form from localStorage:", error);
                }
            } else {
                initFormWithUserData();
            }
            return;
        }

        // Load from employeeProfile if it exists
        let locationDistancePosition: any = undefined;
        if (employeeProfile.point && Array.isArray(employeeProfile.point.coordinates)) {
            locationDistancePosition = {
                lat: employeeProfile.point.coordinates[1],
                lng: employeeProfile.point.coordinates[0],
            };
        }
        const availabilityDateRanges: DateRange[] = (employeeProfile.availabilityDateRanges || [])
            .map(r => DateRangeUtil.toDateRange(r))
            .filter((r): r is DateRange => r != null);

        formRef.reset({
            step1: {
                fullName: employeeProfile.fullName || "",
                phoneNumber: employeeProfile.phoneNumber || { prefix: "+48", phoneNumber: "" },
                email: employeeProfile.email || "",
                communicationLanguages: employeeProfile.communicationLanguages || [""],
                avatarRef: employeeProfile.avatarRef,
                bio: employeeProfile.bio || ''
            },
            step2: {
                countryCode: undefined,
                geocodedPosition: {
                    lat: locationDistancePosition?.lat || NaN,
                    lng: locationDistancePosition?.lng || NaN,
                    street: employeeProfile.street || '',
                    city: employeeProfile.city || '',
                    district: employeeProfile.district || '',
                    state: employeeProfile.state || '',
                    postcode: employeeProfile.postcode || '',
                    fullAddress: employeeProfile.fullAddress || '',
                },
                skills: employeeProfile.skills || [],
                certificates: employeeProfile.certificates || []
            },
            step3: {
                locationOption: employeeProfile.locationOption || EmployeeProfileLocationOptions.POSITION,
                locationCountries: employeeProfile.locationCountries || [],
                geocodedPosition: {
                    lat: locationDistancePosition?.lat || NaN,
                    lng: locationDistancePosition?.lng || NaN,
                    street: employeeProfile.street || '',
                    city: employeeProfile.city || '',
                    district: employeeProfile.district || '',
                    state: employeeProfile.state || '',
                    postcode: employeeProfile.postcode || '',
                    fullAddress: employeeProfile.fullAddress || '',
                },
                locationDistanceRadius: employeeProfile.pointRadius ?? NaN
            },
            step4: {
                availabilityOption: employeeProfile.availabilityOption || EmployeeProfileAvailabilityOptions.ANYTIME,
                availabilityDateRanges: availabilityDateRanges
            }
        });

        initFormWithUserData()
    }, [employeeProfile, formRef]);



    const onSubmit = async (validateFn: () => Promise<boolean>) => {
        const confirmed = await confirm({
            title: 'employeeProfile.form.confirmTitle',
            message: 'employeeProfile.form.confirmSubmit',
            confirmText: 'common.confirm',
            cancelText: 'common.cancel'
        });
        if (!confirmed) return;

        const valid = await validateFn();
        if (!valid) {
            toast.error(t("employeeProfile.form.validationError"));
            return;
        }
        const form = formRef.watch();
        if (employeeProfile) {
            await updateEmployeeProfile(form);
            return;
        }
        try {
            setLoading(true);
            const result = await EmployeeProfileService.createEmployeeProfile(form);
            userCtx.initEmployeeProfile();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            toast.success(t("employeeProfile.form.submitSuccess"));
            navigate(Path.getEmployeeProfilePath(`${result.displayName}`), { replace: true });
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
            userCtx.initEmployeeProfile();
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            toast.success(t("employeeProfile.form.submitSuccess"));

            // navigate(Path.getEmployeeProfilePath(`${result.displayName}`), { replace: true });
        } catch (error) {
            console.error("Error updating employee profile:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDevFill = () => {
        formRef.setValue("step1.fullName", "Pawel Malek");
        formRef.setValue("step2.skills", ["ONE", "TWO"]);
        formRef.setValue("step2.certificates", ["ONE"]);
        formRef.setValue("step1.communicationLanguages", ["en", "pl"]);
    };

    if (loading) {
        return <Loading />;
    }

    const renderStepByKey = (stepKey: StepKey) => {
        switch (stepKey) {
            case 'step1':
                return <EmployeeProfileStep1 formRef={formRef} />;
            case 'step2':
                return <EmployeeProfileStep2 formRef={formRef} initPosition={resetPositionFormData} />;
            case 'step3':
                return <EmployeeProfileStep3 formRef={formRef} />;
            case 'step4':
                return <EmployeeProfileStep4 formRef={formRef} />;
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

export default EmployeeProfileFormView;
