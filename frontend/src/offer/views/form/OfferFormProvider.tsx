import { OfferForm, OFFER_STEPS_ORDER, OfferFormStep, OfferFormSteps } from "@shared/interfaces/OfferI";
import { Util } from "@shared/utils/util";
import { createContext, useContext, useEffect } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const LOCAL_STORAGE_KEY = 'offerFormDraft';

const OfferFormContext = createContext<OfferFormProps | undefined>(undefined);

const defaultNewForm = (): OfferForm => ({
    currentStep: OfferFormSteps.STEP_ONE,
    STEP_ONE: {
        category: null,
        locationCountry: null,
        availableSlots: null
    }
})

const saveFormToLocalStorage = (form: OfferForm) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(form));
}

const removeFormFromLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
}



const getFromLocalStorage = (): OfferForm | null => {
    const savedForm = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedForm) {
        try {
            const parsedForm = JSON.parse(savedForm) as OfferForm;
            const revivedForm = Util.reviveDatesDeep(parsedForm);
            return revivedForm;
        } catch (e) {
            console.error("Failed to parse saved offer form from localStorage:", e);
            return null;
        }
    }
    return null;
}

export const useOfferForm = () => {
    const ctx = useContext(OfferFormContext);
    if (!ctx) throw new Error("useOfferForm must be used within OfferFormProvider");
    return ctx;
}

export interface OfferFormProps {
    form: OfferForm;
    formCtx: UseFormReturn<OfferForm>;
    nextStep: () => Promise<void>;
    prevStep: () => void;
    selectStep: (targetStep: OfferFormStep) => Promise<void>;
    removeFormFromLocalStorage: () => void;
}

const OfferFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { t } = useTranslation();
    const formCtx = useForm<OfferForm>({ defaultValues: defaultNewForm() });
    const form = formCtx.watch();

    useEffect(() => {
        const savedForm = getFromLocalStorage();
        if (savedForm) {
            formCtx.reset(savedForm);
        }
    }, [])

    const validateStep = async (step: OfferFormStep): Promise<boolean> => {
        const result = await formCtx.trigger(step);
        if (!result) {
            toast.error(t("employeeProfile.form.validationError"));
        }
        return result;
    }

    const validateCurrentStep = async (): Promise<boolean> => {
        return validateStep(form.currentStep);
    }

    const nextStep = async () => {
        const isValid = await validateCurrentStep();
        if (isValid) {
            saveFormToLocalStorage(form);
            const currentIndex = OFFER_STEPS_ORDER.indexOf(form.currentStep);
            if (currentIndex < OFFER_STEPS_ORDER.length - 1) {
                setCurrentStep(OFFER_STEPS_ORDER[currentIndex + 1]);
            }
        }
    };

    const prevStep = () => {
        saveFormToLocalStorage(form);
        const currentIndex = OFFER_STEPS_ORDER.indexOf(form.currentStep);
        if (currentIndex > 0) {
            setCurrentStep(OFFER_STEPS_ORDER[currentIndex - 1]);
        }
    };

    const selectStep = async (targetStep: OfferFormStep) => {
        const targetIndex = OFFER_STEPS_ORDER.indexOf(targetStep);
        const currentIndex = OFFER_STEPS_ORDER.indexOf(form.currentStep);
          if (targetIndex < currentIndex) {
            // Going back - no validation needed
            setCurrentStep(targetStep);
        } else if (targetIndex > currentIndex) {
            // Going forward - validate current step
            const isValid = await validateCurrentStep();
            if (isValid) {
                saveFormToLocalStorage(form);
                setCurrentStep(targetStep);
            }
        }
    }

    const setCurrentStep = (step: OfferFormStep) => {
        formCtx.setValue("currentStep", step);
    }

    return (
        <OfferFormContext.Provider value={{
            form,
            formCtx,
            nextStep,
            prevStep,
            selectStep,
            removeFormFromLocalStorage
        }}>{children}</OfferFormContext.Provider>
    );
};

export default OfferFormProvider;